/**
 * scrape_ai.mjs
 *
 * Uses Groq compound-beta-mini (web search) with all 8 keys + volek.events
 * to find upcoming Persian/Iranian/Afghan events worldwide.
 *
 * Usage:  node scrape_ai.mjs
 *
 * Reads:  ../../database/groq_keys.json   (same keys used for businesses)
 * Output: ai_found.json  +  ai_events.sql
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const KEYS_FILE  = path.join(__dirname, "../../database/groq_keys.json");
const FOUND_FILE = path.join(__dirname, "ai_found.json");
const SQL_FILE   = path.join(__dirname, "ai_events.sql");

// ── Keys ──────────────────────────────────────────────────────────────────────

const KEYS = JSON.parse(fs.readFileSync(KEYS_FILE, "utf8"));
if (!KEYS.length) { console.error("No keys in groq_keys.json"); process.exit(1); }
console.log(`Loaded ${KEYS.length} Groq keys`);

// Simple round-robin key pool
let keyIdx = 0;
function nextKey() { const k = KEYS[keyIdx % KEYS.length]; keyIdx++; return k; }

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
  if (/concert|live|music|band|singer|artist|rap|pop|rock|کنسرت/.test(t))            return "concert";
  if (/theatre|theater|play|drama|نمایش/.test(t))                                     return "theatre";
  if (/dance|tango|salsa|رقص/.test(t))                                                return "dance_class";
  if (/protest|demonstration|rally|march|تظاهرات/.test(t))                           return "protest";
  if (/class|workshop|language|course|آموزش/.test(t))                                return "language_class";
  if (/food|dinner|brunch|restaurant|cuisine|غذا/.test(t))                           return "food_culture";
  if (/art|exhibition|gallery|نمایشگاه/.test(t))                                      return "art_exhibition";
  if (/sport|soccer|football|volleyball/.test(t))                                    return "sports";
  if (/norouz|nowruz|yalda|chaharshanbe|persian new|eid|نوروز|یلدا/.test(t))         return "religious_cultural";
  if (/party|gala|celebration|festival|night|جشن/.test(t))                          return "party";
  if (/conference|summit|lecture|panel|seminar|کنفرانس/.test(t))                     return "conference";
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
  const m = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (!m) return [];
  try { return JSON.parse(m[0]); } catch { return []; }
}

// ── Groq web search ───────────────────────────────────────────────────────────

async function groqSearch(country, city, retries = 0) {
  const key = nextKey();
  const today = new Date().toISOString().slice(0, 10);
  const prompt = `Search the web right now and find upcoming Persian, Iranian, and Afghan community events in ${city}, ${country} happening after ${today}.

Search for: "Persian events ${city}", "Iranian events ${city}", "Afghan events ${city}", "Iranian concert ${city}", "Nowruz ${city}", "کنسرت ${city} 2025 OR 2026", "Persian party ${city}", "Iranian cultural ${city}".

Return ONLY a JSON array — no markdown, no explanation. Each item:
{
  "title": "event name",
  "title_fa": "Persian title or null",
  "event_type": "concert|theatre|dance_class|protest|language_class|food_culture|art_exhibition|sports|religious_cultural|party|conference|other",
  "city": "${city}",
  "country": "${country}",
  "venue": "venue name or null",
  "address": "street address or null",
  "start_date": "YYYY-MM-DD HH:MM:00",
  "end_date": "YYYY-MM-DD HH:MM:00 or null",
  "description": "max 300 chars or null",
  "external_link": "URL or null",
  "organizer_name": "organizer or null"
}

Only include REAL events with a confirmed future date. If nothing found, return [].`;

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
      if (retries < 4) { await sleep((retries + 1) * 5000); return groqSearch(country, city, retries + 1); }
      return [];
    }
    if (!res.ok) return [];

    const data = await res.json();
    if (data.error) { console.log(`    ⚠ ${data.error.message}`); return []; }

    const text = data.choices?.[0]?.message?.content ?? "";
    const events = parseJson(text);
    return events
      .filter(ev => ev.title && ev.start_date && isFuture(ev.start_date))
      .map(ev => ({
        title:          ev.title,
        title_fa:       ev.title_fa ?? null,
        event_type:     ev.event_type || guessType(ev.title, ev.description ?? ""),
        city:           ev.city || city,
        country:        ev.country || country,
        venue:          ev.venue ?? null,
        address:        ev.address ?? null,
        start_date:     fmt(ev.start_date),
        end_date:       fmt(ev.end_date) ?? fmt(new Date(new Date(ev.start_date).getTime() + 3*3600*1000)),
        description:    (ev.description ?? "").slice(0, 800) || null,
        external_link:  ev.external_link ?? null,
        organizer_name: ev.organizer_name ?? null,
        lat: null, lng: null,
        status: "approved",
      }));
  } catch (e) {
    if (retries < 2) { await sleep(3000); return groqSearch(country, city, retries + 1); }
    return [];
  }
}

// ── volek.events direct scrape ────────────────────────────────────────────────

async function scrapeVolek() {
  console.log("\n── volek.events ─────────────────────────────────────────");
  const BASE = "https://volek.events";
  const H = { "User-Agent": "Mozilla/5.0 Chrome/124", "Accept": "text/html" };

  const CITY_MAP = {};
  for (const [cities, country] of [
    [["London","Manchester","Liverpool","Birmingham","Glasgow","Edinburgh"], "United Kingdom"],
    [["Berlin","Hamburg","Munich","Frankfurt","Cologne","Bremen","Dresden","Düsseldorf","Hannover","Stuttgart","Leipzig","Nuremberg"], "Germany"],
    [["Paris","Lyon","Marseille","Nice","Bordeaux","Strasbourg"], "France"],
    [["Vienna","Graz","Linz","Salzburg","Innsbruck"], "Austria"],
    [["Amsterdam","Rotterdam","Utrecht","The Hague","Eindhoven"], "Netherlands"],
    [["Stockholm","Gothenburg","Göteborg","Malmö"], "Sweden"],
    [["Copenhagen","Aarhus"], "Denmark"],
    [["Oslo","Bergen"], "Norway"],
    [["Zurich","Geneva","Basel","Bern","Lausanne"], "Switzerland"],
    [["Toronto","Vancouver","Montreal","Calgary","Ottawa"], "Canada"],
    [["New York","Los Angeles","Chicago","Houston","Dallas","San Jose","Seattle","Miami","Boston","Washington"], "United States"],
    [["Melbourne","Sydney","Brisbane","Perth"], "Australia"],
    [["Dubai","Abu Dhabi"], "United Arab Emirates"],
  ]) for (const c of cities) CITY_MAP[c.toLowerCase()] = { city: c, country };

  function parseDate(s) { if (!s) return null; const d = new Date(s.replace(/^[A-Za-z]+,\s*/,"").trim()); return isNaN(d.getTime()) ? null : d; }
  function cityFromTitle(t) { const m = t.match(/\bin\s+([A-ZÄÖÜ][A-Za-zäöüÄÖÜ\s\-]+?)(?:\s*[-–|,]|$)/); return m ? m[1].trim() : null; }

  const results = [];
  let page = 1;
  while (true) {
    const url = page === 1 ? `${BASE}/events/` : `${BASE}/events/page/${page}/`;
    let html;
    try { const r = await fetch(url, { headers: H }); if (!r.ok) break; html = await r.text(); } catch { break; }

    const re = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m, found = 0;
    while ((m = re.exec(html)) !== null) {
      const inner = m[2];
      if (!inner.includes("<h3")) continue;
      const h3 = inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
      const title = h3?.[1]?.replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").trim();
      if (!title) continue;
      const spans = [...inner.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/gi)].map(x=>x[1].replace(/<[^>]+>/g,"").trim()).filter(Boolean);
      const dateSpan  = spans.find(s=>/[A-Z][a-z]+,/.test(s)&&/\d{4}/.test(s));
      const venueSpan = spans.find(s=>s&&!/buy ticket|days? left|NEW|POSTPONED|\d+ days/i.test(s)&&s!==dateSpan);
      const sd = parseDate(dateSpan);
      if (!sd || !isFuture(sd.toISOString())) continue;
      const rawCity = cityFromTitle(title);
      const loc = (rawCity && CITY_MAP[rawCity.toLowerCase()]) ?? { city: rawCity ?? "Unknown", country: "Unknown" };
      const p = n=>String(n).padStart(2,"0");
      const fmtD = d=>`${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:00`;
      results.push({ title, title_fa: null, event_type: guessType(title), country: loc.country, city: loc.city,
        venue: venueSpan??null, address: null, start_date: fmtD(sd),
        end_date: fmtD(new Date(sd.getTime()+3*3600*1000)), description: null,
        external_link: m[1].startsWith("http")?m[1]:BASE+m[1], organizer_name: null, lat: null, lng: null, status: "approved" });
      found++;
    }
    console.log(`  Page ${page}: ${found} future events`);
    if (found===0||(!html.includes(`/events/page/${page+1}/`)&&!html.includes('rel="next"'))) break;
    page++;
    await sleep(1200);
  }

  for (const ev of results) { await sleep(400); const {lat,lng}=await geocode(ev.venue,ev.city,ev.country); ev.lat=lat; ev.lng=lng; }
  console.log(`  Total: ${results.length}`);
  return results;
}

