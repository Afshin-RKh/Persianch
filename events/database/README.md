# Events Database

Same workflow as `/database/` for businesses.

## Files

| File | Purpose |
|---|---|
| `scrape_volek.mjs` | Scraper for volek.events — run periodically to pick up new Swiss events |
| `switzerland_seed.sql` | 13 hand-crafted Swiss events to seed the database |

## How to import

1. Open cPanel → phpMyAdmin → `afshxhoj_birunimap` database
2. Click **SQL** tab
3. Paste content of `switzerland_seed.sql` and click **Go**

## Running the scraper

```bash
cd events/database
node scrape_volek.mjs
```

Output: `volek_switzerland.sql` → import the same way via phpMyAdmin.

> **Note:** volek.events renders event listings via JavaScript. The scraper works
> when events are available in the raw HTML (static render). If it returns 0 results,
> the current listing page has no Swiss events — check the site manually and add them
> to a new `.sql` file following the same INSERT format.

## Event types

| value | label |
|---|---|
| concert | Concert |
| theatre | Theatre |
| protest | Protest / Gathering |
| language_class | Language Class |
| dance_class | Dance Class |
| food_culture | Food & Culture |
| art_exhibition | Art Exhibition |
| sports | Sports |
| religious_cultural | Religious / Cultural |
| party | Party / Celebration |
| conference | Conference / Talk |
| other | Other |
