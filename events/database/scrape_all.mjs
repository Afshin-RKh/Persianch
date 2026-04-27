/**
 * scrape_all.mjs
 *
 * Master events scraper for BiruniMap.
 * Sources:
 *   1. Google Custom Search API  — finds event pages via "persian/iranian/afghan events <city>"
 *   2. volek.events              — Iranian concerts/events in Europe
 *   3. Eventbrite public search  — keyword search (no key needed)
 *   4. IranianChamber.com        — community events list
 *   5. PersianEvents.com         — diaspora events directory
 *
 * Usage:
 *   node scrape_all.mjs
 *
 * Requires:
 *   GOOGLE_API_KEY   — Google Custom Search API key
 *   GOOGLE_CX        — Custom Search Engine ID (set to search the whole web)
 *
 * Set them in events/database/.env  OR export as env vars before running.
 *
 * Output:
 *   scraped_found.json   — all raw events for inspection
 *   scraped_events.sql   — ready-to-run INSERT for cPanel → phpMyAdmin
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ── Config ────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file from same directory if present
const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";
const GOOGLE_CX      = process.env.GOOGLE_CX      || "";

if (!GOOGLE_API_KEY || !GOOGLE_CX) {
  console.warn("⚠️  GOOGLE_API_KEY or GOOGLE_CX not set. Google search stage will be skipped.");
  console.warn("   Create events/database/.env with:\n   GOOGLE_API_KEY=...\n   GOOGLE_CX=...\n");
}

const FOUND_FILE = path.join(__dirname, "scraped_found.json");
const SQL_FILE   = path.join(__dirname, "scraped_events.sql");

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

// Major diaspora cities to search
const SEARCH_CITIES = [
  "London", "Los Angeles", "Toronto", "New York", "Vancouver",
  "Berlin", "Hamburg", "Stockholm", "Amsterdam", "Paris",
  "Vienna", "Zurich", "Geneva", "Oslo", "Copenhagen",
  "Melbourne", "Sydney", "Dubai", "Istanbul",
  "Washington DC", "San Jose", "San Diego", "Houston",
  "Frankfurt", "Cologne", "Munich", "Gothenburg", "Malmo",
  "Montreal", "Calgary", "Ottawa", "Brussels", "The Hague",
];

const SEARCH_QUERIES = [
  "Iranian events",
  "Persian events",
  "Afghan events",
  "Nowruz celebration",
  "Persian concert",
  "Iranian concert",
  "Yalda night",
  "Persian cultural event",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function esc(v) {
  if (v === null || v === undefined) return "NULL";
  return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

function formatMysqlDateTime(d) {
  if (!d || isNaN(d.getTime())) return null;
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

function parseDate(str) {
  if (!str) return null;
  const clean = str.replace(/^[A-Za-z]+,\s*/, "").trim();
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

function isFuture(d) {
  return d && d > new Date();
}

function guessEventType(title = "", desc = "") {
  const t = (title + " " + desc).toLowerCase();
  if (/concert|live|music|band|singer|artist|rap|pop|rock|jazz|شب موسیقی/.test(t)) return "concert";
  if (/theatre|theater|play|drama|نمایش/.test(t))                                   return "theatre";
  if (/dance|tango|salsa|رقص/.test(t))                                               return "dance_class";
  if (/protest|demonstration|rally|march|تظاهرات/.test(t))                          return "protest";
  if (/class|workshop|language|course|آموزش|زبان/.test(t))                          return "language_class";
  if (/food|dinner|brunch|restaurant|cuisine|غذا|آشپزی/.test(t))                    return "food_culture";
  if (/art|exhibition|gallery|نمایشگاه/.test(t))                                     return "art_exhibition";
  if (/sport|soccer|football|volleyball|tennis|ورزش/.test(t))                       return "sports";
  if (/norouz|nowruz|yalda|chaharshanbe|persian new|eid|نوروز|یلدا|چهارشنبه/.test(t)) return "religious_cultural";
  if (/party|gala|celebration|festival|night|جشن/.test(t))                          return "party";
  if (/conference|summit|lecture|panel|talk|seminar|کنفرانس/.test(t))               return "conference";
  return "other";
}