// ── Cities to search ──────────────────────────────────────────────────────────

const CITIES = [
  ["United Kingdom",  "London"],
  ["United States",   "Los Angeles"],
  ["United States",   "New York"],
  ["United States",   "San Jose"],
  ["United States",   "Washington DC"],
  ["United States",   "Houston"],
  ["United States",   "Dallas"],
  ["United States",   "Seattle"],
  ["United States",   "Chicago"],
  ["United States",   "San Diego"],
  ["Canada",          "Toronto"],
  ["Canada",          "Vancouver"],
  ["Canada",          "Montreal"],
  ["Canada",          "Calgary"],
  ["Germany",         "Berlin"],
  ["Germany",         "Hamburg"],
  ["Germany",         "Munich"],
  ["Germany",         "Frankfurt"],
  ["Germany",         "Cologne"],
  ["Sweden",          "Stockholm"],
  ["Sweden",          "Gothenburg"],
  ["Sweden",          "Malmö"],
  ["Netherlands",     "Amsterdam"],
  ["France",          "Paris"],
  ["Austria",         "Vienna"],
  ["Switzerland",     "Zurich"],
  ["Switzerland",     "Geneva"],
  ["Norway",          "Oslo"],
  ["Denmark",         "Copenhagen"],
  ["Belgium",         "Brussels"],
  ["Australia",       "Melbourne"],
  ["Australia",       "Sydney"],
  ["United Arab Emirates", "Dubai"],
  ["Turkey",          "Istanbul"],
  ["United Kingdom",  "Manchester"],
  ["United Kingdom",  "Birmingham"],
];

