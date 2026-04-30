/**
 * build_master.mjs
 * Combines ALL event sources into one clean master_events.sql,
 * normalising country/city to match REGIONS_BY_COUNTRY in src/types/index.ts
 * Usage: node build_master.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Canonical city→country map (from src/types/index.ts) ─────────────────────

const CANONICAL = {};
const RAW = {
  Switzerland: ["Zurich","Geneva","Basel","Bern","Lausanne","Lucerne","Winterthur","St. Gallen","Lugano","Biel","Zug","Schaffhausen","Thun","Fribourg","Neuchâtel","Sion","La Chaux-de-Fonds","Uster","Köniz","Vernier"],
  Germany: ["Berlin","Hamburg","Munich","Cologne","Frankfurt","Stuttgart","Düsseldorf","Dortmund","Essen","Leipzig","Bremen","Dresden","Hanover","Nuremberg","Duisburg","Bochum","Wuppertal","Bielefeld","Bonn","Münster","Karlsruhe","Mannheim","Augsburg","Wiesbaden","Aachen","Braunschweig","Kiel","Freiburg","Erfurt","Mainz","Rostock","Kassel","Osnabrück","Heidelberg","Regensburg","Würzburg","Ulm","Wolfsburg","Göttingen","Chemnitz","Magdeburg","Halle","Ingolstadt"],
  Austria: ["Vienna","Graz","Linz","Salzburg","Innsbruck","Klagenfurt","Villach","Wels","Sankt Pölten","Dornbirn","Wiener Neustadt","Steyr","Feldkirch","Bregenz","Leoben"],
  France: ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille","Rennes","Reims","Le Havre","Saint-Étienne","Toulon","Grenoble","Dijon","Angers","Nîmes","Clermont-Ferrand","Brest","Tours","Amiens","Limoges","Metz","Perpignan","Besançon","Orléans","Mulhouse","Rouen","Caen","Nancy","Avignon","Poitiers"],
  "United Kingdom": ["London","Birmingham","Manchester","Glasgow","Liverpool","Bristol","Sheffield","Leeds","Edinburgh","Leicester","Coventry","Bradford","Nottingham","Newcastle","Southampton","Portsmouth","Cardiff","Aberdeen","Brighton","Derby","Plymouth","Wolverhampton","Belfast","Cambridge","Oxford","Reading","Sunderland","Huddersfield","Swansea","Bournemouth","Peterborough","Luton","Ipswich","Milton Keynes","Norwich","York","Bath","Exeter"],
  Netherlands: ["Amsterdam","Rotterdam","The Hague","Utrecht","Eindhoven","Tilburg","Groningen","Almere","Breda","Nijmegen","Enschede","Apeldoorn","Haarlem","Arnhem","Amersfoort","Leiden","Maastricht","Delft","Deventer","Venlo","Leeuwarden"],
  Sweden: ["Stockholm","Gothenburg","Malmö","Uppsala","Västerås","Örebro","Linköping","Helsingborg","Jönköping","Norrköping","Lund","Umeå","Gävle","Borås","Eskilstuna","Halmstad","Växjö","Karlstad","Sundsvall","Östersund","Luleå"],
  Norway: ["Oslo","Bergen","Trondheim","Stavanger","Drammen","Fredrikstad","Tromsø","Kristiansand","Sandnes","Ålesund","Sarpsborg","Bodø","Tønsberg","Hamar","Molde"],
  Denmark: ["Copenhagen","Aarhus","Odense","Aalborg","Esbjerg","Randers","Kolding","Horsens","Vejle","Roskilde","Herning","Silkeborg","Næstved","Viborg"],
  Belgium: ["Brussels","Antwerp","Ghent","Charleroi","Liège","Bruges","Namur","Leuven","Mons","Aalst","Mechelen","Kortrijk","Hasselt","Ostend","Genk"],
  "United States": ["New York City","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose","Austin","Jacksonville","Fort Worth","Columbus","Charlotte","Indianapolis","San Francisco","Seattle","Denver","Nashville","El Paso","Washington DC","Las Vegas","Louisville","Portland","Oklahoma City","Milwaukee","Albuquerque","Tucson","Fresno","Sacramento","Kansas City","Atlanta","Mesa","Omaha","Colorado Springs","Raleigh","Long Beach","Virginia Beach","Minneapolis","Tampa","New Orleans","Arlington","Wichita","Bakersfield","Aurora","Anaheim","Santa Ana","Corpus Christi","Riverside","Pittsburgh","Anchorage","Cincinnati","St. Paul","Greensboro","Newark","Plano","Henderson","Lincoln","Buffalo","Jersey City","Chula Vista","St. Petersburg","Norfolk","Chandler","Laredo","Madison","Durham","Lubbock","Garland","Glendale","Hialeah","Reno","Baton Rouge","Irvine","Irving","Scottsdale","Fremont","Gilbert","San Bernardino","Birmingham","Boise","Rochester","Spokane","Des Moines","Modesto","Tacoma","Fontana","Akron","Yonkers","Huntington Beach","Little Rock","Augusta","Grand Rapids","Tallahassee","Knoxville","Worcester","Providence","Fort Collins","Detroit","Miami","Baltimore","Boston","Fort Lauderdale"],
  Canada: ["Toronto","Montreal","Vancouver","Calgary","Edmonton","Ottawa","Winnipeg","Quebec City","Hamilton","Kitchener","London","Halifax","Victoria","Saskatoon","Regina","Windsor","Barrie","Kelowna","Burnaby","Surrey","Brampton","Mississauga","Markham","Oakville","Longueuil","Laval","Gatineau","Sherbrooke","Trois-Rivières","Abbotsford","Coquitlam","Sudbury","Kingston","Thunder Bay","Guelph","Moncton","St. John's"],
  Australia: ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Gold Coast","Canberra","Newcastle","Wollongong","Sunshine Coast","Hobart","Geelong","Townsville","Cairns","Darwin","Toowoomba","Ballarat","Bendigo"],
  "United Arab Emirates": ["Dubai","Abu Dhabi","Sharjah","Ajman","Ras Al Khaimah","Al Ain","Fujairah"],
  Turkey: ["Istanbul","Ankara","Izmir","Bursa","Adana","Gaziantep","Konya","Antalya","Kayseri"],
  Greece: ["Athens","Thessaloniki","Patras"],
  Spain: ["Madrid","Barcelona","Valencia","Seville","Zaragoza","Málaga","Murcia","Palma","Las Palmas","Bilbao"],
  Italy: ["Rome","Milan","Naples","Turin","Palermo","Genoa","Bologna","Florence","Bari","Venice"],
  Ireland: ["Dublin","Cork","Limerick","Galway","Waterford"],
  Finland: ["Helsinki","Espoo","Tampere","Vantaa","Oulu","Turku"],
  Israel: ["Tel Aviv","Jerusalem","Haifa"],
};

for (const [country, cities] of Object.entries(RAW)) {
  for (const city of cities) {
    CANONICAL[city.toLowerCase()] = { city, country };
  }
}

// Manual aliases — wrong spellings → canonical
const ALIAS = {
  "new york":           { city: "New York City",  country: "United States" },
  "new york city":      { city: "New York City",  country: "United States" },
  "washington":         { city: "Washington DC",  country: "United States" },
  "washington dc":      { city: "Washington DC",  country: "United States" },
  "washington d.c.":    { city: "Washington DC",  country: "United States" },
  "washington, dc":     { city: "Washington DC",  country: "United States" },
  "san jose":           { city: "San Jose",        country: "United States" },
  "göteborg":           { city: "Gothenburg",      country: "Sweden" },
  "hannover":           { city: "Hanover",         country: "Germany" },
  "dania beach":        { city: "Fort Lauderdale", country: "United States" },
  "ft. lauderdale":     { city: "Fort Lauderdale", country: "United States" },
  "fort lauderdale":    { city: "Fort Lauderdale", country: "United States" },
  "phoenix":            { city: "Phoenix",         country: "United States" },
  "los angeles":        { city: "Los Angeles",     country: "United States" },
  "san francisco":      { city: "San Francisco",   country: "United States" },
  "san diego":          { city: "San Diego",       country: "United States" },
  "chicago":            { city: "Chicago",         country: "United States" },
  "houston":            { city: "Houston",         country: "United States" },
  "dallas":             { city: "Dallas",          country: "United States" },
  "seattle":            { city: "Seattle",         country: "United States" },
  "boston":             { city: "Boston",          country: "United States" },
  "miami":              { city: "Miami",           country: "United States" },
  "atlanta":            { city: "Atlanta",         country: "United States" },
  "denver":             { city: "Denver",          country: "United States" },
  "minneapolis":        { city: "Minneapolis",     country: "United States" },
  "portland":           { city: "Portland",        country: "United States" },
  "sacramento":         { city: "Sacramento",      country: "United States" },
  "tacoma":             { city: "Tacoma",          country: "United States" },
  "irvine":             { city: "Irvine",          country: "United States" },
  "las vegas":          { city: "Las Vegas",       country: "United States" },
  "kansas city":        { city: "Kansas City",     country: "United States" },
  "reno":               { city: "Reno",            country: "United States" },
  "comedy club kc":     { city: "Kansas City",     country: "United States" },
  // Small US cities → nearest metro
  "hermosa beach":      { city: "Los Angeles",     country: "United States" },
  "skokie":             { city: "Chicago",         country: "United States" },
  "pasadena":           { city: "Los Angeles",     country: "United States" },
  "new jersey":         { city: "Newark",          country: "United States" },
  "nj":                 { city: "Newark",          country: "United States" },
  // Small UK towns → nearest city or London
  "ilkley":             { city: "Leeds",           country: "United Kingdom" },
  "crewe":              { city: "Manchester",      country: "United Kingdom" },
  "salford":            { city: "Manchester",      country: "United Kingdom" },
  "worthing":           { city: "Brighton",        country: "United Kingdom" },
  "leamington spa":     { city: "Birmingham",      country: "United Kingdom" },
  "royal leamington spa": { city: "Birmingham",    country: "United Kingdom" },
  // Greece
  "athens":             { city: "Athens",          country: "Greece" },
};

function normalise(city, country) {
  if (!city) return { city: null, country: country ?? null };
  const key = city.toLowerCase().trim().replace(/,\s*[a-z]{2}$/i, "");
  const hit = ALIAS[key] ?? CANONICAL[key];
  if (hit) return hit;
  // partial match
  for (const [k, v] of Object.entries(ALIAS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  for (const [k, v] of Object.entries(CANONICAL)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return { city: city.trim(), country: country ?? null };
}

// ── SQL helpers ───────────────────────────────────────────────────────────────

function esc(v) {
  if (v === null || v === undefined) return "NULL";
  return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

function isFuture(s) { return s && new Date(s) > new Date(); }

// Remap old event_type values to new 7-category system
const TYPE_REMAP = {
  theatre:            "show",
  art_exhibition:     "show",
  conference:         "show",
  food_culture:       "other",
  protest:            "march",
  language_class:     "class",
  dance_class:        "class",
  religious_cultural: "party",
};
function remapType(t) { return TYPE_REMAP[t] ?? t ?? "other"; }

// ── SQL parser ────────────────────────────────────────────────────────────────

function splitFields(row) {
  const fields = [];
  let cur = "", inStr = false, esc = false;
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (esc) { cur += c; esc = false; continue; }
    if (c === "\\" && inStr) { cur += c; esc = true; continue; }
    if (c === "'") { inStr = !inStr; cur += c; continue; }
    if (c === "," && !inStr) { fields.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) fields.push(cur.trim());
  return fields;
}

function unquote(s) {
  if (!s) return null;
  s = s.trim();
  if (s === "NULL") return null;
  if (s.startsWith("'") && s.endsWith("'"))
    return s.slice(1,-1).replace(/\\'/g,"'").replace(/\\\\/g,"\\");
  return s;
}

function parseSqlFile(filepath) {
  const sql = fs.readFileSync(filepath, "utf8");
  const clean = sql.replace(/--[^\n]*/g,"").replace(/\/\*[\s\S]*?\*\//g,"");
  const vm = clean.match(/VALUES\s*([\s\S]+?)\s*;/i);
  if (!vm) return [];
  const vb = vm[1];
  const rows = [];
  let depth=0, start=-1, inStr=false, escp=false;
  for (let i=0;i<vb.length;i++) {
    const c=vb[i];
    if(escp){escp=false;continue;}
    if(c==="\\"&&inStr){escp=true;continue;}
    if(c==="'"){inStr=!inStr;continue;}
    if(inStr)continue;
    if(c==="("){if(depth===0)start=i;depth++;}
    else if(c===")"){depth--;if(depth===0&&start!==-1){rows.push(vb.slice(start+1,i));start=-1;}}
  }
  return rows.map(row => {
    const f = splitFields(row);
    if (f.length < 18) return null;
    return {
      title:          unquote(f[0]),
      title_fa:       unquote(f[1]),
      event_type:     unquote(f[2]),
      country:        unquote(f[3]),
      city:           unquote(f[4]),
      venue:          unquote(f[5]),
      address:        unquote(f[6]),
      lat:            f[7].trim()==="NULL"?null:parseFloat(f[7]),
      lng:            f[8].trim()==="NULL"?null:parseFloat(f[8]),
      start_date:     unquote(f[9]),
      end_date:       unquote(f[10]),
      is_recurring:   parseInt(f[11])||0,
      recurrence_type:unquote(f[12]),
      description:    unquote(f[13]),
      external_link:  unquote(f[14]),
      organizer_name: unquote(f[15]),
      organizer_email:unquote(f[16]),
      status:         unquote(f[17]),
    };
  }).filter(Boolean);
}

