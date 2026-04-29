#!/usr/bin/env python3
"""
BiruniMap Event Sync — full pipeline
Run this whenever you want to refresh events:

    python events/database/run.py

What it does:
  1. Scrapes Eventbrite for 'iranian' and 'persian' events across 15 countries
  2. Keeps only future events (start_date >= today)
  3. Geocodes each unique city via Nominatim (free, no API key)
  4. Merges with all existing SQL seed files in events/database/
  5. Deduplicates by (title, start_date)
  6. Writes a fresh master_events.sql ready to import in phpMyAdmin

Requires: pip install requests
"""

import re, sys, time, json, requests
from datetime import date
from pathlib import Path

HERE = Path(__file__).parent
TODAY = str(date.today())

# ── Config ────────────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

COUNTRY_SLUGS = [
    "united-states", "canada", "united-kingdom", "germany", "australia",
    "sweden", "netherlands", "france", "turkey", "united-arab-emirates",
    "austria", "denmark", "norway", "switzerland", "belgium",
]

# Only targeted keywords — Eventbrite returns real Iranian events for these
KEYWORDS = ["iranian", "persian"]

MAX_PAGES = 10  # max pages per keyword/country combo

TAG_TYPE_MAP = {
    "Music":                  "concert",
    "Performing & Visual Arts": "show",
    "Arts":                   "show",
    "Sports & Fitness":       "sports",
    "Community & Culture":    "party",
    "Culture":                "party",
    "Festivals":              "party",
    "Spirituality":           "party",
    "Religion":               "party",
    "Food & Drink":           "party",
}

# Seed files to merge (in priority order — first file wins on duplicates)
SEED_FILES = [
    HERE / "master_events.sql",
    HERE / "volek_events.sql",
    HERE / "ai_events.sql",
    HERE / "websites_events.sql",
    HERE / "switzerland_seed.sql",
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def log(msg):
    print(msg, flush=True)

def esc(v):
    if v is None:
        return "NULL"
    s = str(v).replace("'", "''").replace("\\", "\\\\")
    return f"'{s}'"

def parse_csv_row(row):
    parts, current, in_quote, i = [], '', False, 0
    while i < len(row):
        ch = row[i]
        if ch == "'" and not in_quote:
            in_quote = True; current += ch
        elif ch == "'" and in_quote:
            if i + 1 < len(row) and row[i+1] == "'":
                current += "''"; i += 2; continue
            in_quote = False; current += ch
        elif ch == ',' and not in_quote:
            parts.append(current.strip()); current = ''
        else:
            current += ch
        i += 1
    parts.append(current.strip())
    return parts

def unesc(s):
    s = s.strip()
    if s == 'NULL': return None
    if s.startswith("'") and s.endswith("'"):
        return s[1:-1].replace("''", "'")
    return s

def extract_rows_from_sql(filepath):
    try:
        content = filepath.read_text(encoding='utf-8')
    except FileNotFoundError:
        return []
    try:
        start = content.index('VALUES\n') + len('VALUES\n')
    except ValueError:
        return []
    block = content[start:].rstrip()
    block = re.sub(r';\s*COMMIT.*$', '', block, flags=re.DOTALL).rstrip().rstrip(';').rstrip()
    rows = block.split(',\n  (')
    fixed = [rows[0].strip()] + ['  (' + r.strip() for r in rows[1:]]
    return [r for r in fixed if r.strip()]

# ── Step 1: Scrape Eventbrite ─────────────────────────────────────────────────

def map_event_type(tags):
    for t in tags:
        n = t.get("display_name", "")
        if n in TAG_TYPE_MAP:
            return TAG_TYPE_MAP[n]
    return "other"

def parse_eb_event(ev):
    eb_id = ev.get("eventbrite_event_id") or ev.get("eid")
    title = (ev.get("name") or "").strip()
    if not title or not eb_id or ev.get("is_cancelled"):
        return None
    city = country = region = ""
    for loc in ev.get("locations") or []:
        t = loc.get("type")
        if t == "locality":   city    = loc["name"]
        elif t == "country":  country = loc["name"]
        elif t == "region":   region  = loc["name"]
    if not city and region:
        city = region
    start = (ev.get("start_date") or "")[:16]
    end   = (ev.get("end_date") or start)[:16]
    if not start:
        return None
    def fmt(d): return d + ":00" if len(d) == 16 else d + " 00:00:00"
    return {
        "title":         title,
        "event_type":    map_event_type(ev.get("tags") or []),
        "country":       country or None,
        "city":          city or None,
        "start_date":    fmt(start),
        "end_date":      fmt(end),
        "description":   (ev.get("summary") or "").strip() or None,
        "external_link": ev.get("url") or ev.get("tickets_url"),
        "cover_image":   (ev.get("image") or {}).get("url"),
    }

def scrape_eventbrite():
    log("── Step 1: Scraping Eventbrite ──────────────────────────────────────")
    all_events = {}
    for keyword in KEYWORDS:
        for slug in COUNTRY_SLUGS:
            log(f"  {keyword}/{slug}")
            for page in range(1, MAX_PAGES + 1):
                try:
                    r = requests.get(
                        f"https://www.eventbrite.com/d/{slug}/{keyword}/?page={page}",
                        headers=HEADERS, timeout=20,
                    )
                    if r.status_code != 200:
                        break
                    idx = r.text.find("window.__SERVER_DATA__ = ")
                    if idx == -1:
                        break
                    d, _ = json.JSONDecoder().raw_decode(r.text, idx + len("window.__SERVER_DATA__ = "))
                    ev_data = d["search_data"]["events"]
                    results = ev_data.get("results", [])
                    total   = ev_data.get("pagination", {}).get("page_count", 1)
                    for ev in results:
                        p = parse_eb_event(ev)
                        if p and p["start_date"] >= TODAY:
                            key = p["title"].lower() + "|" + p["start_date"][:10]
                            all_events[key] = p
                    log(f"    page {page}/{total}: {len(results)} fetched, {len(all_events)} unique future total")
                    if page >= total:
                        break
                    time.sleep(1.5)
                except Exception as e:
                    log(f"    error: {e}")
                    break
            time.sleep(1)
    log(f"  → {len(all_events)} unique future events from Eventbrite")
    return list(all_events.values())

# ── Step 2: Geocode ───────────────────────────────────────────────────────────

_geo_cache = {}

def geocode(city, country):
    key = f"{city},{country}"
    if key in _geo_cache:
        return _geo_cache[key]
    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": f"{city}, {country}", "format": "json", "limit": 1},
            headers={"User-Agent": "BiruniMap/1.0 (birunimap.com)"},
            timeout=10,
        )
        res = r.json()
        if res:
            result = (float(res[0]["lat"]), float(res[0]["lon"]))
            _geo_cache[key] = result
            time.sleep(1.1)
            return result
    except Exception as e:
        log(f"    geocode error {key}: {e}")
    _geo_cache[key] = None
    return None

