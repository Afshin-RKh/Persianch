/**
 * scrape_volek.mjs
 *
 * Scrapes volek.events for Swiss Iranian/Persian events and outputs
 * a ready-to-run SQL INSERT file for the events table.
 *
 * Usage:
 *   node scrape_volek.mjs
 *
 * Output:
 *   volek_switzerland.sql  — INSERT statements ready to paste into cPanel MySQL
 *   volek_found.json       — raw scraped data for inspection
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOUND_FILE = path.join(__dirname, "volek_found.json");
const SQL_FILE   = path.join(__dirname, "volek_switzerland.sql");

const BASE_URL = "https://volek.events";
const HEADERS  = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xhtml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function esc(v) {
  if (v === null || v === undefined) return "NULL";
  return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

// Parse "Friday, May 1 2026" or "Saturday, 3 May 2025" into a Date
function parseDate(str) {
  if (!str) return null;
  // Remove weekday
  const clean = str.replace(/^[A-Za-z]+,\s*/, "").trim();
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

function formatMysqlDateTime(d) {
  if (!d) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} 00:00:00`;
}

// Map event title keywords to event_type
function guessEventType(title) {
  const t = title.toLowerCase();
  if (/concert|musik|music|band|live/.test(t))            return "concert";
  if (/theatre|theater|schauspiel/.test(t))               return "theatre";
  if (/tanzen|dance|dancing|tanz/.test(t))                return "dance_class";
  if (/protest|demonstration|rally|gathering/.test(t))    return "protest";
  if (/kurs|class|workshop|sprachkurs|language/.test(t))  return "language_class";
  if (/food|essen|restaurant|dinner|brunch/.test(t))      return "food_culture";
  if (/art|exhibition|galerie|gallery/.test(t))           return "art_exhibition";
  if (/sport|fussball|soccer|volleyball|tennis/.test(t))  return "sports";
  if (/norouz|nowruz|yalda|chaharshanbeh|persian new/.test(t)) return "religious_cultural";
  if (/party|celebration|festival|fête/.test(t))         return "party";
  if (/conference|talk|lecture|panel|summit/.test(t))    return "conference";
  return "other";
}

// Geocode city via Nominatim
async function geocode(venue, city, country) {
  const q = [venue, city, country].filter(Boolean).join(", ");
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { "User-Agent": "BiruniMap/1.0" } });
    const data = await res.json();
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch { /* non-fatal */ }
  return { lat: null, lng: null };
}

// Fetch HTML string
async function fetchHtml(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// Very lightweight HTML parser — extract text between tags using regex
function extractText(html, tag, cls = null) {
  const attr = cls ? `[^>]*class="[^"]*${cls}[^"]*"` : "[^>]*";
  const re = new RegExp(`<${tag}${attr}>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = html.match(re);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() : null;
}

function extractAttr(html, tag, attr, hintAttr = null, hintVal = null) {
  let pattern = `<${tag}[^>]*`;
  if (hintAttr) pattern += `${hintAttr}="${hintVal}"[^>]*`;
  pattern += `${attr}="([^"]*)"`;
  const re = new RegExp(pattern, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

// Parse listing page HTML — returns array of {title, dateStr, venueCountry, url}
function parseListingPage(html) {
  const events = [];
  // Each event is an <a> that contains <h3>
  const blockRe = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const url   = m[1];
    const inner = m[2];
    if (!inner.includes("<h3")) continue;

    const title = extractText(inner, "h3");
    if (!title) continue;

    // First <p> = date, second <p> = venue, country
    const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    const ps = [];
    let pm;
    while ((pm = pRe.exec(inner)) !== null) {
      ps.push(pm[1].replace(/<[^>]+>/g, "").trim());
    }

    events.push({
      title,
      dateStr:      ps[0] ?? null,
      venueCountry: ps[1] ?? null,
      url: url.startsWith("http") ? url : BASE_URL + url,
    });
  }
  return events;
}

// Fetch detail page and extract extra fields
async function fetchDetail(url) {
  try {
    const html = await fetchHtml(url);
    const description = extractText(html, "div", "event-description") ??
                        extractText(html, "div", "entry-content") ?? null;
    // Time: look for something like "20:00" or "8:00 PM"
    const timeM = html.match(/\b(\d{1,2}:\d{2})\s*(CEST|CET|PM|AM|Uhr)?\b/);
    const timeStr = timeM ? timeM[0] : null;
    // External link (ticket): look for buy ticket / tickets link
    const ticketM = html.match(/href="([^"]+)"[^>]*>[^<]*(?:ticket|tickets|buy|billets)[^<]*/i);
    const externalLink = ticketM ? ticketM[1] : url;
    return { description, timeStr, externalLink };
  } catch {
    return { description: null, timeStr: null, externalLink: url };
  }
}