// ── Load & merge ──────────────────────────────────────────────────────────────

const seen = new Set();
const all  = [];

function addEvents(events, label) {
  let added=0, dupes=0, past=0, fixed=0;
  for (let ev of events) {
    if (!isFuture(ev.start_date)) { past++; continue; }
    // Normalise city/country
    const norm = normalise(ev.city, ev.country);
    if (norm.city !== ev.city || norm.country !== ev.country) {
      fixed++;
      ev = { ...ev, city: norm.city, country: norm.country };
    }
    const key = ((ev.title??"")+"|"+(ev.start_date??"")+"|"+(ev.city??"")+"|"+(ev.country??"")).toLowerCase().replace(/\s+/g,"");
    if (seen.has(key)) { dupes++; continue; }
    seen.add(key);
    ev.status = ev.status || "approved";
    ev.event_type = remapType(ev.event_type);
    all.push(ev);
    added++;
  }
  console.log(`  ${label}: +${added}  (${dupes} dupes, ${past} past, ${fixed} city/country fixed)`);
}

const SQL_SOURCES = ["switzerland_seed.sql","volek_events.sql","ai_events.sql","scraped_events.sql"];
for (const f of SQL_SOURCES) {
  const fp = path.join(__dirname, f);
  if (!fs.existsSync(fp)) { console.log(`  SKIP: ${f}`); continue; }
  addEvents(parseSqlFile(fp), f);
}

