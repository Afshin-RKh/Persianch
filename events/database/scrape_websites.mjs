/**
 * scrape_websites.mjs
 *
 * Fetches HTML from the 8 known Persian-event ticket sites, sends
 * the cleaned text to Groq for structured parsing, deduplicates,
 * geocodes, and writes websites_found.json + websites_events.sql.
 *
 * Usage:  node scrape_websites.mjs
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const KEYS_FILE  = path.join(__dirname, "../../database/groq_keys.json");
const FOUND_FILE = path.join(__dirname, "websites_found.json");
const SQL_FILE   = path.join(__dirname, "websites_events.sql");

// ── Keys ──────────────────────────────────────────────────────────────────────

const KEYS = JSON.parse(fs.readFileSync(KEYS_FILE, "utf8"));
if (!KEYS.length) { console.error("No keys in groq_keys.json"); process.exit(1); }
console.log(`Loaded ${KEYS.length} Groq keys`);

let keyIdx = 0;
function nextKey() { const k = KEYS[keyIdx % KEYS.length]; keyIdx++; return k; }

// ── City → Country map (same as scrape_ai.mjs) ────────────────────────────────

const CITY_MAP = {};
for (const [cities, country] of [
  [["London","Manchester","Liverpool","Birmingham","Glasgow","Edinburgh","Newcastle","Leeds","Bristol","Sheffield"], "United Kingdom"],
  [["Berlin","Hamburg","Munich","Frankfurt","Cologne","Bremen","Dresden","Düsseldorf","Hannover","Stuttgart","Leipzig","Nuremberg"], "Germany"],
  [["Paris","Lyon","Marseille","Nice","Bordeaux","Strasbourg"], "France"],
  [["Vienna","Graz","Linz","Salzburg","Innsbruck"], "Austria"],
  [["Amsterdam","Rotterdam","Utrecht","The Hague","Eindhoven"], "Netherlands"],
  [["Stockholm","Gothenburg","Göteborg","Malmö"], "Sweden"],
  [["Copenhagen","Aarhus"], "Denmark"],
  [["Oslo","Bergen"], "Norway"],
  [["Zurich","Geneva","Basel","Bern","Lausanne"], "Switzerland"],
  [["Toronto","Vancouver","Montreal","Calgary","Ottawa","Edmonton","Winnipeg"], "Canada"],
  [["New York","Los Angeles","Chicago","Houston","Dallas","San Jose","Seattle","Miami","Boston","Washington","San Diego","San Francisco","Phoenix","Denver","Atlanta","Las Vegas","Minneapolis","Portland","Sacramento"], "United States"],
  [["Melbourne","Sydney","Brisbane","Perth","Adelaide"], "Australia"],
  [["Dubai","Abu Dhabi","Sharjah"], "United Arab Emirates"],
  [["Istanbul","Ankara"], "Turkey"],
  [["Brussels","Antwerp","Ghent"], "Belgium"],
  [["Helsinki"], "Finland"],
  [["Dublin"], "Ireland"],
  [["Madrid","Barcelona"], "Spain"],
  [["Rome","Milan"], "Italy"],
  [["Gothenburg"], "Sweden"],
]) for (const c of cities) CITY_MAP[c.toLowerCase()] = { city: c, country };

function resolveCity(cityRaw, countryRaw) {
  if (!cityRaw) return { city: null, country: countryRaw ?? null };
  const hit = CITY_MAP[cityRaw.toLowerCase()];
  if (hit) return hit;
  // try partial match
  for (const [k, v] of Object.entries(CITY_MAP)) {
    if (cityRaw.toLowerCase().includes(k) || k.includes(cityRaw.toLowerCase())) return v;
  }
  return { city: cityRaw, country: countryRaw ?? null };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function esc(v) {
  if (v === null || v === undefined) return "NULL";
  return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

function fmt(d) {
  if (!d || isNaN(new Date(d).getTime())) return null;
  const dt = new Date(d);
  const p = n => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth()+1)}-${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}:00`;
}

function isFuture(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) > new Date();
}

function guessType(title = "", desc = "") {
  const t = (title + " " + desc).toLowerCase();
  if (/concert|live|music|band|singer|artist|rap|pop|rock|کنسرت/.test(t))   return "concert";
  if (/theatre|theater|play|drama|نمایش/.test(t))                            return "theatre";
  if (/dance|tango|salsa|رقص/.test(t))                                       return "dance_class";
  if (/protest|demonstration|rally|march|تظاهرات/.test(t))                  return "protest";
  if (/class|workshop|language|course|آموزش/.test(t))                       return "language_class";
  if (/food|dinner|brunch|restaurant|cuisine|غذا/.test(t))                  return "food_culture";
  if (/art|exhibition|gallery|نمایشگاه/.test(t))                             return "art_exhibition";
  if (/sport|soccer|football|volleyball/.test(t))                           return "sports";
  if (/norouz|nowruz|yalda|chaharshanbe|persian new|eid|نوروز|یلدا/.test(t)) return "religious_cultural";
  if (/party|gala|celebration|festival|night|جشن/.test(t))                 return "party";
  if (/comedy|comedian|stand.?up|show/.test(t))                             return "conference";
  if (/conference|summit|lecture|panel|seminar|کنفرانس/.test(t))            return "conference";
  return "other";
}

async function geocode(venue, city, country) {
  const q = [venue, city, country].filter(Boolean).join(", ");
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { "User-Agent": "BiruniMap/1.0" } });
    const d = await r.json();
    if (d[0]) return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
    const r2 = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent([city,country].filter(Boolean).join(", "))}&format=json&limit=1`,
      { headers: { "User-Agent": "BiruniMap/1.0" } });
    const d2 = await r2.json();
    if (d2[0]) return { lat: parseFloat(d2[0].lat), lng: parseFloat(d2[0].lon) };
  } catch { /* non-fatal */ }
  return { lat: null, lng: null };
}

