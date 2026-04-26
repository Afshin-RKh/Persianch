CREATE TABLE IF NOT EXISTS businesses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_fa VARCHAR(255),
  category VARCHAR(100) NOT NULL DEFAULT 'other',
  city VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  email VARCHAR(255),
  instagram VARCHAR(100),
  description TEXT,
  description_fa TEXT,
  logo_url VARCHAR(255),
  image_url VARCHAR(255),
  google_maps_url VARCHAR(500),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_fa VARCHAR(255),
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  content_fa TEXT,
  cover_image VARCHAR(255),
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO businesses (name, name_fa, category, city, address, phone, description, description_fa, lat, lng, is_featured, is_verified) VALUES
('Persian Kitchen Zurich', 'آشپزخانه پارسی زوریخ', 'restaurant', 'Zurich', 'Bahnhofstrasse 10', '+41 44 000 0001', 'Authentic Persian cuisine in the heart of Zurich.', 'غذای اصیل ایرانی در قلب زوریخ', 47.3769, 8.5417, TRUE, TRUE),
('Dr. Rezaei Medical', 'دکتر رضایی', 'doctor', 'Geneva', 'Rue de Rive 5', '+41 22 000 0002', 'General practitioner speaking Farsi, French and English.', 'پزشک عمومی با زبان فارسی', 46.2044, 6.1432, TRUE, TRUE),
('Tehran Cafe Basel', 'کافه تهران بازل', 'cafe', 'Basel', 'Freie Strasse 20', '+41 61 000 0003', 'Cozy Persian cafe with tea and sweets.', 'کافه ایرانی دنج با چای و شیرینی', 47.5596, 7.5886, FALSE, TRUE);