// Canonical city/country lookup
const CITY_MAP = {};
const CITY_DATA = [
  [["London","Manchester","Birmingham","Glasgow","Edinburgh","Leeds","Bristol","Cardiff","Liverpool","Newcastle"], "United Kingdom"],
  [["Berlin","Hamburg","Munich","Cologne","Frankfurt","Stuttgart","Hannover","Bremen","Dresden","Düsseldorf","Dortmund","Leipzig","Nuremberg","Gothenburg"], "Germany"],
  [["Paris","Lyon","Marseille","Toulouse","Nice","Strasbourg","Bordeaux","Lille"], "France"],
  [["Vienna","Graz","Linz","Salzburg","Innsbruck"], "Austria"],
  [["Amsterdam","Rotterdam","Utrecht","Eindhoven","The Hague","Leiden","Groningen"], "Netherlands"],
  [["Stockholm","Gothenburg","Göteborg","Malmö","Malmo","Uppsala","Linköping"], "Sweden"],
  [["Copenhagen","Aarhus","Odense"], "Denmark"],
  [["Oslo","Bergen","Trondheim"], "Norway"],
  [["Helsinki","Tampere","Turku"], "Finland"],
  [["Brussels","Antwerp","Ghent","Liège"], "Belgium"],
  [["Zurich","Geneva","Basel","Bern","Lausanne","Lugano"], "Switzerland"],
  [["Toronto","Vancouver","Montreal","Calgary","Ottawa","Edmonton","Mississauga"], "Canada"],
  [["New York","Los Angeles","Chicago","Houston","Dallas","San Jose","Washington","Washington DC","Seattle","Atlanta","Miami","Boston","Phoenix","San Diego","San Francisco","Philadelphia"], "United States"],
  [["Melbourne","Sydney","Brisbane","Perth","Adelaide"], "Australia"],
  [["Dubai","Abu Dhabi","Sharjah"], "United Arab Emirates"],
  [["Istanbul","Ankara","Izmir"], "Turkey"],
  [["Tehran","Mashhad","Isfahan","Shiraz","Tabriz"], "Iran"],
  [["Kabul"], "Afghanistan"],
  [["Stockholm"], "Sweden"],
];
for (const [cities, country] of CITY_DATA) {
  for (const city of cities) CITY_MAP[city.toLowerCase()] = { city, country };
}

function lookupCity(rawCity) {
  if (!rawCity) return null;
  return CITY_MAP[rawCity.toLowerCase()] ?? null;
}

function cityFromTitle(title) {
  const m = title.match(/\bin\s+([A-ZÄÖÜ][A-Za-zäöüÄÖÜ\s\-]+?)(?:\s*[-–|,]|$)/);
  return m ? m[1].trim() : null;
}

