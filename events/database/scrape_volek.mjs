/**
 * scrape_volek.mjs
 *
 * Scrapes ALL upcoming events from volek.events and outputs a ready-to-run
 * SQL INSERT file for the events table.
 *
 * Usage:
 *   node scrape_volek.mjs
 *
 * Output:
 *   volek_found.json   — raw scraped data for inspection
 *   volek_events.sql   — INSERT statements ready for cPanel → phpMyAdmin
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOUND_FILE = path.join(__dirname, "volek_found.json");
const SQL_FILE   = path.join(__dirname, "volek_events.sql");

const BASE_URL = "https://volek.events";
const HEADERS  = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function esc(v) {
  if (v === null || v === undefined) return "NULL";
  return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

function parseDate(str) {
  if (!str) return null;
  const clean = str.replace(/^[A-Za-z]+,\s*/, "").trim();
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

function formatMysqlDateTime(d) {
  if (!d) return null;
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

// Extract city from title: "EBI Live in Bremen" → "Bremen"
function cityFromTitle(title) {
  const m = title.match(/\bin\s+([A-ZÄÖÜ][A-Za-zäöüÄÖÜ\s\-\.]+)$/);
  return m ? m[1].trim() : null;
}

const CITY_TO_COUNTRY_MAP = {};
const CITY_TO_COUNTRY = [
  [["London","Manchester","Birmingham","Glasgow","Edinburgh","Leeds","Sheffield","Bristol","Cardiff","Belfast","Newcastle","Nottingham","Leicester","Southampton","Liverpool"], "United Kingdom"],
  [["Berlin","Hamburg","Munich","Cologne","Frankfurt","Stuttgart","Hannover","Bremen","Dresden","Dortmund","Essen","Leipzig","Nuremberg","Duisburg","Bochum","Wuppertal","Bielefeld","Bonn","Münster","Karlsruhe","Mannheim","Augsburg","Düsseldorf"], "Germany"],
  [["Paris","Lyon","Marseille","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille","Grenoble"], "France"],
  [["Vienna","Graz","Linz","Salzburg","Innsbruck","Klagenfurt"], "Austria"],
  [["Amsterdam","Rotterdam","Utrecht","Eindhoven","The Hague","Leiden","Groningen","Tilburg","Almere","Breda"], "Netherlands"],
  [["Stockholm","Gothenburg","Malmö","Uppsala","Linköping","Örebro","Helsingborg","Göteborg"], "Sweden"],
  [["Copenhagen","Aarhus","Odense"], "Denmark"],
  [["Oslo","Bergen","Trondheim"], "Norway"],
  [["Helsinki","Tampere","Turku"], "Finland"],
  [["Brussels","Antwerp","Ghent","Liège","Bruges"], "Belgium"],
  [["Zurich","Geneva","Basel","Bern","Lausanne","Lugano","Winterthur"], "Switzerland"],
  [["Toronto","Vancouver","Montreal","Calgary","Ottawa","Edmonton"], "Canada"],
  [["New York","Los Angeles","Chicago","Houston","Dallas","San Jose","Washington","Seattle","Atlanta","Miami","Boston","Phoenix"], "United States"],
  [["Melbourne","Sydney","Brisbane","Perth","Adelaide"], "Australia"],
  [["Dubai","Abu Dhabi"], "United Arab Emirates"],
  [["Istanbul","Ankara","Izmir"], "Turkey"],
  [["Tehran","Mashhad","Isfahan","Shiraz","Tabriz"], "Iran"],
];
for (const [cities, country] of CITY_TO_COUNTRY) {
  for (const city of cities) {
    CITY_TO_COUNTRY_MAP[city.toLowerCase()] = { city, country };
  }
}

function lookupCityCountry(rawCity) {
  if (!rawCity) return { city: "Unknown", country: "Unknown" };
  return CITY_TO_COUNTRY_MAP[rawCity.toLowerCase()] ?? { city: rawCity, country: "Unknown" };
}

function guessEventType(title) {
  const t = title.toLowerCase();
  if (/concert|live|musik|music|band/.test(t))                  return "concert";
  if (/theatre|theater/.test(t))                                return "theatre";
  if (/dance|dancing|tanz/.test(t))                             return "dance_class";
  if (/protest|demonstration|rally|gathering/.test(t))          return "protest";
  if (/class|workshop|language|sprachkurs/.test(t))             return "language_class";
  if (/food|dinner|brunch|restaurant/.test(t))                  return "food_culture";
  if (/art|exhibition|gallery|galerie/.test(t))                 return "art_exhibition";
  if (/sport|soccer|volleyball|tennis|football/.test(t))        return "sports";
  if (/norouz|nowruz|yalda|chaharshanbeh|persian new/.test(t))  return "religious_cultural";
  if (/party|celebration|festival|night vibes|gala/.test(t))    return "party";
  if (/conference|talk|lecture|panel|summit/.test(t))           return "conference";
  return "concert";
}

async function geocode(venue, city, country) {
  const q = [venue, city, country].filter(Boolean).join(", ");
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { "User-Agent": "BiruniMap/1.0 events-scraper" } });
    const data = await res.json();
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    // fallback: city + country only
    const url2 = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent([city, country].join(", "))}&format=json&limit=1`;
    const res2 = await fetch(url2, { headers: { "User-Agent": "BiruniMap/1.0 events-scraper" } });
    const data2 = await res2.json();
    if (data2.length > 0) return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };
  } catch { /* non-fatal */ }
  return { lat: null, lng: null };
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function parseListingPage(html) {
  const events = [];
  const blockRe = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const inner = m[2];
    if (!inner.includes("<h3")) continue;
    const h3 = inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const title = h3?.[1]?.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#\d+;/g, "").trim();
    if (!title) continue;
    const spans = [...inner.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/gi)]
      .map((x) => x[1].replace(/<[^>]+>/g, "").trim())
      .filter(Boolean);
    events.push({ title, url: m[1].startsWith("http") ? m[1] : BASE_URL + m[1], spans });
  }
  return events;
}

async function fetchDetail(url) {
  try {
    const html = await fetchHtml(url);
    const descM = html.match(/<div[^>]*class="[^"]*(?:entry-content|event-description|post-content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const description = descM
      ? descM[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 800)
      : null;
    const ticketM = html.match(/href="([^"]*(?:ticket|eventbrite|dice\.fm|ticketmaster)[^"]*)"/i);
    return { description, externalLink: ticketM ? ticketM[1] : url };
  } catch {
    return { description: null, externalLink: url };
  }
}

async function main() {
  console.log("Scraping volek.events...\n");

  const allEvents = [];
  let page = 1;

  while (true) {
    const url = page === 1 ? `${BASE_URL}/events/` : `${BASE_URL}/events/page/${page}/`;
    console.log(`Page ${page}: ${url}`);
    let html;
    try {
      html = await fetchHtml(url);
    } catch (e) {
      console.log(`  Stopped: ${e.message}`);
      break;
    }
    const pageEvents = parseListingPage(html);
    if (pageEvents.length === 0) { console.log("  No more events."); break; }
    console.log(`  ${pageEvents.length} events found`);
    allEvents.push(...pageEvents);

    if (!html.includes(`/events/page/${page + 1}/`) && !html.includes('rel="next"')) break;
    page++;
    await sleep(1200);
  }

  console.log(`\nTotal: ${allEvents.length} events. Enriching with geocodes...\n`);

  const enriched = [];
  for (const ev of allEvents) {
    const dateSpan = ev.spans.find((s) => /[A-Z][a-z]+,/.test(s) && /\d{4}/.test(s));
    const venueSpan = ev.spans.find((s) =>
      s && !/buy ticket|days? left|NEW|POSTPONED|\d+ days/i.test(s) && s !== dateSpan
    );

    const rawCity = cityFromTitle(ev.title);
    const { city, country } = lookupCityCountry(rawCity);

    const startDate = parseDate(dateSpan ?? null);
    const endDate = startDate ? new Date(startDate.getTime() + 3 * 60 * 60 * 1000) : null;

    console.log(`  [${country}] ${ev.title}`);

    const detail = await fetchDetail(ev.url);
    await sleep(600);

    const { lat, lng } = await geocode(venueSpan ?? null, city, country);
    await sleep(500);

    // Clean up: empty description → null, fragment-only links → event URL
    const description  = detail.description?.trim() || null;
    const externalLink = detail.externalLink?.startsWith("#") ? ev.url : detail.externalLink;

    enriched.push({
      title:           ev.title,
      title_fa:        null,
      event_type:      guessEventType(ev.title),
      country,
      city,
      venue:           venueSpan ?? null,
      address:         null,
      lat,
      lng,
      start_date:      startDate ? formatMysqlDateTime(startDate) : null,
      end_date:        endDate   ? formatMysqlDateTime(endDate)   : null,
      is_recurring:    0,
      description,
      external_link:   externalLink,
      organizer_name:  null,
      organizer_email: null,
      status:          "approved",
    });
  }

  fs.writeFileSync(FOUND_FILE, JSON.stringify(enriched, null, 2), "utf8");
  console.log(`\nSaved JSON → ${FOUND_FILE}`);

  const now = new Date();
  const rows = enriched.filter((ev) => ev.start_date && new Date(ev.start_date) >= now);
  if (rows.length === 0) {
    console.log("No events with parseable dates — no SQL generated.");
    return;
  }

  const sql = [
    "-- volek.events scraped events",
    `-- Generated: ${new Date().toISOString()}`,
    "-- Import via cPanel → phpMyAdmin → SQL tab",
    "",
    'SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";',
    "SET time_zone = \"+00:00\";",
    "/*!40101 SET NAMES utf8mb4 */;",
    "",
    "INSERT INTO events",
    "  (title, title_fa, event_type, country, city, venue, address, lat, lng,",
    "   start_date, end_date, is_recurring, recurrence_type, description, external_link,",
    "   organizer_name, organizer_email, status)",
    "VALUES",
    rows.map((ev) => `  (${[
      esc(ev.title), esc(ev.title_fa), esc(ev.event_type),
      esc(ev.country), esc(ev.city), esc(ev.venue), esc(ev.address),
      ev.lat ?? "NULL", ev.lng ?? "NULL",
      esc(ev.start_date), esc(ev.end_date), ev.is_recurring, "NULL",
      esc(ev.description), esc(ev.external_link),
      esc(ev.organizer_name), esc(ev.organizer_email), esc(ev.status),
    ].join(", ")})`).join(",\n"),
    ";",
  ].join("\n");

  fs.writeFileSync(SQL_FILE, sql, "utf8");
  console.log(`Saved SQL → ${SQL_FILE}`);
  console.log(`\nDone! ${rows.length} events ready to import into the database.`);
}

main().catch(console.error);
