/**
 * geocode_fallback.mjs
 * Fills in coordinates for known US/Canada cities using hardcoded values,
 * then rebuilds master_events.sql.
 */
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOUND_FILE = path.join(__dirname, "websites_found.json");

// City-centre coordinates for common cities (fallback when Nominatim fails)
const CITY_COORDS = {
  "hermosa beach":  { lat: 33.8622, lng: -118.3995 },
  "skokie":         { lat: 42.0334, lng: -87.7339  },
  "pasadena":       { lat: 34.1478, lng: -118.1445 },
  "san jose":       { lat: 37.3382, lng: -121.8863 },
  "kansas city":    { lat: 39.0997, lng: -94.5786  },
  "tacoma":         { lat: 47.2529, lng: -122.4443 },
  "sacramento":     { lat: 38.5816, lng: -121.4944 },
  "detroit":        { lat: 42.3314, lng: -83.0458  },
  "detroit, mi":    { lat: 42.3314, lng: -83.0458  },
  "dania beach":    { lat: 26.0523, lng: -80.1437  },
  // Canada
  "victoria":       { lat: 48.4284, lng: -123.3656 },
  "edmonton":       { lat: 53.5461, lng: -113.4938 },
};

const events = JSON.parse(fs.readFileSync(FOUND_FILE, "utf8"));
let fixed = 0;

for (const ev of events) {
  if (ev.lat != null && ev.lng != null) continue;
  const key = (ev.city ?? "").toLowerCase().trim();
  const hit = CITY_COORDS[key];
  if (hit) {
    ev.lat = hit.lat;
    ev.lng = hit.lng;
    fixed++;
    console.log(`  ✓ ${ev.city} — ${ev.title.slice(0,50)}`);
  }
}

console.log(`\nFilled ${fixed} events with hardcoded city coords.`);

const remaining = events.filter(e => e.lat == null);
if (remaining.length) {
  console.log(`Still null (${remaining.length}):`);
  remaining.forEach(e => console.log(`  ✗ ${e.city}, ${e.country}`));
}

fs.writeFileSync(FOUND_FILE, JSON.stringify(events, null, 2), "utf8");
console.log("Saved → websites_found.json");
console.log("\nRebuilding master_events.sql...");
execSync("node build_master.mjs", { cwd: __dirname, stdio: "inherit" });