async function main() {
  console.log("Fetching volek.events listings...");

  const found = [];
  let page = 1;

  while (true) {
    const url = page === 1 ? `${BASE_URL}/events/` : `${BASE_URL}/events/page/${page}/`;
    console.log(`  Fetching page ${page}: ${url}`);
    let html;
    try {
      html = await fetchHtml(url);
    } catch (e) {
      console.log(`  → Stopped at page ${page} (${e.message})`);
      break;
    }

    const pageEvents = parseListingPage(html);
    if (pageEvents.length === 0) { console.log("  → No events found, stopping."); break; }

    // Filter Switzerland only
    const swiss = pageEvents.filter((ev) => {
      const vc = (ev.venueCountry ?? "").toLowerCase();
      return vc.includes("switzerland") || vc.includes("suisse") || vc.includes("schweiz") || vc.includes(" ch");
    });

    console.log(`  → ${pageEvents.length} events on page, ${swiss.length} in Switzerland`);
    found.push(...swiss);

    // Check if there's a next page link
    if (!html.includes(`/events/page/${page + 1}/`) && !html.includes('rel="next"')) break;
    page++;
    await sleep(1200);
  }

  if (found.length === 0) {
    console.log("No Swiss events found. Try checking the site manually.");
    process.exit(0);
  }

  console.log(`\nFound ${found.length} Swiss events. Fetching details...`);

  // Enrich with detail page + geocode
  const enriched = [];
  for (const ev of found) {
    console.log(`  Detail: ${ev.title}`);
    const detail = await fetchDetail(ev.url);
    await sleep(800);

    // Parse venue and city from "Venue , City , Switzerland" or "Venue , Switzerland"
    const parts = (ev.venueCountry ?? "").split(",").map((s) => s.trim());
    const country = "Switzerland";
    const venue   = parts[0] ?? null;
    const city    = parts.length >= 3 ? parts[1] : (parts.length === 2 ? parts[0] : null);

    // Parse date
    let startDate = parseDate(ev.dateStr);
    // Apply time if found
    if (startDate && detail.timeStr) {
      const tm = detail.timeStr.match(/(\d{1,2}):(\d{2})/);
      if (tm) { startDate.setHours(parseInt(tm[1]), parseInt(tm[2])); }
    }
    // End date = start + 3 hours default
    const endDate = startDate ? new Date(startDate.getTime() + 3 * 60 * 60 * 1000) : null;

    // Geocode
    const { lat, lng } = await geocode(venue, city, country);
    await sleep(500);

    enriched.push({
      title:        ev.title,
      title_fa:     null,
      event_type:   guessEventType(ev.title),
      country,
      city:         city ?? "Switzerland",
      venue,
      address:      null,
      lat,
      lng,
      start_date:   startDate ? formatMysqlDateTime(startDate) : null,
      end_date:     endDate   ? formatMysqlDateTime(endDate)   : null,
      is_recurring: 0,
      description:  detail.description ? detail.description.slice(0, 1000) : null,
      external_link: detail.externalLink ?? ev.url,
      organizer_name:  null,
      organizer_email: null,
      status:       "approved",
    });
  }

  // Save raw JSON
  fs.writeFileSync(FOUND_FILE, JSON.stringify(enriched, null, 2), "utf8");
  console.log(`\nSaved ${enriched.length} events to ${FOUND_FILE}`);

  // Generate SQL
  const rows = enriched.filter((ev) => ev.start_date); // skip events with no parseable date
  const sqlLines = [
    "-- volek.events Switzerland events",
    "-- Generated: " + new Date().toISOString(),
    "-- Run this in cPanel → phpMyAdmin on afshxhoj_persianhub database",
    "",
    "INSERT INTO events",
    "  (title, title_fa, event_type, country, city, venue, address, lat, lng,",
    "   start_date, end_date, is_recurring, description, external_link,",
    "   organizer_name, organizer_email, status)",
    "VALUES",
    rows.map((ev) => `  (${[
      esc(ev.title), esc(ev.title_fa), esc(ev.event_type),
      esc(ev.country), esc(ev.city), esc(ev.venue), esc(ev.address),
      ev.lat ?? "NULL", ev.lng ?? "NULL",
      esc(ev.start_date), esc(ev.end_date),
      ev.is_recurring,
      esc(ev.description), esc(ev.external_link),
      esc(ev.organizer_name), esc(ev.organizer_email),
      esc(ev.status),
    ].join(", ")})`).join(",\n"),
    ";",
  ].join("\n");

  fs.writeFileSync(SQL_FILE, sqlLines, "utf8");
  console.log(`Saved SQL to ${SQL_FILE}`);
  console.log(`\nDone! ${rows.length} events ready to import.`);
  console.log("Next step: paste volek_switzerland.sql into cPanel → phpMyAdmin");
}

main().catch(console.error);