const webPath = path.join(__dirname, "websites_found.json");
if (fs.existsSync(webPath))
  addEvents(JSON.parse(fs.readFileSync(webPath,"utf8")), "websites_found.json");

all.sort((a,b)=>(a.start_date??"").localeCompare(b.start_date??""));
console.log(`\nTotal unique future events: ${all.length}`);

// ── Write master SQL ──────────────────────────────────────────────────────────

const sql = [
  "-- BiruniMap Master Events — ALL SOURCES COMBINED",
  `-- Generated: ${new Date().toISOString()}`,
  `-- Total events: ${all.length}`,
  "-- Country/city values match REGIONS_BY_COUNTRY in src/types/index.ts",
  "-- Safe to re-run: INSERT IGNORE skips existing rows",
  "",
  'SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";',
  'START TRANSACTION;',
  'SET time_zone = "+00:00";',
  "",
  "/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;",
  "/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;",
  "/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;",
  "/*!40101 SET NAMES utf8mb4 */;",
  "",
  "-- Fix charset on existing table so Persian text stores correctly (safe to re-run)",
  "ALTER TABLE events CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
  "",
  "-- Update ENUM to new 7-category system and remap old values",
  "ALTER TABLE events MODIFY event_type ENUM('concert','show','march','class','sports','party','other') NOT NULL DEFAULT 'other';",
  "UPDATE events SET event_type='show'  WHERE event_type IN ('theatre','art_exhibition','conference');",
  "UPDATE events SET event_type='march' WHERE event_type='protest';",
  "UPDATE events SET event_type='class' WHERE event_type IN ('language_class','dance_class');",
  "UPDATE events SET event_type='party' WHERE event_type='religious_cultural';",
  "UPDATE events SET event_type='other' WHERE event_type='food_culture';",
  "",
  "INSERT IGNORE INTO events",
  "  (title, title_fa, event_type, country, city, venue, address, lat, lng,",
  "   start_date, end_date, is_recurring, recurrence_type, description, external_link,",
  "   organizer_name, organizer_email, status)",
  "VALUES",
  all.map(ev => `  (${[
    esc(ev.title), esc(ev.title_fa), esc(ev.event_type??"other"),
    esc(ev.country), esc(ev.city), esc(ev.venue), esc(ev.address),
    ev.lat??"NULL", ev.lng??"NULL",
    esc(ev.start_date), esc(ev.end_date),
    ev.is_recurring??0, esc(ev.recurrence_type),
    esc((ev.description??"").slice(0,800)||null), esc(ev.external_link),
    esc(ev.organizer_name), esc(ev.organizer_email), esc(ev.status??"approved"),
  ].join(", ")})`).join(",\n"),
  ";",
  "",
  "COMMIT;",
  "",
  "/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;",
  "/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;",
  "/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;",
].join("\n");

const out = path.join(__dirname, "master_events.sql");
fs.writeFileSync(out, sql, "utf8");
console.log(`Saved → master_events.sql  (${(fs.statSync(out).size/1024).toFixed(1)} KB)`);

// ── Audit: show any city/country combos that didn't match canonical ───────────
const unmatched = all.filter(ev => {
  if (!ev.country) return true;
  const cities = RAW[ev.country];
  if (!cities) return true; // country not in our subset (still valid, e.g. smaller countries)
  return ev.city && !cities.includes(ev.city);
});
if (unmatched.length) {
  console.log(`\nWarning — ${unmatched.length} events with city not in canonical list:`);
  for (const ev of unmatched) console.log(`  "${ev.city}", "${ev.country}" — ${ev.title}`);
} else {
  console.log("\nAll cities match the canonical list.");
}
