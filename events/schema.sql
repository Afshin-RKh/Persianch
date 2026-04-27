-- BiruniMap Events Schema
-- Run this in your cPanel MySQL database

CREATE TABLE IF NOT EXISTS events (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  title               VARCHAR(255)  NOT NULL,
  title_fa            VARCHAR(255)  DEFAULT NULL,
  description         TEXT          DEFAULT NULL,
  description_fa      TEXT          DEFAULT NULL,
  event_type          ENUM(
    'concert','theatre','protest','language_class','dance_class',
    'food_culture','art_exhibition','sports','religious_cultural',
    'party','conference','other'
  ) NOT NULL DEFAULT 'other',
  country             VARCHAR(100)  NOT NULL,
  city                VARCHAR(100)  NOT NULL,
  address             VARCHAR(255)  DEFAULT NULL,
  venue               VARCHAR(255)  DEFAULT NULL,
  lat                 DECIMAL(10,7) DEFAULT NULL,
  lng                 DECIMAL(10,7) DEFAULT NULL,
  start_date          DATETIME      NOT NULL,
  end_date            DATETIME      NOT NULL,
  is_recurring        TINYINT(1)    NOT NULL DEFAULT 0,
  recurrence_type     ENUM('weekly','biweekly','monthly') DEFAULT NULL,
  recurrence_end_date DATE          DEFAULT NULL,
  external_link       VARCHAR(500)  DEFAULT NULL,
  cover_image         VARCHAR(500)  DEFAULT NULL,
  organizer_name      VARCHAR(255)  DEFAULT NULL,
  organizer_email     VARCHAR(255)  DEFAULT NULL,
  status              ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  submitted_by        INT           DEFAULT NULL,
  created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_events_status       ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date   ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_country_city ON events(country, city);
