CREATE TABLE IF NOT EXISTS city_squares (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name_en     VARCHAR(120) NOT NULL,
  name_fa     VARCHAR(120) NOT NULL,
  city        VARCHAR(100) NOT NULL,
  country     VARCHAR(100) NOT NULL,
  lat         DECIMAL(10, 7) NOT NULL,
  lng         DECIMAL(10, 7) NOT NULL,
  description_en TEXT NULL,
  description_fa TEXT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_city (city, country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS square_links (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  square_id  INT NOT NULL,
  title_en   VARCHAR(200) NOT NULL,
  title_fa   VARCHAR(200) NULL,
  url        VARCHAR(500) NOT NULL,
  category   VARCHAR(50) NOT NULL DEFAULT 'other',
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (square_id) REFERENCES city_squares(id) ON DELETE CASCADE,
  INDEX idx_square (square_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