async function geocode(venue, city, country) {
  const q = [venue, city, country].filter(Boolean).join(", ");
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
    const r = await fetch(url, { headers: { "User-Agent": "BiruniMap/1.0 scraper" } });
    const d = await r.json();
    if (d.length) return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
    const url2 = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent([city, country].filter(Boolean).join(", "))}&format=json&limit=1`;
    const r2 = await fetch(url2, { headers: { "User-Agent": "BiruniMap/1.0 scraper" } });
    const d2 = await r2.json();
    if (d2.length) return { lat: parseFloat(d2[0].lat), lng: parseFloat(d2[0].lon) };
  } catch { /* non-fatal */ }
  return { lat: null, lng: null };
}

async function fetchHtml(url, extraHeaders = {}) {
  const res = await fetch(url, { headers: { ...BROWSER_HEADERS, ...extraHeaders } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
             .replace(/&#\d+;/g, "").replace(/\s+/g, " ").trim();
}

// Deduplicate by title+startDate
const seen = new Set();
function dedup(title, startDate) {
  const key = (title + "|" + startDate).toLowerCase().replace(/\s+/g, "");
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
}

// ── Source 1: volek.events ────────────────────────────────────────────────────

async function scrapeVolek() {
  console.log("\n── volek.events ─────────────────────────────────────────");
  const BASE = "https://volek.events";
  const results = [];
  let page = 1;

  while (true) {
    const url = page === 1 ? `${BASE}/events/` : `${BASE}/events/page/${page}/`;
    let html;
    try { html = await fetchHtml(url); } catch (e) { console.log(`  Stop: ${e.message}`); break; }

    const blockRe = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m, found = 0;
    while ((m = blockRe.exec(html)) !== null) {
      const inner = m[2];
      if (!inner.includes("<h3")) continue;
      const h3 = inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
      const title = h3?.[1] ? stripHtml(h3[1]) : null;
      if (!title) continue;
      const spans = [...inner.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/gi)]
        .map(x => stripHtml(x[1])).filter(Boolean);
      const dateSpan  = spans.find(s => /[A-Z][a-z]+,/.test(s) && /\d{4}/.test(s));
      const venueSpan = spans.find(s => s && !/buy ticket|days? left|NEW|POSTPONED|\d+ days/i.test(s) && s !== dateSpan);
      const startDate = parseDate(dateSpan);
      if (!isFuture(startDate)) continue;

      const rawCity = cityFromTitle(title);
      const loc = lookupCity(rawCity) ?? { city: rawCity ?? "Unknown", country: "Unknown" };
      const evUrl = m[1].startsWith("http") ? m[1] : BASE + m[1];
      results.push({ title, venue: venueSpan ?? null, startDate, city: loc.city, country: loc.country, url: evUrl });
      found++;
    }

    console.log(`  Page ${page}: ${found} future events`);
    if (found === 0 || (!html.includes(`/events/page/${page + 1}/`) && !html.includes('rel="next"'))) break;
    page++;
    await sleep(1200);
  }

  // Enrich with geocode
  const enriched = [];
  for (const ev of results) {
    await sleep(500);
    const { lat, lng } = await geocode(ev.venue, ev.city, ev.country);
    enriched.push({
      title: ev.title, title_fa: null,
      event_type: guessEventType(ev.title),
      country: ev.country, city: ev.city, venue: ev.venue, address: null,
      lat, lng,
      start_date: formatMysqlDateTime(ev.startDate),
      end_date: formatMysqlDateTime(new Date(ev.startDate.getTime() + 3 * 3600 * 1000)),
      description: null, external_link: ev.url,
      organizer_name: null, organizer_email: null, status: "approved",
    });
  }
  console.log(`  Total: ${enriched.length} events from volek.events`);
  return enriched;
}

// ── Source 2: Eventbrite public search (no key needed) ────────────────────────

async function scrapeEventbrite() {
  console.log("\n── Eventbrite ───────────────────────────────────────────");
  const keywords = [
    "iranian", "persian", "nowruz", "yalda", "afghan diaspora",
    "farsi", "persian new year", "iranian concert",
  ];
  const results = [];

  for (const kw of keywords) {
    const url = `https://www.eventbrite.com/d/worldwide/${encodeURIComponent(kw)}/`;
    let html;
    try { html = await fetchHtml(url); await sleep(1000); } catch { continue; }

    // Eventbrite embeds event data in a JSON script block
    const jsonMatch = html.match(/window\.__SERVER_DATA__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
    if (!jsonMatch) {
      // Try structured JSON-LD instead
      const ldMatches = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
      for (const lm of ldMatches) {
        try {
          const data = JSON.parse(lm[1]);
          const events = Array.isArray(data) ? data : [data];
          for (const ev of events) {
            if (ev["@type"] !== "Event") continue;
            const startDate = ev.startDate ? new Date(ev.startDate) : null;
            if (!isFuture(startDate)) continue;
            const loc = ev.location ?? {};
            const addr = loc.address ?? {};
            const city    = addr.addressLocality ?? "";
            const country = addr.addressCountry ?? "";
            const title   = ev.name ?? "";
            if (!title || !city) continue;
            if (!dedup(title, ev.startDate)) continue;
            results.push({
              title, title_fa: null,
              event_type: guessEventType(title, ev.description ?? ""),
              country, city, venue: loc.name ?? null, address: addr.streetAddress ?? null,
              lat: null, lng: null,
              start_date: formatMysqlDateTime(startDate),
              end_date: formatMysqlDateTime(ev.endDate ? new Date(ev.endDate) : new Date(startDate.getTime() + 3*3600*1000)),
              description: (ev.description ?? "").slice(0, 800) || null,
              external_link: ev.url ?? null,
              organizer_name: null, organizer_email: null, status: "approved",
            });
          }
        } catch { /* skip */ }
      }
      continue;
    }

    try {
      const data = JSON.parse(jsonMatch[1]);
      const items = data?.search_data?.events?.results ?? [];
      for (const item of items) {
        const startDate = item.start_date ? new Date(item.start_date) : null;
        if (!isFuture(startDate)) continue;
        const title = item.name ?? "";
        if (!title) continue;
        if (!dedup(title, item.start_date)) continue;
        const city    = item.primary_venue?.address?.city ?? "";
        const country = item.primary_venue?.address?.country ?? "";
        results.push({
          title, title_fa: null,
          event_type: guessEventType(title, item.summary ?? ""),
          country, city, venue: item.primary_venue?.name ?? null, address: null,
          lat: item.primary_venue?.address?.latitude  ? parseFloat(item.primary_venue.address.latitude)  : null,
          lng: item.primary_venue?.address?.longitude ? parseFloat(item.primary_venue.address.longitude) : null,
          start_date: formatMysqlDateTime(startDate),
          end_date: formatMysqlDateTime(item.end_date ? new Date(item.end_date) : new Date(startDate.getTime() + 3*3600*1000)),
          description: (item.summary ?? "").slice(0, 800) || null,
          external_link: item.url ?? null,
          organizer_name: null, organizer_email: null, status: "approved",
        });
      }
    } catch { /* skip */ }

    console.log(`  "${kw}": ${results.length} so far`);
    await sleep(1500);
  }

  // Geocode those without lat/lng
  for (const ev of results) {
    if (ev.lat && ev.lng) continue;
    if (!ev.city) continue;
    await sleep(400);
    const { lat, lng } = await geocode(ev.venue, ev.city, ev.country);
    ev.lat = lat; ev.lng = lng;
  }

  console.log(`  Total: ${results.length} events from Eventbrite`);
  return results;
}

