/**
 * scrape_jsonld.mjs
 * Parse JSON-LD schema.org events from Maz Jobrani + use Groq web search
 * for Shadmehr (JS-rendered Shopify page). Merges into websites_found.json
 * and websites_events.sql.
 *
 * Usage: node scrape_jsonld.mjs
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const KEYS_FILE  = path.join(__dirname, "../../database/groq_keys.json");
const FOUND_FILE = path.join(__dirname, "websites_found.json");
const SQL_FILE   = path.join(__dirname, "websites_events.sql");

const KEYS = JSON.parse(fs.readFileSync(KEYS_FILE, "utf8"));
if (!KEYS.length) { console.error("No keys"); process.exit(1); }
console.log(`Loaded ${KEYS.length} Groq keys`);

let keyIdx = 0;
function nextKey() { const k = KEYS[keyIdx % KEYS.length]; keyIdx++; return k; }

const CITY_MAP = {};
for (const [cities, country] of [
  [["London","Manchester","Liverpool","Birmingham","Glasgow","Edinburgh"], "United Kingdom"],
  [["Berlin","Hamburg","Munich","Frankfurt","Cologne"], "Germany"],
  [["Paris","Lyon","Marseille","Nice","Bordeaux"], "France"],
  [["Vienna","Graz","Linz","Salzburg"], "Austria"],
  [["Amsterdam","Rotterdam","Utrecht","The Hague"], "Netherlands"],
  [["Stockholm","Gothenburg","Göteborg","Malmö"], "Sweden"],
  [["Copenhagen","Aarhus"], "Denmark"],
  [["Oslo","Bergen"], "Norway"],
  [["Zurich","Geneva","Basel","Bern","Lausanne"], "Switzerland"],
  [["Toronto","Vancouver","Montreal","Calgary","Ottawa","Edmonton"], "Canada"],
  [["New York","Los Angeles","Chicago","Houston","Dallas","San Jose","Seattle","Miami","Boston","Washington","San Diego","San Francisco","Phoenix","Denver","Atlanta","Las Vegas","Portland","Sacramento","Dania Beach","Fort Lauderdale"], "United States"],
  [["Melbourne","Sydney","Brisbane","Perth"], "Australia"],
  [["Dubai","Abu Dhabi"], "United Arab Emirates"],
  [["Istanbul"], "Turkey"],
]) for (const c of cities) CITY_MAP[c.toLowerCase()] = { city: c, country };

function resolveCity(cityRaw, stateRaw, countryRaw) {
  if (!cityRaw) return { city: null, country: countryRaw ?? null };
  // strip state from "City, ST" format
  const clean = cityRaw.replace(/,\s*[A-Z]{2}$/, "").trim();
  const hit = CITY_MAP[clean.toLowerCase()];
  if (hit) return hit;
  for (const [k, v] of Object.entries(CITY_MAP)) {
    if (clean.toLowerCase().includes(k)) return v;
  }
  // US state hint
  if (stateRaw || /\b[A-Z]{2}\b/.test(cityRaw)) return { city: clean, country: "United States" };
  return { city: clean, country: countryRaw ?? null };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function esc(v) {
  if (v == null) return "NULL";
  return "'" + String(v).replace(/\\/g,"\\\\").replace(/'/g,"\\'") + "'";
}

function fmt(d) {
  if (!d || isNaN(new Date(d).getTime())) return null;
  const dt = new Date(d), p = n => String(n).padStart(2,"0");
  return `${dt.getFullYear()}-${p(dt.getMonth()+1)}-${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}:00`;
}

function isFuture(s) { return s && new Date(s) > new Date(); }

async function geocode(venue, city, country) {
  const q = [venue, city, country].filter(Boolean).join(", ");
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, { headers: { "User-Agent":"BiruniMap/1.0" } });
    const d = await r.json(); if (d[0]) return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
    const r2 = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent([city,country].filter(Boolean).join(", "))}&format=json&limit=1`, { headers: { "User-Agent":"BiruniMap/1.0" } });
    const d2 = await r2.json(); if (d2[0]) return { lat: parseFloat(d2[0].lat), lng: parseFloat(d2[0].lon) };
  } catch {}
  return { lat: null, lng: null };
}

// ── Parse JSON-LD events from a page ─────────────────────────────────────────

async function parseJsonLd(url, organizerName) {
  const H = { "User-Agent":"Mozilla/5.0 Chrome/124", "Accept":"text/html" };
  let html;
  try { const r = await fetch(url, { headers: H }); if (!r.ok) { console.log(`  HTTP ${r.status}`); return []; } html = await r.text(); }
  catch(e) { console.log(`  fetch error: ${e.message}`); return []; }

  // Extract all JSON-LD blocks
  const blocks = [];
  const re = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try { blocks.push(JSON.parse(m[1].trim())); } catch {}
  }

  const events = [];
  for (const block of blocks) {
    const items = Array.isArray(block) ? block : [block];
    for (const item of items) {
      // Could be {"event": [...]} wrapper or direct Event
      const candidates = item["@type"] === "Event" || item["@type"] === "ComedyEvent" ? [item]
        : (item.event ? (Array.isArray(item.event) ? item.event : [item.event]) : []);
      for (const ev of candidates) {
        if (!ev.startDate || !isFuture(ev.startDate)) continue;
        const loc = ev.location ?? {};
        const addr = loc.address ?? {};
        const cityRaw = addr.addressLocality ?? loc.name ?? "";
        const resolved = resolveCity(cityRaw, addr.addressRegion, addr.addressCountry);
        const fullAddr = [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean).join(", ");
        const ticketUrl = ev.offers?.url || ev.offers?.[0]?.url || null;
        events.push({
          title:          ev.name ?? organizerName,
          title_fa:       null,
          event_type:     "conference",
          city:           resolved.city,
          country:        resolved.country,
          venue:          loc.name ?? null,
          address:        fullAddr || null,
          start_date:     fmt(ev.startDate),
          end_date:       fmt(ev.endDate) ?? fmt(new Date(new Date(ev.startDate).getTime() + 2.5*3600*1000).toISOString()),
          description:    (ev.description ?? "").slice(0,800) || null,
          external_link:  ticketUrl ?? url,
          organizer_name: organizerName,
          lat: null, lng: null,
          status: "approved",
        });
      }
    }
  }
  console.log(`  Found ${events.length} JSON-LD events`);
  return events;
}

// ── Groq web search for Shadmehr (JS-rendered site) ──────────────────────────

async function groqWebSearch(artist, retries=0) {
  const key = nextKey();
  const today = new Date().toISOString().slice(0,10);
  const prompt = `Search the web right now for upcoming live concert tour dates for the Iranian pop singer Shadmehr Aghili (also spelled Shadmehr) after ${today}.

Return ONLY a JSON array — no markdown. Each item:
{"title":"event name","title_fa":"Persian title or null","event_type":"concert","city":"city","country":"country","venue":"venue or null","address":"address or null","start_date":"YYYY-MM-DD HH:MM:00","end_date":"YYYY-MM-DD HH:MM:00 or null","description":"short description or null","external_link":"ticket URL or null","organizer_name":"Shadmehr"}

Only include CONFIRMED future events. If none found, return [].`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
      body:JSON.stringify({model:"compound-beta-mini",temperature:0.1,max_tokens:3000,messages:[{role:"user",content:prompt}]}),
    });
    if (res.status===429) { if(retries<4){await sleep((retries+1)*6000);return groqWebSearch(artist,retries+1);}return []; }
    if (res.status===401) { if(retries<KEYS.length){await sleep(500);return groqWebSearch(artist,retries+1);}return []; }
    if (!res.ok) { console.log(`  Groq ${res.status}`); return []; }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = fenced ? fenced[1] : text;
    const m = raw.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (!m) return [];
    const events = JSON.parse(m[0]).filter(ev=>ev.title&&ev.start_date&&isFuture(ev.start_date));
    console.log(`  Groq web search: ${events.length} events`);
    return events.map(ev=>({...ev, start_date:fmt(ev.start_date), end_date:fmt(ev.end_date)??fmt(new Date(new Date(ev.start_date).getTime()+3*3600*1000).toISOString()), lat:null, lng:null, status:"approved"}));
  } catch(e) { if(retries<2){await sleep(3000);return groqWebSearch(artist,retries+1);}return []; }
}

// ── SQL builder ───────────────────────────────────────────────────────────────

function buildSql(rows) {
  if (!rows.length) return null;
  return [
    "-- BiruniMap JSON-LD + Groq events",
    `-- Generated: ${new Date().toISOString()}`,
    "-- Uses INSERT IGNORE to skip duplicates",
    "","SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";","SET time_zone = \"+00:00\";","/*!40101 SET NAMES utf8mb4 */;","",
    "INSERT IGNORE INTO events",
    "  (title, title_fa, event_type, country, city, venue, address, lat, lng,",
    "   start_date, end_date, is_recurring, recurrence_type, description, external_link,",
    "   organizer_name, organizer_email, status)",
    "VALUES",
    rows.map(ev=>`  (${[esc(ev.title),esc(ev.title_fa),esc(ev.event_type??"other"),esc(ev.country),esc(ev.city),esc(ev.venue),esc(ev.address),ev.lat??"NULL",ev.lng??"NULL",esc(ev.start_date),esc(ev.end_date),0,"NULL",esc((ev.description??"").slice(0,800)||null),esc(ev.external_link),esc(ev.organizer_name),"NULL",esc(ev.status??"approved")].join(", ")})`).join(",\n"),
    ";",
  ].join("\n");
}