// ── SQL builder ───────────────────────────────────────────────────────────────

function buildSql(rows) {
  if (!rows.length) return null;
  return [
    "-- BiruniMap AI-scraped events",
    `-- Generated: ${new Date().toISOString()}`,
    "-- Import via cPanel → phpMyAdmin → SQL tab",
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

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== BiruniMap AI Event Scraper ===");
  console.log(`Started: ${new Date().toISOString()}\n`);

  // Run volek and AI searches concurrently (volek is independent)
  const [volek] = await Promise.all([scrapeVolek()]);

  console.log(`\n── Groq Web Search (${KEYS.length} keys, ${CITIES.length} cities) ─────────────────`);

  const aiResults = [];
  const seen = new Set();

  // Process cities in batches of 4 (parallel per batch, one key each)
  const BATCH = 4;
  for (let i = 0; i < CITIES.length; i += BATCH) {
    const batch = CITIES.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(([country, city]) => groqSearch(country, city)));

    for (let j = 0; j < batch.length; j++) {
      const [country, city] = batch[j];
      const events = results[j];
      let count = 0;
      for (const ev of events) {
        const key = ((ev.title ?? "") + "|" + (ev.start_date ?? "")).toLowerCase().replace(/\s+/g,"");
        if (seen.has(key)) continue;
        seen.add(key);
        aiResults.push(ev);
        count++;
      }
      console.log(`  [${country}] ${city}: ${count} events`);
    }

    await sleep(1500); // pause between batches
  }

  // Geocode AI results
  console.log(`\nGeocoding ${aiResults.length} AI events...`);
  for (const ev of aiResults) {
    if (ev.lat && ev.lng) continue;
    await sleep(400);
    const { lat, lng } = await geocode(ev.venue, ev.city, ev.country);
    ev.lat = lat; ev.lng = lng;
  }

  // Final merge + dedup
  const finalSeen = new Set();
  const merged = [];
  for (const ev of [...volek, ...aiResults]) {
    const key = ((ev.title ?? "") + "|" + (ev.start_date ?? "")).toLowerCase().replace(/\s+/g,"");
    if (finalSeen.has(key)) continue;
    finalSeen.add(key);
    if (isFuture(ev.start_date)) merged.push(ev);
  }

  console.log(`\n=== Summary ===`);
  console.log(`  volek.events:    ${volek.length}`);
  console.log(`  Groq web search: ${aiResults.length}`);
  console.log(`  After dedup:     ${merged.length} unique future events`);

  fs.writeFileSync(FOUND_FILE, JSON.stringify(merged, null, 2), "utf8");
  console.log(`\nSaved JSON → ${FOUND_FILE}`);

  const sql = buildSql(merged);
  if (sql) {
    fs.writeFileSync(SQL_FILE, sql, "utf8");
    console.log(`Saved SQL  → ${SQL_FILE}`);
    console.log(`\nDone! Import ${SQL_FILE} in cPanel → phpMyAdmin → SQL tab.`);
  } else {
    console.log("No future events found.");
  }
}

main().catch(console.error);