// ── Source 3: Google Custom Search → event detail pages ───────────────────────

async function scrapeViaGoogle() {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.log("\n── Google Search: skipped (no API key) ─────────────────");
    return [];
  }
  console.log("\n── Google Custom Search API ─────────────────────────────");

  const results = [];

  for (const city of SEARCH_CITIES) {
    for (const query of SEARCH_QUERIES) {
      const q = `${query} ${city} 2025 OR 2026`;
      const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(q)}&num=10`;
      let data;
      try {
        const r = await fetch(url);
        data = await r.json();
      } catch { continue; }

      if (data.error) { console.warn(`  API error: ${data.error.message}`); continue; }

      const items = data.items ?? [];
      for (const item of items) {
        const pageUrl = item.link;
        // Only follow pages that look like event listings
        if (!/event|concert|ticket|festival|show|گردهمایی|کنسرت/i.test(item.title + item.snippet)) continue;

        let html;
        try { html = await fetchHtml(pageUrl); await sleep(700); } catch { continue; }

        // Try JSON-LD structured data first
        const ldMatches = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
        for (const lm of ldMatches) {
          try {
            const schema = JSON.parse(lm[1]);
            const events = Array.isArray(schema) ? schema : [schema];
            for (const ev of events) {
              if (ev["@type"] !== "Event") continue;
              const startDate = ev.startDate ? new Date(ev.startDate) : null;
              if (!isFuture(startDate)) continue;
              const title = ev.name ?? "";
              if (!title) continue;
              if (!dedup(title, ev.startDate)) continue;
              const loc  = ev.location ?? {};
              const addr = loc.address ?? {};
              const evCity    = addr.addressLocality || city;
              const evCountry = addr.addressCountry  || (lookupCity(city)?.country ?? "");
              results.push({
                title, title_fa: null,
                event_type: guessEventType(title, ev.description ?? ""),
                country: evCountry, city: evCity,
                venue: loc.name ?? null, address: addr.streetAddress ?? null,
                lat: null, lng: null,
                start_date: formatMysqlDateTime(startDate),
                end_date: formatMysqlDateTime(ev.endDate ? new Date(ev.endDate) : new Date(startDate.getTime() + 3*3600*1000)),
                description: (ev.description ?? "").slice(0, 800) || null,
                external_link: pageUrl,
                organizer_name: ev.organizer?.name ?? null,
                organizer_email: null, status: "approved",
              });
            }
          } catch { /* skip */ }
        }
      }

      console.log(`  [${city}] "${query}": ${results.length} total so far`);
      await sleep(300); // Google API quota guard
    }
  }

  // Geocode
  for (const ev of results) {
    if (ev.lat && ev.lng) continue;
    await sleep(400);
    const { lat, lng } = await geocode(ev.venue, ev.city, ev.country);
    ev.lat = lat; ev.lng = lng;
  }

  console.log(`  Total: ${results.length} events via Google`);
  return results;
}

// ── Source 4: PersianEvents.com ───────────────────────────────────────────────

async function scrapePersianEvents() {
  console.log("\n── PersianEvents.com ────────────────────────────────────");
  const BASE = "https://www.persianevents.com";
  const results = [];

  let html;
  try { html = await fetchHtml(`${BASE}/events`); } catch (e) { console.log(`  Skipped: ${e.message}`); return []; }

  // Grab all event links
  const linkRe = /href="(\/events\/[^"]+)"/g;
  const links = new Set();
  let m;
  while ((m = linkRe.exec(html)) !== null) links.add(BASE + m[1]);

  console.log(`  Found ${links.size} event links`);

  for (const link of [...links].slice(0, 60)) {
    let detail;
    try { detail = await fetchHtml(link); await sleep(700); } catch { continue; }

    const ldMatches = [...detail.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    for (const lm of ldMatches) {
      try {
        const ev = JSON.parse(lm[1]);
        if (ev["@type"] !== "Event") continue;
        const startDate = ev.startDate ? new Date(ev.startDate) : null;
        if (!isFuture(startDate)) continue;
        const title = ev.name ?? "";
        if (!title || !dedup(title, ev.startDate)) continue;
        const loc  = ev.location ?? {};
        const addr = loc.address ?? {};
        results.push({
          title, title_fa: null,
          event_type: guessEventType(title, ev.description ?? ""),
          country: addr.addressCountry ?? "", city: addr.addressLocality ?? "",
          venue: loc.name ?? null, address: addr.streetAddress ?? null,
          lat: null, lng: null,
          start_date: formatMysqlDateTime(startDate),
          end_date: formatMysqlDateTime(ev.endDate ? new Date(ev.endDate) : new Date(startDate.getTime() + 3*3600*1000)),
          description: (ev.description ?? "").slice(0, 800) || null,
          external_link: link,
          organizer_name: null, organizer_email: null, status: "approved",
        });
      } catch { /* skip */ }
    }
  }

  for (const ev of results) {
    if (ev.lat && ev.lng) continue;
    await sleep(400);
    const { lat, lng } = await geocode(ev.venue, ev.city, ev.country);
    ev.lat = lat; ev.lng = lng;
  }

  console.log(`  Total: ${results.length} events from PersianEvents.com`);
  return results;
}

// ── Source 5: IranianChamber.com events calendar ──────────────────────────────

async function scrapeIranianChamber() {
  console.log("\n── IranianChamber.com ───────────────────────────────────");
  const results = [];
  const now = new Date();

  // They list events by month
  for (let m = 0; m <= 5; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, "0");
    const url  = `https://www.iranianchamber.com/events/?year=${yyyy}&month=${mm}`;
    let html;
    try { html = await fetchHtml(url); await sleep(900); } catch { continue; }

    const eventRe = /<h[23][^>]*>\s*<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let em;
    while ((em = eventRe.exec(html)) !== null) {
      const evUrl  = em[1].startsWith("http") ? em[1] : "https://www.iranianchamber.com" + em[1];
      const title  = em[2].trim();
      if (!title || !dedup(title, evUrl)) continue;

      let detail;
      try { detail = await fetchHtml(evUrl); await sleep(600); } catch { continue; }

      const dateM = detail.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
      const startDate = dateM ? new Date(`${dateM[2]} ${dateM[1]}, ${dateM[3]}`) : null;
      if (!isFuture(startDate)) continue;

      const cityM   = detail.match(/(?:city|location|venue)[^:]*:\s*([A-Z][a-zA-Z\s]+)/i);
      const rawCity = cityM?.[1]?.trim();
      const loc     = lookupCity(rawCity) ?? { city: rawCity ?? "", country: "" };

      results.push({
        title, title_fa: null,
        event_type: guessEventType(title),
        country: loc.country, city: loc.city, venue: null, address: null,
        lat: null, lng: null,
        start_date: formatMysqlDateTime(startDate),
        end_date: formatMysqlDateTime(new Date(startDate.getTime() + 3*3600*1000)),
        description: null, external_link: evUrl,
        organizer_name: null, organizer_email: null, status: "approved",
      });
    }
    console.log(`  ${yyyy}-${mm}: ${results.length} total so far`);
  }

  for (const ev of results) {
    if (ev.lat && ev.lng) continue;
    await sleep(400);
    const { lat, lng } = await geocode(ev.venue, ev.city, ev.country);
    ev.lat = lat; ev.lng = lng;
  }

  console.log(`  Total: ${results.length} events from IranianChamber.com`);
  return results;
}

