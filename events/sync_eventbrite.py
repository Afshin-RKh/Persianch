#!/usr/bin/env python3
"""
Eventbrite → BiruniMap event sync
Runs every 12 hours via cron:
  0 */12 * * * /usr/bin/python3 /path/to/events/sync_eventbrite.py >> /path/to/events/sync.log 2>&1
"""

import os, sys, json, time, logging
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
    import pymysql
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Missing package: {e}. Run: pip3 install requests pymysql python-dotenv")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────

load_dotenv(Path(__file__).parent / ".env")

EVENTBRITE_TOKEN = os.environ["EVENTBRITE_TOKEN"]
DB_HOST     = os.environ["DB_HOST"]
DB_NAME     = os.environ["DB_NAME"]
DB_USER     = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]

# Keywords to search — covers Iranian/Persian community events worldwide
KEYWORDS = [
    "Iranian", "Persian", "Nowruz", "Norooz", "Farsi",
    "Yalda", "Eid Iranian", "Chaharshanbe Souri",
]

# Eventbrite category IDs to focus on (optional — remove to search all)
# 103 = Music, 110 = Food & Drink, 105 = Arts, 108 = Sports, etc.
# Leave empty to search across all categories
CATEGORIES = []

HEADERS = {"Authorization": f"Bearer {EVENTBRITE_TOKEN}"}
BASE_URL = "https://www.eventbriteapi.com/v3"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# ── Eventbrite helpers ────────────────────────────────────────────────────────

