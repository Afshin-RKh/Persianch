/**
 * scrape_websites_retry.mjs
 * Retry the 4 sites that failed in the main run (401 key issues, 413 payload).
 * Merges results into websites_found.json and websites_events.sql.
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
// Start from key 0 so we use fresh keys
function nextKey() { const k = KEYS[keyIdx % KEYS.length]; keyIdx++; return k; }

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
]) for (const c of cities) CITY_MAP[c.toLowerCase()] = { city: c, country };

function resolveCity(cityRaw, countryRaw) {
  if (!cityRaw) return { city: null, country: countryRaw ?? null };
  const hit = CITY_MAP[cityRaw.toLowerCase()];
  if (hit) return hit;
  for (const [k, v] of Object.entries(CITY_MAP)) {
    if (cityRaw.toLowerCase().includes(k) || k.includes(cityRaw.toLowerCase())) return v;
  }
  return { city: cityRaw, country: countryRaw ?? null };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function esc(v) { if (v==null) return "NULL"; return "'" + String(v).replace(/\\/g,"\\\\").replace(/'/g,"\\'") + "'"; }
function fmt(d) {
  if (!d||isNaN(new Date(d).getTime())) return null;
  const dt=new Date(d), p=n=>String(n).padStart(2,"0");
  return `${dt.getFullYear()}-${p(dt.getMonth()+1)}-${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}:00`;
}
function isFuture(s) { return s && new Date(s)>new Date(); }
function guessType(t="",d="") {
  const x=(t+" "+d).toLowerCase();
  if(/concert|live|music|band|singer|کنسرت/.test(x)) return "concert";
  if(/comedy|comedian|stand.?up|show/.test(x)) return "conference";
  if(/theatre|theater|play|drama/.test(x)) return "theatre";
  if(/dance|رقص/.test(x)) return "dance_class";
  if(/protest|rally|march/.test(x)) return "protest";
  if(/norouz|nowruz|yalda|نوروز|یلدا/.test(x)) return "religious_cultural";
  if(/party|gala|festival|celebration/.test(x)) return "party";
  return "other";
}

function parseJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const m = raw.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (!m) return [];
  try { return JSON.parse(m[0]); } catch { return []; }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi,"")
    .replace(/<style[\s\S]*?<\/style>/gi,"")
    .replace(/<[^>]+>/g," ")
    .replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/&lt;/g,"<")
    .replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/\s{3,}/g,"\n\n").trim();
}

async function fetchPage(url, label) {
  const H = { "User-Agent":"Mozilla/5.0 (Windows NT 10.0) Chrome/124", "Accept":"text/html" };
  try {
    const r = await fetch(url, { headers: H });
    if (!r.ok) { console.log(`  ${label}: HTTP ${r.status}`); return null; }
    const text = stripHtml(await r.text());
    console.log(`  ${label}: ${text.length} chars`);
    return text.slice(0, 8000);
  } catch(e) { console.log(`  ${label}: ${e.message}`); return null; }
}

async function geocode(venue, city, country) {
  const q=[venue,city,country].filter(Boolean).join(", ");
  try {
    const r=await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,{headers:{"User-Agent":"BiruniMap/1.0"}});
    const d=await r.json(); if(d[0]) return {lat:parseFloat(d[0].lat),lng:parseFloat(d[0].lon)};
    const r2=await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent([city,country].filter(Boolean).join(", "))}&format=json&limit=1`,{headers:{"User-Agent":"BiruniMap/1.0"}});
    const d2=await r2.json(); if(d2[0]) return {lat:parseFloat(d2[0].lat),lng:parseFloat(d2[0].lon)};
  } catch{}
  return {lat:null,lng:null};
}

async function groqParse(pageText, siteUrl, label, retries=0) {
  const key = nextKey();
  const today = new Date().toISOString().slice(0,10);
  const prompt = `Today is ${today}. Extract ALL upcoming events (after ${today}) from this ${label} website text. Return ONLY a JSON array, no markdown. Each item: {"title":"...","title_fa":"...or null","event_type":"concert|theatre|dance_class|protest|language_class|food_culture|art_exhibition|sports|religious_cultural|party|conference|other","city":"...","country":"...","venue":"...or null","address":"...or null","start_date":"YYYY-MM-DD HH:MM:00","end_date":"...or null","description":"max 200 chars or null","external_link":"...or null","organizer_name":"...or null"}. Comedy shows = conference type. If none found return [].

${pageText}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
      body:JSON.stringify({model:"compound-beta-mini",temperature:0.1,max_tokens:3000,messages:[{role:"user",content:prompt}]}),
    });
    if (res.status===429) { if(retries<4){await sleep((retries+1)*6000);return groqParse(pageText,siteUrl,label,retries+1);}return []; }
    if (res.status===401) { if(retries<KEYS.length){await sleep(500);return groqParse(pageText,siteUrl,label,retries+1);}console.log(`  ${label}: all keys 401`);return []; }
    if (res.status===413) { const s=pageText.slice(0,Math.floor(pageText.length*0.55)); if(retries<3&&s.length>500){return groqParse(s,siteUrl,label,retries+1);}return []; }
    if (!res.ok) { console.log(`  ${label}: Groq ${res.status}`); return []; }
    const data=await res.json();
    const text=data.choices?.[0]?.message?.content??"";
    return parseJson(text)
      .filter(ev=>ev.title&&ev.start_date&&isFuture(ev.start_date))
      .map(ev=>{
        const loc=resolveCity(ev.city,ev.country);
        return {
          title:ev.title, title_fa:ev.title_fa??null,
          event_type:ev.event_type||guessType(ev.title,ev.description??""),
          city:loc.city??ev.city??null, country:loc.country??ev.country??null,
          venue:ev.venue??null, address:ev.address??null,
          start_date:fmt(ev.start_date),
          end_date:fmt(ev.end_date)??fmt(new Date(new Date(ev.start_date).getTime()+3*3600*1000).toISOString()),
          description:(ev.description??"").slice(0,800)||null,
          external_link:ev.external_link??siteUrl,
          organizer_name:ev.organizer_name??null,
          lat:null,lng:null,status:"approved",
        };
      });
  } catch(e) { if(retries<2){await sleep(3000);return groqParse(pageText,siteUrl,label,retries+1);}return []; }
}

function buildSql(rows) {
  if (!rows.length) return null;
  return [
    "-- BiruniMap website-scraped events (retry batch)",
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

const RETRY_SITES = [
  { label: "Taablo Concerts",     url: "https://event.taablo.com/concert/" },
  { label: "Maz Jobrani Live",    url: "https://www.mazjobrani.com/live/" },
  { label: "Negin Farsad Events", url: "https://neginfarsad.com/events/" },
  { label: "Shadmehr Tour",       url: "https://www.shadmehrmusic.com/pages/tour" },
];

async function main() {
  console.log("=== Retry failed sites ===\n");

  // Load existing data to avoid duplicates
  const existing = fs.existsSync(FOUND_FILE) ? JSON.parse(fs.readFileSync(FOUND_FILE,"utf8")) : [];
  const seen = new Set(existing.map(ev=>((ev.title??"")+(ev.start_date??"")).toLowerCase().replace(/\s+/g,"")));
  console.log(`Existing: ${existing.length} events`);

  const newEvents = [];

  for (const { label, url } of RETRY_SITES) {
    console.log(`\n── ${label}`);
    const text = await fetchPage(url, label);
    if (!text) continue;
    await sleep(800);
    const events = await groqParse(text, url, label);
    let added = 0;
    for (const ev of events) {
      const key = ((ev.title??"")+(ev.start_date??"")).toLowerCase().replace(/\s+/g,"");
      if (seen.has(key)) { console.log(`    dup: ${ev.title}`); continue; }
      seen.add(key);
      newEvents.push(ev);
      added++;
    }
    console.log(`  → ${events.length} parsed, ${added} new`);
    await sleep(2000);
  }

  // Geocode new
  for (const ev of newEvents) {
    await sleep(400);
    const {lat,lng}=await geocode(ev.venue,ev.city,ev.country);
    ev.lat=lat; ev.lng=lng;
  }

  const all = [...existing, ...newEvents];
  fs.writeFileSync(FOUND_FILE, JSON.stringify(all, null, 2), "utf8");
  console.log(`\nUpdated JSON → ${FOUND_FILE} (${all.length} total)`);

  if (newEvents.length) {
    // Append to SQL file
    const appendSql = buildSql(newEvents);
    if (appendSql) {
      fs.appendFileSync(SQL_FILE, "\n\n" + appendSql, "utf8");
      console.log(`Appended ${newEvents.length} events to ${SQL_FILE}`);
    }
  } else {
    console.log("No new events to add.");
  }
}

main().catch(console.error);