async function main() {
  console.log("=== JSON-LD + Groq scraper for remaining sites ===\n");

  const existing = fs.existsSync(FOUND_FILE) ? JSON.parse(fs.readFileSync(FOUND_FILE,"utf8")) : [];
  const seen = new Set(existing.map(ev=>((ev.title??"")+(ev.start_date??"")).toLowerCase().replace(/\s+/g,"")));
  console.log(`Existing: ${existing.length} events`);

  const newEvents = [];

  // Maz Jobrani — JSON-LD
  console.log("\n── Maz Jobrani (JSON-LD)");
  const mazEvents = await parseJsonLd("https://www.mazjobrani.com/live/", "Maz Jobrani");
  for (const ev of mazEvents) {
    const key = ((ev.title??"")+(ev.start_date??"")).toLowerCase().replace(/\s+/g,"");
    if (seen.has(key)) { console.log(`    dup: ${ev.title}`); continue; }
    seen.add(key); newEvents.push(ev);
  }
  console.log(`  → ${mazEvents.length} parsed, added ${newEvents.length}`);

  await sleep(1500);

  // Shadmehr — Groq web search (Shopify JS-rendered, no static content)
  console.log("\n── Shadmehr Aghili (Groq web search)");
  const shadEvents = await groqWebSearch("Shadmehr Aghili");
  let shadAdded = 0;
  for (const ev of shadEvents) {
    const key = ((ev.title??"")+(ev.start_date??"")).toLowerCase().replace(/\s+/g,"");
    if (seen.has(key)) { console.log(`    dup: ${ev.title}`); continue; }
    seen.add(key); newEvents.push(ev); shadAdded++;
  }
  console.log(`  → added ${shadAdded}`);

  // Geocode
  console.log(`\nGeocoding ${newEvents.length} new events...`);
  for (const ev of newEvents) {
    await sleep(400);
    const {lat,lng} = await geocode(ev.venue, ev.city, ev.country);
    ev.lat=lat; ev.lng=lng;
  }

  const all = [...existing, ...newEvents];
  fs.writeFileSync(FOUND_FILE, JSON.stringify(all, null, 2), "utf8");
  console.log(`\nSaved JSON → ${FOUND_FILE} (${all.length} total)`);

  if (newEvents.length) {
    const sql = buildSql(newEvents);
    if (sql) {
      fs.appendFileSync(SQL_FILE, "\n\n" + sql, "utf8");
      console.log(`Appended ${newEvents.length} events to ${SQL_FILE}`);
    }
  } else {
    console.log("No new events.");
  }

  console.log(`\n=== Done: ${all.length} total events in ${FOUND_FILE} ===`);
  console.log(`Import ${SQL_FILE} via cPanel → phpMyAdmin → SQL tab.`);
}

main().catch(console.error);