def search_events(keyword: str, page: int = 1) -> dict:
    params = {
        "q": keyword,
        "expand": "venue,organizer",
        "page": page,
        "page_size": 50,
        "start_date.range_start": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    r = requests.get(f"{BASE_URL}/events/search/", headers=HEADERS, params=params, timeout=15)
    r.raise_for_status()
    return r.json()


def fetch_all_for_keyword(keyword: str) -> list:
    results = []
    page = 1
    while True:
        try:
            data = search_events(keyword, page)
        except Exception as e:
            log.warning(f"Eventbrite error for '{keyword}' page {page}: {e}")
            break

        events = data.get("events", [])
        results.extend(events)

        pagination = data.get("pagination", {})
        if pagination.get("page_number", 1) >= pagination.get("page_count", 1):
            break
        page += 1
        time.sleep(0.3)  # be polite to the API

    return results


def map_event_type(eb_category: str) -> str:
    mapping = {
        "103": "concert",
        "105": "art_exhibition",
        "108": "sports",
        "110": "food_culture",
        "113": "conference",
        "115": "conference",
    }
    return mapping.get(str(eb_category), "other")


def parse_event(ev: dict) -> dict | None:
    """Convert Eventbrite event dict to our DB row format. Returns None to skip."""
    try:
        eb_id    = ev.get("id", "")
        title    = (ev.get("name") or {}).get("text", "").strip()
        desc     = (ev.get("description") or {}).get("text", "").strip()[:2000]
        start    = (ev.get("start") or {}).get("utc", "")
        end      = (ev.get("end") or {}).get("utc", "")
        url      = ev.get("url", "")
        image    = (ev.get("logo") or {}).get("url", None)
        cat_id   = (ev.get("category_id") or "")

        if not title or not start or not end:
            return None

        # Venue
        venue_obj = ev.get("venue") or {}
        venue     = venue_obj.get("name", "")
        address   = (venue_obj.get("address") or {}).get("localized_address_display", "")
        city      = (venue_obj.get("address") or {}).get("city", "")
        country   = (venue_obj.get("address") or {}).get("country", "")  # 2-letter code
        lat_raw   = (venue_obj.get("address") or {}).get("latitude")
        lng_raw   = (venue_obj.get("address") or {}).get("longitude")
        lat       = float(lat_raw) if lat_raw else None
        lng       = float(lng_raw) if lng_raw else None

        # Convert 2-letter country code to full name
        country = COUNTRY_CODES.get(country.upper(), country)

        # Organizer
        org       = ev.get("organizer") or {}
        org_name  = org.get("name", "")

        return {
            "external_id":      f"eventbrite_{eb_id}",
            "title":            title,
            "description":      desc or None,
            "event_type":       map_event_type(cat_id),
            "country":          country,
            "city":             city,
            "address":          address or None,
            "venue":            venue or None,
            "lat":              lat,
            "lng":              lng,
            "start_date":       start[:19].replace("T", " "),
            "end_date":         end[:19].replace("T", " "),
            "is_recurring":     0,
            "external_link":    url or None,
            "cover_image":      image or None,
            "organizer_name":   org_name or None,
            "status":           "approved",
            "source":           "eventbrite",
        }
    except Exception as e:
        log.warning(f"Failed to parse event {ev.get('id')}: {e}")
        return None


# ── DB helpers ────────────────────────────────────────────────────────────────

def get_db():
    return pymysql.connect(
        host=DB_HOST, db=DB_NAME, user=DB_USER, password=DB_PASSWORD,
        charset="utf8mb4", cursorclass=pymysql.cursors.DictCursor,
    )


def ensure_columns(conn):
    """Add external_id and source columns if they don't exist yet."""
    with conn.cursor() as cur:
        cur.execute("SHOW COLUMNS FROM events LIKE 'external_id'")
        if not cur.fetchone():
            cur.execute("ALTER TABLE events ADD COLUMN external_id VARCHAR(100) NULL UNIQUE")
            log.info("Added external_id column to events table")
        cur.execute("SHOW COLUMNS FROM events LIKE 'source'")
        if not cur.fetchone():
            cur.execute("ALTER TABLE events ADD COLUMN source VARCHAR(50) NULL DEFAULT NULL")
            log.info("Added source column to events table")
    conn.commit()


def upsert_event(conn, ev: dict) -> str:
    """Insert event if external_id not already in DB. Returns 'inserted' or 'skipped'."""
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM events WHERE external_id = %s", (ev["external_id"],))
        if cur.fetchone():
            return "skipped"

        cur.execute("""
            INSERT INTO events
              (external_id, title, description, event_type, country, city, address,
               venue, lat, lng, start_date, end_date, is_recurring,
               external_link, cover_image, organizer_name, status, source, submitted_by)
            VALUES
              (%(external_id)s, %(title)s, %(description)s, %(event_type)s, %(country)s,
               %(city)s, %(address)s, %(venue)s, %(lat)s, %(lng)s, %(start_date)s,
               %(end_date)s, %(is_recurring)s, %(external_link)s, %(cover_image)s,
               %(organizer_name)s, %(status)s, %(source)s, NULL)
        """, ev)
    conn.commit()
    return "inserted"


# ── Country code → name map ───────────────────────────────────────────────────

COUNTRY_CODES = {
    "AF":"Afghanistan","AL":"Albania","DZ":"Algeria","AD":"Andorra","AO":"Angola",
    "AR":"Argentina","AM":"Armenia","AU":"Australia","AT":"Austria","AZ":"Azerbaijan",
    "BH":"Bahrain","BD":"Bangladesh","BY":"Belarus","BE":"Belgium","BZ":"Belize",
    "BJ":"Benin","BT":"Bhutan","BO":"Bolivia","BA":"Bosnia and Herzegovina",
    "BW":"Botswana","BR":"Brazil","BN":"Brunei","BG":"Bulgaria","BF":"Burkina Faso",
    "CA":"Canada","CM":"Cameroon","CV":"Cape Verde","CF":"Central African Republic",
    "TD":"Chad","CL":"Chile","CO":"Colombia","KM":"Comoros","CG":"Congo",
    "CD":"Democratic Republic of Congo","CR":"Costa Rica","HR":"Croatia","CU":"Cuba",
    "CY":"Cyprus","CZ":"Czech Republic","DK":"Denmark","DJ":"Djibouti",
    "DO":"Dominican Republic","EC":"Ecuador","EG":"Egypt","SV":"El Salvador",
    "GQ":"Equatorial Guinea","ER":"Eritrea","EE":"Estonia","ET":"Ethiopia",
    "FJ":"Fiji","FI":"Finland","FR":"France","GA":"Gabon","GM":"Gambia",
    "GE":"Georgia","DE":"Germany","GH":"Ghana","GR":"Greece","GT":"Guatemala",
    "GN":"Guinea","GW":"Guinea-Bissau","GY":"Guyana","HT":"Haiti","HN":"Honduras",
    "HU":"Hungary","IS":"Iceland","IN":"India","ID":"Indonesia","IQ":"Iraq",
    "IE":"Ireland","IL":"Israel","IT":"Italy","JM":"Jamaica","JP":"Japan",
    "JO":"Jordan","KZ":"Kazakhstan","KE":"Kenya","KW":"Kuwait","KG":"Kyrgyzstan",
    "LA":"Laos","LV":"Latvia","LB":"Lebanon","LS":"Lesotho","LR":"Liberia",
    "LY":"Libya","LI":"Liechtenstein","LT":"Lithuania","LU":"Luxembourg",
    "MG":"Madagascar","MW":"Malawi","MY":"Malaysia","MV":"Maldives","ML":"Mali",
    "MT":"Malta","MR":"Mauritania","MU":"Mauritius","MX":"Mexico","MD":"Moldova",
    "MC":"Monaco","MN":"Mongolia","ME":"Montenegro","MA":"Morocco","MZ":"Mozambique",
    "NA":"Namibia","NP":"Nepal","NL":"Netherlands","NZ":"New Zealand","NI":"Nicaragua",
    "NE":"Niger","NG":"Nigeria","MK":"North Macedonia","NO":"Norway","OM":"Oman",
    "PK":"Pakistan","PA":"Panama","PG":"Papua New Guinea","PY":"Paraguay","PE":"Peru",
    "PH":"Philippines","PL":"Poland","PT":"Portugal","PR":"Puerto Rico","QA":"Qatar",
    "RO":"Romania","RW":"Rwanda","SM":"San Marino","SA":"Saudi Arabia","SN":"Senegal",
    "RS":"Serbia","SL":"Sierra Leone","SK":"Slovakia","SI":"Slovenia","SO":"Somalia",
    "ZA":"South Africa","SS":"South Sudan","ES":"Spain","LK":"Sri Lanka","SD":"Sudan",
    "SR":"Suriname","SE":"Sweden","CH":"Switzerland","SY":"Syria","TW":"Taiwan",
    "TJ":"Tajikistan","TZ":"Tanzania","TH":"Thailand","TL":"East Timor","TG":"Togo",
    "TT":"Trinidad and Tobago","TN":"Tunisia","TR":"Turkey","TM":"Turkmenistan",
    "UG":"Uganda","UA":"Ukraine","AE":"United Arab Emirates","GB":"United Kingdom",
    "US":"United States","UY":"Uruguay","UZ":"Uzbekistan","VE":"Venezuela",
    "YE":"Yemen","ZM":"Zambia","ZW":"Zimbabwe","PS":"Palestine","XK":"Kosovo",
}


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    log.info("=== Eventbrite sync started ===")
    conn = get_db()
    ensure_columns(conn)

    all_events: dict[str, dict] = {}  # keyed by external_id to deduplicate across keywords

    for keyword in KEYWORDS:
        log.info(f"Fetching keyword: '{keyword}'")
        raw = fetch_all_for_keyword(keyword)
        log.info(f"  → {len(raw)} results")
        for ev in raw:
            parsed = parse_event(ev)
            if parsed:
                all_events[parsed["external_id"]] = parsed

    log.info(f"Total unique events after dedup: {len(all_events)}")

    inserted = skipped = 0
    for ev in all_events.values():
        result = upsert_event(conn, ev)
        if result == "inserted":
            inserted += 1
            log.info(f"  + {ev['title'][:60]} ({ev['country']})")
        else:
            skipped += 1

    conn.close()
    log.info(f"Done — inserted: {inserted}, skipped (already existed): {skipped}")
    log.info("=== Sync complete ===")


if __name__ == "__main__":
    main()