def geocode_events(events):
    log("── Step 2: Geocoding cities ──────────────────────────────────────────")
    city_keys = set()
    for ev in events:
        if ev.get("city") and ev.get("country"):
            city_keys.add((ev["city"], ev["country"]))
    log(f"  {len(city_keys)} unique cities to geocode")
    coords = {}
    for city, country in city_keys:
        coords[(city, country)] = geocode(city, country)
    for ev in events:
        c = coords.get((ev.get("city"), ev.get("country")))
        ev["lat"] = c[0] if c else None
        ev["lng"] = c[1] if c else None
    log(f"  → done")
    return events

# ── Step 3: Convert Eventbrite events to SQL rows ─────────────────────────────

def events_to_rows(events):
    rows = []
    for ev in events:
        lat_v = str(ev["lat"]) if ev.get("lat") is not None else "NULL"
        lng_v = str(ev["lng"]) if ev.get("lng") is not None else "NULL"
        row = (
            f"  ({esc(ev['title'])}, NULL, {esc(ev['event_type'])}, "
            f"{esc(ev['country'])}, {esc(ev['city'])}, NULL, NULL, "
            f"{lat_v}, {lng_v}, "
            f"{esc(ev['start_date'])}, {esc(ev['end_date'])}, 0, NULL, "
            f"{esc(ev['description'])}, {esc(ev['external_link'])}, "
            f"NULL, NULL, 'approved')"
        )
        rows.append(row)
    return rows

# ── Step 4: Merge + deduplicate ───────────────────────────────────────────────

def merge_all(new_rows):
    log("── Step 4: Merging all sources ───────────────────────────────────────")
    seen = {}
    ordered = []

    def add_rows(rows, label):
        added = skipped = 0
        for row in rows:
            inner = row.strip().lstrip('(').rstrip(')')
            parts = parse_csv_row(inner)
            if len(parts) < 10:
                continue
            title      = (unesc(parts[0]) or "").strip().lower()
            start_date = (unesc(parts[9]) or "")[:10]
            # Skip past events from seed files too
            if start_date and start_date < TODAY:
                skipped += 1
                continue
            key = f"{title}|{start_date}"
            if key not in seen:
                seen[key] = True
                clean = row.strip()
                if not clean.startswith('('):
                    clean = '(' + clean
                if not clean.endswith(')'):
                    clean = clean + ')'
                ordered.append('  ' + clean)
                added += 1
            else:
                skipped += 1
        log(f"  {label}: +{added} new, {skipped} skipped")

    # Existing seed files first (they have curated data — higher priority)
    for path in SEED_FILES:
        if path.name == "master_events.sql":
            continue  # skip old master — we're rebuilding it
        rows = extract_rows_from_sql(path)
        add_rows(rows, path.name)

    # New Eventbrite rows last
    add_rows(new_rows, "eventbrite (new)")

    log(f"  → {len(ordered)} total unique future events")
    return ordered

# ── Step 5: Write master_events.sql ──────────────────────────────────────────

def write_master(rows):
    log("── Step 5: Writing master_events.sql ────────────────────────────────")
    out_path = HERE / "master_events.sql"
    header = f"""-- BiruniMap Master Events — ALL SOURCES COMBINED
-- Generated: {TODAY}
-- Total events: {len(rows)}
-- Safe to re-run: INSERT IGNORE skips existing rows

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Fix charset on existing table so Persian text stores correctly (safe to re-run)
ALTER TABLE events CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO events
  (title, title_fa, event_type, country, city, venue, address, lat, lng,
   start_date, end_date, is_recurring, recurrence_type, description, external_link,
   organizer_name, organizer_email, status)
VALUES
"""
    sql = header + ",\n".join(rows) + ";\n\nCOMMIT;\n"
    out_path.write_text(sql, encoding='utf-8')
    log(f"  → saved to {out_path}")
    log(f"  → {len(rows)} events total")

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    log(f"=== BiruniMap Event Sync — {TODAY} ===\n")
    eb_events  = scrape_eventbrite()
    eb_events  = geocode_events(eb_events)
    new_rows   = events_to_rows(eb_events)
    all_rows   = merge_all(new_rows)
    write_master(all_rows)
    log("\n=== Done! Import events/database/master_events.sql into phpMyAdmin ===")