function parseJson(text) {
  // Try fenced block first
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const m = raw.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (!m) return [];
  try { return JSON.parse(m[0]); } catch { return []; }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s{3,}/g, "\n\n")
    .trim();
}

// ── Fetch a URL and return clean text (max 12 000 chars) ──────────────────────

async function fetchPage(url, label) {
  const H = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
  };
  try {
    const r = await fetch(url, { headers: H });
    if (!r.ok) { console.log(`  ${label}: HTTP ${r.status}`); return null; }
    const html = await r.text();
    const text = stripHtml(html);
    console.log(`  ${label}: fetched ${text.length} chars`);
    return text.slice(0, 9000);
  } catch (e) {
    console.log(`  ${label}: fetch error — ${e.message}`);
    return null;
  }
}

// ── Ask Groq to extract events from page text ─────────────────────────────────

async function groqParse(pageText, siteUrl, label, retries = 0) {
  const key = nextKey();
  const today = new Date().toISOString().slice(0, 10);

  const prompt = `Today is ${today}. The following is the text content of a Persian/Iranian event ticket website: ${siteUrl}

Extract ALL upcoming events (start_date after ${today}) from the text below.
Return ONLY a JSON array — no markdown fences, no explanation. Each item MUST have:
{
  "title": "event name in English",
  "title_fa": "Persian/Farsi title or null",
  "event_type": "concert|theatre|dance_class|protest|language_class|food_culture|art_exhibition|sports|religious_cultural|party|conference|other",
  "city": "city name",
  "country": "country name",
  "venue": "venue name or null",
  "address": "full address or null",
  "start_date": "YYYY-MM-DD HH:MM:00",
  "end_date": "YYYY-MM-DD HH:MM:00 or null",
  "description": "max 300 chars or null",
  "external_link": "ticket/event URL or null",
  "organizer_name": "organizer or null"
}

Rules:
- Only include events with a confirmed future date (after ${today}).
- If only a date is shown (no time), use 20:00:00 as default start time.
- If the event is a comedy show, use event_type = "conference".
- If no future events found, return [].

Page text:
${pageText}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        model: "compound-beta-mini",
        temperature: 0.1,
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (res.status === 429) {
      if (retries < 4) { await sleep((retries + 1) * 6000); return groqParse(pageText, siteUrl, label, retries + 1); }
      console.log(`  ${label}: rate-limited, skipping`);
      return [];
    }
    // 401 = bad key, rotate and retry
    if (res.status === 401) {
      if (retries < KEYS.length) { await sleep(500); return groqParse(pageText, siteUrl, label, retries + 1); }
      console.log(`  ${label}: all keys rejected (401), skipping`);
      return [];
    }
    // 413 = payload too large, retry with truncated text
    if (res.status === 413) {
      const shorter = pageText.slice(0, Math.floor(pageText.length * 0.6));
      if (retries < 3 && shorter.length > 500) { await sleep(1000); return groqParse(shorter, siteUrl, label, retries + 1); }
      console.log(`  ${label}: payload too large even after truncation, skipping`);
      return [];
    }
    if (!res.ok) { console.log(`  ${label}: Groq HTTP ${res.status}`); return []; }

    const data = await res.json();
    if (data.error) { console.log(`  ${label}: Groq error — ${data.error.message}`); return []; }

    const text = data.choices?.[0]?.message?.content ?? "";
    const events = parseJson(text);
    return events
      .filter(ev => ev.title && ev.start_date && isFuture(ev.start_date))
      .map(ev => {
        const loc = resolveCity(ev.city, ev.country);
        return {
          title:          ev.title,
          title_fa:       ev.title_fa ?? null,
          event_type:     ev.event_type || guessType(ev.title, ev.description ?? ""),
          city:           loc.city ?? ev.city ?? null,
          country:        loc.country ?? ev.country ?? null,
          venue:          ev.venue ?? null,
          address:        ev.address ?? null,
          start_date:     fmt(ev.start_date),
          end_date:       fmt(ev.end_date) ?? fmt(new Date(new Date(ev.start_date).getTime() + 3*3600*1000).toISOString()),
          description:    (ev.description ?? "").slice(0, 800) || null,
          external_link:  ev.external_link ?? siteUrl,
          organizer_name: ev.organizer_name ?? null,
          lat: null, lng: null,
          status: "approved",
        };
      });
  } catch (e) {
    if (retries < 2) { await sleep(3000); return groqParse(pageText, siteUrl, label, retries + 1); }
    console.log(`  ${label}: exception — ${e.message}`);
    return [];
  }
}

// ── SQL builder ───────────────────────────────────────────────────────────────

function buildSql(rows) {
  if (!rows.length) return null;
  return [
    "-- BiruniMap website-scraped events",
    `-- Generated: ${new Date().toISOString()}`,
    "-- Import via cPanel → phpMyAdmin → SQL tab",
    "-- Uses INSERT IGNORE to skip duplicates (requires unique index on title+start_date)",
    "",
    'SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";',
    'SET time_zone = "+00:00";',
    "/*!40101 SET NAMES utf8mb4 */;",
    "",
    "INSERT IGNORE INTO events",
    "  (title, title_fa, event_type, country, city, venue, address, lat, lng,",
    "   start_date, end_date, is_recurring, recurrence_type, description, external_link,",
    "   organizer_name, organizer_email, status)",
    "VALUES",
    rows.map(ev => `  (${[
      esc(ev.title), esc(ev.title_fa), esc(ev.event_type ?? "other"),
      esc(ev.country), esc(ev.city), esc(ev.venue), esc(ev.address),
      ev.lat ?? "NULL", ev.lng ?? "NULL",
      esc(ev.start_date), esc(ev.end_date), 0, "NULL",
      esc((ev.description ?? "").slice(0,800)||null), esc(ev.external_link),
      esc(ev.organizer_name), "NULL", esc(ev.status ?? "approved"),
    ].join(", ")})`).join(",\n"),
    ";",
  ].join("\n");
}

// ── Sites to scrape ───────────────────────────────────────────────────────────

const SITES = [
  { label: "EMH Productions",      url: "https://emhproductions.com/concerts/" },
  { label: "Volek Events",         url: "https://volek.events/events/" },
  { label: "Taablo Concerts",      url: "https://event.taablo.com/concert/" },
  { label: "Max Amini Shows",      url: "https://www.maxamini.com/shows" },
  { label: "Omid No Agenda",       url: "https://www.omidnoagenda.com/" },
  { label: "Maz Jobrani Live",     url: "https://www.mazjobrani.com/live/" },
  { label: "Negin Farsad Events",  url: "https://neginfarsad.com/events/" },
  { label: "Shadmehr Tour",        url: "https://www.shadmehrmusic.com/pages/tour" },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== BiruniMap Website Event Scraper ===");
  console.log(`Started: ${new Date().toISOString()}\n`);

  const seen  = new Set();
  const all   = [];
  const stats = {};

  for (const { label, url } of SITES) {
    console.log(`\n── ${label} ──────────────────────────`);
    console.log(`   ${url}`);

    const text = await fetchPage(url, label);
    if (!text) { stats[label] = 0; continue; }

    await sleep(1000); // polite pause before hitting Groq

    const events = await groqParse(text, url, label);
    let added = 0;
    for (const ev of events) {
      const key = ((ev.title ?? "") + "|" + (ev.start_date ?? "")).toLowerCase().replace(/\s+/g,"");
      if (seen.has(key)) { console.log(`    dup: ${ev.title}`); continue; }
      seen.add(key);
      all.push(ev);
      added++;
    }
    stats[label] = added;
    console.log(`   → ${events.length} parsed, ${added} unique kept`);

    await sleep(2000); // polite pause between sites
  }

  // Geocode
  console.log(`\nGeocoding ${all.length} events...`);
  for (const ev of all) {
    await sleep(400);
    const { lat, lng } = await geocode(ev.venue, ev.city, ev.country);
    ev.lat = lat; ev.lng = lng;
  }

  // Save
  fs.writeFileSync(FOUND_FILE, JSON.stringify(all, null, 2), "utf8");
  console.log(`\nSaved JSON → ${FOUND_FILE}`);

  const sql = buildSql(all);
  if (sql) {
    fs.writeFileSync(SQL_FILE, sql, "utf8");
    console.log(`Saved SQL  → ${SQL_FILE}`);
  } else {
    console.log("No future events found.");
  }

  console.log(`\n=== Summary ===`);
  for (const [label, n] of Object.entries(stats)) console.log(`  ${label}: ${n}`);
  console.log(`  ─────────────────`);
  console.log(`  Total unique: ${all.length}`);
  if (sql) console.log(`\nImport ${SQL_FILE} via cPanel → phpMyAdmin → SQL tab.`);
}

main().catch(console.error);
