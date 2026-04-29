-- Performance indexes for BiruniMap
-- Run once in phpMyAdmin — all use IF NOT EXISTS so safe to re-run

-- businesses: bounds query (lat/lng BETWEEN) — most critical, used on every map move
ALTER TABLE businesses ADD INDEX IF NOT EXISTS idx_biz_lat    (lat);
ALTER TABLE businesses ADD INDEX IF NOT EXISTS idx_biz_lng    (lng);
ALTER TABLE businesses ADD INDEX IF NOT EXISTS idx_biz_approved (is_approved);
ALTER TABLE businesses ADD INDEX IF NOT EXISTS idx_biz_approved_lat_lng (is_approved, lat, lng);
ALTER TABLE businesses ADD INDEX IF NOT EXISTS idx_biz_category (category);
ALTER TABLE businesses ADD INDEX IF NOT EXISTS idx_biz_country_canton (country, canton);

-- events: bounds query + date range filter
ALTER TABLE events ADD INDEX IF NOT EXISTS idx_evt_lat     (lat);
ALTER TABLE events ADD INDEX IF NOT EXISTS idx_evt_lng     (lng);
ALTER TABLE events ADD INDEX IF NOT EXISTS idx_evt_status_lat_lng (status, lat, lng);
ALTER TABLE events ADD INDEX IF NOT EXISTS idx_evt_start_end (start_date, end_date);
ALTER TABLE events ADD INDEX IF NOT EXISTS idx_evt_recurring (is_recurring, recurrence_end_date);