// ── SQL builder ───────────────────────────────────────────────────────────────

function buildSql(rows) {
  if (rows.length === 0) return null;
  const header = [
    "-- BiruniMap scraped events",
    `-- Generated: ${new Date().toISOString()}`,
    "-- Import via cPanel → phpMyAdmin → SQL tab",
    "",
    'SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";',
    "SET time_zone = \"+00:00\";",
    "/*!40101 SET NAMES utf8mb4 */;",
    "",
    "INSERT IGNORE INTO events",
    "  (title, title_fa, event_type, country, city, venue, address, lat, lng,",
    "   start_date, end_date, is_recurring, recurrence_type, description, external_link,",
    "   organizer_name, organizer_email, status)",
    "VALUES",
  ].join("\n");

  const values = rows.map(ev => `  (${[
    esc(ev.title), esc(ev.title_fa), esc(ev.event_type),
    esc(ev.country), esc(ev.city), esc(ev.venue), esc(ev.address),
    ev.lat ?? "NULL", ev.lng ?? "NULL",
    esc(ev.start_date), esc(ev.end_date), 0, "NULL",
    esc(ev.description), esc(ev.external_link),
    esc(ev.organizer_name), esc(ev.organizer_email), esc(ev.status),
  ].join(", ")})`).join(",\n");

  return header + "\n" + values + ";\n";
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== BiruniMap Master Event Scraper ===");
  console.log(`Started: ${new Date().toISOString()}\n`);

  const [volek, eventbrite, google, persianEvents, iranianChamber] = await Promise.allSettled([
    scrapeVolek(),
    scrapeEventbrite(),
    scrapeViaGoogle(),
    scrapePersianEvents(),
    scrapeIranianChamber(),
  ]).then(results => results.map(r => r.status === "fulfilled" ? r.value : []));

  // Merge and deduplicate by title+date
  const allSeen = new Set();
  const merged = [];
  for (const batch of [volek, eventbrite, google, persianEvents, iranianChamber]) {
    for (const ev of batch) {
      const key = ((ev.title ?? "") + "|" + (ev.start_date ?? "")).toLowerCase().replace(/\s+/g, "");
      if (allSeen.has(key)) continue;
      allSeen.add(key);
      merged.push(ev);
    }
  }

  // Keep only events with a valid future start_date
  const now = new Date();
  const final = merged.filter(ev => {
    if (!ev.start_date) return false;
    return new Date(ev.start_date) > now;
  });

  console.log(`\n=== Summary ===`);
  console.log(`  volek.events:        ${volek.length}`);
  console.log(`  Eventbrite:          ${eventbrite.length}`);
  console.log(`  Google search:       ${google.length}`);
  console.log(`  PersianEvents.com:   ${persianEvents.length}`);
  console.log(`  IranianChamber.com:  ${iranianChamber.length}`);
  console.log(`  After dedup+filter:  ${final.length} events ready to import`);

  fs.writeFileSync(FOUND_FILE, JSON.stringify(final, null, 2), "utf8");
  console.log(`\nSaved JSON → ${FOUND_FILE}`);

  const sql = buildSql(final);
  if (sql) {
    fs.writeFileSync(SQL_FILE, sql, "utf8");
    console.log(`Saved SQL  → ${SQL_FILE}`);
    console.log(`\nDone! Run the SQL file in cPanel → phpMyAdmin → SQL tab.`);
  } else {
    console.log("No events with valid dates — no SQL generated.");
  }
}

main().catch(console.error);
