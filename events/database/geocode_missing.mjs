/**
 * geocode_missing.mjs
 * Re-geocodes all events in websites_found.json that have null lat/lng,
 * then rebuilds master_events.sql via build_master.mjs.
 * Usage: node geocode_missing.mjs
 */
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOUND_FILE = path.join(__dirname, "websites_found.json");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function geocode(venue, city, country) {
  const q = [venue, city, country].filter(Boolean).join(", ");
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      { headers: { "User-Agent": "BiruniMap/1.0" } });
    const d = await r.json();
    if (d[0]) return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
  } catch {}
  // fallback: city + country only
  try {
    const q2 = [city, country].filter(Boolean).join(", ");
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q2)}&format=json&limit=1`,
      { headers: { "User-Agent": "BiruniMap/1.0" } });
    const d = await r.json();
    if (d[0]) return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
  } catch {}
  return { lat: null, lng: null };
}

async function main() {
  const events = JSON.parse(fs.readFileSync(FOUND_FILE, "utf8"));
  const missing = events.filter(e => e.lat == null || e.lng == null);
  console.log(`Geocoding ${missing.length} / ${events.length} events with missing coordinates...`);

  let fixed = 0;
  for (const ev of missing) {
    await sleep(1100); // Nominatim: max 1 req/sec
    const { lat, lng } = await geocode(ev.venue, ev.city, ev.country);
    ev.lat = lat;
    ev.lng = lng;
    if (lat != null) { fixed++; process.stdout.write(`  ✓ ${ev.city} — ${ev.title.slice(0,45)}\n`); }
    else process.stdout.write(`  ✗ no result — ${ev.city}, ${ev.country}\n`);
  }

  fs.writeFileSync(FOUND_FILE, JSON.stringify(events, null, 2), "utf8");
  console.log(`\nFixed ${fixed} / ${missing.length}. Saved → ${FOUND_FILE}`);

  console.log("\nRebuilding master_events.sql...");
  execSync("node build_master.mjs", { cwd: __dirname, stdio: "inherit" });
}

main().catch(console.error);
