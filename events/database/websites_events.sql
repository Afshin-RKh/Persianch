-- BiruniMap website-scraped events
-- Generated: 2026-04-28T11:58:15.941Z
-- Import via cPanel → phpMyAdmin → SQL tab
-- Uses INSERT IGNORE to skip duplicates (requires unique index on title+start_date)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
/*!40101 SET NAMES utf8mb4 */;

INSERT IGNORE INTO events
  (title, title_fa, event_type, country, city, venue, address, lat, lng,
   start_date, end_date, is_recurring, recurrence_type, description, external_link,
   organizer_name, organizer_email, status)
VALUES
  ('Sasy', NULL, 'concert', 'Germany', 'Frankfurt', 'Jahrhunderthalle', NULL, 50.0994964, 8.5189652, '2026-04-30 20:00:00', '2026-04-30 23:00:00', 0, NULL, NULL, 'https://emhproductions.com/concerts/', NULL, NULL, 'approved'),
  ('Ebi', NULL, 'concert', 'Germany', 'Hannover', 'hcc hannover congress centrum', NULL, 52.3744779, 9.7385532, '2026-05-09 20:00:00', '2026-05-09 23:00:00', 0, NULL, NULL, 'https://emhproductions.com/concerts/', NULL, NULL, 'approved'),
  ('Ebi', NULL, 'concert', 'Switzerland', 'Zurich', 'Theater 11', NULL, 47.3671438, 8.5454976, '2026-05-16 20:00:00', '2026-05-16 23:00:00', 0, NULL, NULL, 'https://emhproductions.com/concerts/', NULL, NULL, 'approved'),
  ('Ebi', NULL, 'concert', 'Italy', 'Florence', 'Teatro Cartiere Carrara', NULL, 43.7665703, 11.2960196, '2026-05-23 20:00:00', '2026-05-23 23:00:00', 0, NULL, NULL, 'https://emhproductions.com/concerts/', NULL, NULL, 'approved'),
  ('Valborg After Dark in Göteborg', NULL, 'concert', 'Sweden', 'Göteborg', 'Nya Etage', NULL, 57.7072326, 11.9670171, '2026-05-01 20:00:00', '2026-05-01 23:00:00', 0, NULL, NULL, 'https://volek.events/events/', NULL, NULL, 'approved'),
  ('Hamid Sakhizada Live in Bremen', NULL, 'concert', 'Germany', 'Bremen', NULL, NULL, 53.0758196, 8.8071646, '2026-05-02 20:00:00', '2026-05-02 23:00:00', 0, NULL, NULL, 'https://volek.events/events/', NULL, NULL, 'approved'),
  ('Masih & Arash live in London', NULL, 'concert', 'United Kingdom', 'London', 'Gracepoint', NULL, 51.5074456, -0.1277653, '2026-05-02 20:00:00', '2026-05-02 23:00:00', 0, NULL, NULL, 'https://volek.events/events/', NULL, NULL, 'approved'),
  ('Masih & Arash live in Manchester', NULL, 'concert', 'United Kingdom', 'Manchester', 'FORUM Centre', NULL, 53.3801509, -2.2649637, '2026-05-04 20:00:00', '2026-05-04 23:00:00', 0, NULL, NULL, 'https://volek.events/events/', NULL, NULL, 'approved'),
  ('Persian & Afghan Night Vibes Party in Göteborg', NULL, 'party', 'Sweden', 'Göteborg', 'Nilo Nilo Restaurang', NULL, 57.7072326, 11.9670171, '2026-05-09 20:00:00', '2026-05-09 23:00:00', 0, NULL, NULL, 'https://volek.events/events/', NULL, NULL, 'approved'),
  ('Arta & Pishro & Koorosh Live in London', NULL, 'concert', 'United Kingdom', 'London', 'Studio 338', NULL, 51.4954879, 0.0047635, '2026-05-15 20:00:00', '2026-05-15 23:00:00', 0, NULL, NULL, 'https://volek.events/events/', NULL, NULL, 'approved'),
  ('Ladies Night with Jawid Sharif in Hamburg', NULL, 'party', 'Germany', 'Hamburg', 'Luxus Events Eventlocation', NULL, 53.5501721, 10.0013165, '2026-05-16 20:00:00', '2026-05-16 23:00:00', 0, NULL, NULL, 'https://volek.events/events/', NULL, NULL, 'approved'),
  ('Arta & Pishro & Koorosh Live in Manchester', NULL, 'concert', 'United Kingdom', 'Manchester', 'Manchester Academy 2', NULL, 53.469165, -2.2198421, '2026-05-17 20:00:00', '2026-05-17 23:00:00', 0, NULL, NULL, 'https://volek.events/events/', NULL, NULL, 'approved'),
  ('Kabul Festival in Göteborg', NULL, 'other', 'Sweden', 'Göteborg', 'Nya Etage', NULL, 57.7072326, 11.9670171, '2026-05-23 20:00:00', '2026-05-23 23:00:00', 0, NULL, NULL, 'https://volek.events/events/', NULL, NULL, 'approved'),
  ('Garsha Rezaei Live in London', NULL, 'concert', 'United Kingdom', 'London', 'Gracepoint', NULL, NULL, NULL, '2026-05-23 20:00:00', '2026-05-23 23:00:00', 0, NULL, NULL, 'https://volek.events/events/', NULL, NULL, 'approved'),
  ('The Shah Live in Melbourne', NULL, 'concert', 'Australia', 'Melbourne', 'Crown Casino', NULL, NULL, NULL, '2026-05-23 20:00:00', '2026-05-23 23:00:00', 0, NULL, NULL, 'https://volek.events/events/', NULL, NULL, 'approved'),
  ('Max Amini Live Show', NULL, 'conference', 'Greece', 'Athens', 'CHRISTMAS THEATRE', NULL, NULL, NULL, '2026-05-02 17:00:00', '2026-05-02 20:00:00', 0, NULL, NULL, 'https://www.maxamini.com/shows', NULL, NULL, 'approved'),
  ('Max Amini Live Show', NULL, 'conference', 'United States', 'Los Angeles', 'THE ORPHEUM THEATRE', NULL, NULL, NULL, '2026-05-08 19:00:00', '2026-05-08 22:00:00', 0, NULL, NULL, 'https://www.maxamini.com/shows', NULL, NULL, 'approved'),
  ('Max Amini Live Show', NULL, 'conference', 'United States', 'Atlanta', 'COBB ENERGY PERFORMING ARTS CENTRE', NULL, NULL, NULL, '2026-06-20 21:30:00', '2026-06-21 00:30:00', 0, NULL, NULL, 'https://www.maxamini.com/shows', NULL, NULL, 'approved'),
  ('Max Amini Live Show', NULL, 'conference', 'United States', 'Kansas City', 'THE MIDLAND THEATRE', NULL, NULL, NULL, '2026-06-28 19:00:00', '2026-06-28 22:00:00', 0, NULL, NULL, 'https://www.maxamini.com/shows', NULL, NULL, 'approved'),
  ('Max Amini Live Show', NULL, 'conference', 'United States', 'Boston', 'BOCH CENTER - WANG THEATRE', NULL, NULL, NULL, '2026-07-08 19:00:00', '2026-07-08 22:00:00', 0, NULL, NULL, 'https://www.maxamini.com/shows', NULL, NULL, 'approved'),
  ('Max Amini Live Show', NULL, 'conference', 'United States', 'Austin', 'ACL LIVE AT MOODY THEATRE', NULL, NULL, NULL, '2026-07-11 20:30:00', '2026-07-11 23:30:00', 0, NULL, NULL, 'https://www.maxamini.com/shows', NULL, NULL, 'approved'),
  ('Max Amini Live Show', NULL, 'conference', 'United States', 'Houston', 'CULLEN THEATER', NULL, NULL, NULL, '2026-07-12 21:00:00', '2026-07-13 00:00:00', 0, NULL, NULL, 'https://www.maxamini.com/shows', NULL, NULL, 'approved'),
  ('Max Amini Live Show', NULL, 'conference', 'United States', 'Dallas', 'MCDERMOTT HALL AT WINSPEAR HOUSE', NULL, NULL, NULL, '2026-07-13 21:00:00', '2026-07-14 00:00:00', 0, NULL, NULL, 'https://www.maxamini.com/shows', NULL, NULL, 'approved'),
  ('Max Amini Live Show', NULL, 'conference', 'United States', 'Miami', 'ZIFF BALLET OPERA HOUSE', NULL, NULL, NULL, '2026-07-17 21:00:00', '2026-07-18 00:00:00', 0, NULL, NULL, 'https://www.maxamini.com/shows', NULL, NULL, 'approved'),
  ('Max Amini Live Show', NULL, 'conference', 'United States', 'New Jersey', 'NJPAC', NULL, NULL, NULL, '2026-07-18 21:00:00', '2026-07-19 00:00:00', 0, NULL, NULL, 'https://www.maxamini.com/shows', NULL, NULL, 'approved'),
  ('Max Amini Live Show', NULL, 'conference', 'United States', 'Las Vegas', 'ENCORE THEATRE AT WYNN', NULL, NULL, NULL, '2026-08-01 20:00:00', '2026-08-01 23:00:00', 0, NULL, NULL, 'https://www.maxamini.com/shows', NULL, NULL, 'approved'),
  ('Max Amini Live Show', NULL, 'conference', 'Canada', 'Vancouver', 'ORPHEUM', NULL, NULL, NULL, '2026-08-30 20:00:00', '2026-08-30 23:00:00', 0, NULL, NULL, 'https://www.maxamini.com/shows', NULL, NULL, 'approved'),
  ('NAMASTE', NULL, 'conference', 'United Kingdom', 'Ilkley', 'King\'s Hall', NULL, NULL, NULL, '2026-10-29 20:00:00', '2026-10-29 23:00:00', 0, NULL, 'Omid Djalili\'s comedy show NAMASTE performed at King\'s Hall, Ilkley.', 'https://www.omidnoagenda.com/', 'Omid Djalili', NULL, 'approved'),
  ('NAMASTE', NULL, 'conference', 'United Kingdom', 'Crewe', 'Lyceum', NULL, NULL, NULL, '2026-11-10 20:00:00', '2026-11-10 23:00:00', 0, NULL, 'Omid Djalili\'s comedy show NAMASTE performed at Lyceum, Crewe.', 'https://www.omidnoagenda.com/', 'Omid Djalili', NULL, 'approved'),
  ('NAMASTE', NULL, 'conference', 'United Kingdom', 'Salford', 'The Lowry', NULL, NULL, NULL, '2026-11-11 20:00:00', '2026-11-11 23:00:00', 0, NULL, 'Omid Djalili\'s comedy show NAMASTE performed at The Lowry, Salford.', 'https://www.omidnoagenda.com/', 'Omid Djalili', NULL, 'approved'),
  ('NAMASTE', NULL, 'conference', 'United Kingdom', 'Worthing', 'Assembly Hall', NULL, NULL, NULL, '2026-11-13 20:00:00', '2026-11-13 23:00:00', 0, NULL, 'Omid Djalili\'s comedy show NAMASTE performed at Assembly Hall, Worthing.', 'https://www.omidnoagenda.com/', 'Omid Djalili', NULL, 'approved'),
  ('NAMASTE', NULL, 'conference', 'United Kingdom', 'Leamington Spa', 'Royal Spa Centre', NULL, NULL, NULL, '2026-11-14 20:00:00', '2026-11-14 23:00:00', 0, NULL, 'Omid Djalili\'s comedy show NAMASTE performed at Royal Spa Centre, Leamington Spa.', 'https://www.omidnoagenda.com/', 'Omid Djalili', NULL, 'approved'),
  ('NAMASTE', NULL, 'conference', 'United Kingdom', 'Manchester', 'Story House', NULL, NULL, NULL, '2027-01-19 20:00:00', '2027-01-19 23:00:00', 0, NULL, 'Omid Djalili\'s comedy show NAMASTE performed at Story House, Chester.', 'https://www.omidnoagenda.com/', 'Omid Djalili', NULL, 'approved'),
  ('NAMASTE', NULL, 'conference', 'United Kingdom', 'Darlington', 'Hippodrome', NULL, NULL, NULL, '2027-01-20 20:00:00', '2027-01-20 23:00:00', 0, NULL, 'Omid Djalili\'s comedy show NAMASTE performed at Hippodrome, Darlington.', 'https://www.omidnoagenda.com/', 'Omid Djalili', NULL, 'approved')
;

-- BiruniMap website-scraped events (retry batch)
-- Generated: 2026-04-28T12:00:58.695Z
-- Uses INSERT IGNORE to skip duplicates

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
/*!40101 SET NAMES utf8mb4 */;

INSERT IGNORE INTO events
  (title, title_fa, event_type, country, city, venue, address, lat, lng,
   start_date, end_date, is_recurring, recurrence_type, description, external_link,
   organizer_name, organizer_email, status)
VALUES
  ('سینا بطحایی', NULL, 'concert', 'Canada', 'Vancouver', 'Harbour Events Centre', NULL, NULL, NULL, '2026-04-30 00:00:00', '2026-04-30 03:00:00', 0, NULL, NULL, 'https://event.taablo.com/concert/', NULL, NULL, 'approved'),
  ('سینا بطحایی', NULL, 'concert', 'Canada', 'Edmonton', 'Midway Music Hall', NULL, NULL, NULL, '2026-04-29 00:00:00', '2026-04-29 03:00:00', 0, NULL, NULL, 'https://event.taablo.com/concert/', NULL, NULL, 'approved'),
  ('سارا نائینی و رضا روحانی', NULL, 'concert', 'Canada', 'Vancouver', 'The Centre', NULL, NULL, NULL, '2026-05-09 00:00:00', '2026-05-09 03:00:00', 0, NULL, NULL, 'https://event.taablo.com/concert/', NULL, NULL, 'approved'),
  ('سارا نائینی و رضا روحانی', NULL, 'concert', 'Canada', 'Toronto', 'Queen Elizabeth Theatre', NULL, NULL, NULL, '2026-05-02 00:00:00', '2026-05-02 03:00:00', 0, NULL, NULL, 'https://event.taablo.com/concert/', NULL, NULL, 'approved'),
  ('سینا بطحایی', NULL, 'concert', 'Canada', 'Victoria', 'The Coda', NULL, NULL, NULL, '2026-05-01 00:00:00', '2026-05-01 03:00:00', 0, NULL, NULL, 'https://event.taablo.com/concert/', NULL, NULL, 'approved'),
  ('The Muslims Are Coming!..with Equally Threatening Friends! – San Francisco', NULL, 'conference', 'United States', 'San Francisco', 'The Lost Church', '988 Columbus Ave, San Francisco, CA, United States', NULL, NULL, '2026-04-29 19:30:00', '2026-04-29 22:30:00', 0, NULL, 'Night of standup featuring Muslim and non‑Muslim comics: Negin Farsad, Helen Hong, Nato Green, Dauood Naimar and more.', 'https://thelostchurch.my.salesforce-sites.com/ticket#/instances/a0FUh000007ZQ3dMAG', NULL, NULL, 'approved'),
  ('Immigration Institute of the Bay Area Comedy Night', NULL, 'conference', 'United States', 'San Francisco', 'Herbst Theater', '401 Van Ness Avenue, San Francisco, CA', NULL, NULL, '2026-04-30 19:30:00', '2026-04-30 22:30:00', 0, NULL, 'Support the Immigration Institute of the Bay Area. Negin Farsad will perform with Melissa Villaseñor and W. Kamau Bell.', 'https://neginfarsad.com/events/', NULL, NULL, 'approved'),
  ('The Longest Shortest Time Podcast Recording', NULL, 'conference', 'United States', 'New York', 'M.M.LaFleur Bryant Park Showroom', '130 W 42nd St floor 13, New York, NY, United States', NULL, NULL, '2026-05-19 18:00:00', '2026-05-19 21:00:00', 0, NULL, 'Live recording of The Longest Shortest Time podcast with Negin Farsad discussing kids\' unanswerable questions.', 'https://neginfarsad.com/events/', NULL, NULL, 'approved')
;

-- BiruniMap JSON-LD + Groq events
-- Generated: 2026-04-28T12:03:21.064Z
-- Uses INSERT IGNORE to skip duplicates

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
/*!40101 SET NAMES utf8mb4 */;

INSERT IGNORE INTO events
  (title, title_fa, event_type, country, city, venue, address, lat, lng,
   start_date, end_date, is_recurring, recurrence_type, description, external_link,
   organizer_name, organizer_email, status)
VALUES
  ('Maz Jobrani @ Hollywood Improv', NULL, 'conference', 'United States', 'Los Angeles', 'Hollywood Improv', 'Los Angeles, CA', NULL, NULL, '2026-05-17 19:00:00', '2026-05-17 21:30:00', 0, NULL, NULL, 'https://www.mazjobrani.com/live/', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Desert Ridge Improv ', NULL, 'conference', 'United States', 'Phoenix', 'Desert Ridge Improv ', 'Phoenix, AZ ', NULL, NULL, '2026-06-19 19:00:00', '2026-06-19 21:30:00', 0, NULL, NULL, 'https://www.ticketweb.com/event/maz-jobrani-hollywood-improv-the-main-room-tickets/14885243', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Desert Ridge Improv ', NULL, 'conference', 'United States', 'Phoenix', 'Desert Ridge Improv ', 'Phoenix, AZ ', NULL, NULL, '2026-06-19 21:30:00', '2026-06-20 00:00:00', 0, NULL, NULL, 'https://www.desertridgeimprov.com/shows/340147', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Desert Ridge Improv ', NULL, 'conference', 'United States', 'Phoenix', 'Desert Ridge Improv ', 'Phoenix, AZ ', NULL, NULL, '2026-06-20 20:30:00', '2026-06-20 23:00:00', 0, NULL, NULL, 'https://www.desertridgeimprov.com/shows/340149', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Fort Lauderdale Improv', NULL, 'conference', 'United States', 'Dania Beach', 'Fort Lauderdale Improv', 'Dania Beach, FL', NULL, NULL, '2026-06-26 19:00:00', '2026-06-26 21:30:00', 0, NULL, NULL, 'https://www.desertridgeimprov.com/shows/340150', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Fort Lauderdale Improv', NULL, 'conference', 'United States', 'Dania Beach', 'Fort Lauderdale Improv', 'Dania Beach, FL', NULL, NULL, '2026-06-26 21:30:00', '2026-06-27 00:00:00', 0, NULL, NULL, 'https://www.improvftl.com/events/124924', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Fort Lauderdale Improv', NULL, 'conference', 'United States', 'Dania Beach', 'Fort Lauderdale Improv', 'Dania Beach, FL', NULL, NULL, '2026-06-27 19:00:00', '2026-06-27 21:30:00', 0, NULL, NULL, 'https://www.improvftl.com/events/124924', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Fort Lauderdale Improv', NULL, 'conference', 'United States', 'Dania Beach', 'Fort Lauderdale Improv', 'Dania Beach, FL', NULL, NULL, '2026-06-27 21:30:00', '2026-06-28 00:00:00', 0, NULL, NULL, 'https://www.improvftl.com/events/124924', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ The Comedy &amp; Magic Club', NULL, 'conference', 'United States', 'Hermosa Beach', 'The Comedy &amp; Magic Club', 'Hermosa Beach, CA', NULL, NULL, '2026-07-15 20:00:00', '2026-07-15 22:30:00', 0, NULL, NULL, 'https://www.improvftl.com/events/124924', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Sound Board at MotorCity Casino Hotel ', NULL, 'conference', 'United States', 'Detroit, MI', 'Sound Board at MotorCity Casino Hotel ', 'Detroit, MI ', NULL, NULL, '2026-07-18 20:00:00', '2026-07-18 22:30:00', 0, NULL, NULL, 'https://thecomedyandmagicclub.com/event/maz-jobrani-6/the-comedy-magic-club/hermosa-beach-california/', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ North Shore Center PAC', NULL, 'conference', 'United States', 'Skokie', 'North Shore Center PAC', 'Skokie, IL', NULL, NULL, '2026-07-19 19:00:00', '2026-07-19 21:30:00', 0, NULL, NULL, 'https://www.ticketmaster.com/event/08006486BEB166F8', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ San Jose Improv', NULL, 'conference', 'United States', 'San Jose', 'San Jose Improv', 'San Jose, CA', NULL, NULL, '2026-07-24 19:30:00', '2026-07-24 22:00:00', 0, NULL, NULL, ' https://www.ticketmaster.com/event/070064799FB44DFA', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ San Jose Improv', NULL, 'conference', 'United States', 'San Jose', 'San Jose Improv', 'San Jose, CA', NULL, NULL, '2026-07-24 21:45:00', '2026-07-25 00:15:00', 0, NULL, NULL, 'https://improv.com/sanjose/comic/maz+jobrani/', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ San Jose Improv', NULL, 'conference', 'United States', 'San Jose', 'San Jose Improv', 'San Jose, CA', NULL, NULL, '2026-07-25 19:00:00', '2026-07-25 21:30:00', 0, NULL, NULL, 'https://improv.com/sanjose/comic/maz+jobrani/', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ San Jose Improv', NULL, 'conference', 'United States', 'San Jose', 'San Jose Improv', 'San Jose, CA', NULL, NULL, '2026-07-25 21:30:00', '2026-07-26 00:00:00', 0, NULL, NULL, 'https://improv.com/sanjose/comic/maz+jobrani/', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ The Ice House Legendary Room ', NULL, 'conference', 'United States', 'Pasadena', 'The Ice House Legendary Room ', 'Pasadena, CA', NULL, NULL, '2026-07-31 19:30:00', '2026-07-31 22:00:00', 0, NULL, NULL, 'https://improv.com/sanjose/comic/maz+jobrani/', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ The Ice House Legendary Room ', NULL, 'conference', 'United States', 'Pasadena', 'The Ice House Legendary Room ', 'Pasadena, CA', NULL, NULL, '2026-08-01 19:00:00', '2026-08-01 21:30:00', 0, NULL, NULL, 'https://www.showclix.com/event/ice-house-maz-jobrani-07-31-26-7-30-pm', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Comedy Club KC ', NULL, 'conference', 'United States', 'Kansas City', 'Comedy Club KC ', 'Kansas City, MO', NULL, NULL, '2026-10-01 19:00:00', '2026-10-01 21:30:00', 0, NULL, NULL, 'https://www.showclix.com/event/ice-house-maz-jobrani-08-01-26-7-pm', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Comedy Club KC ', NULL, 'conference', 'United States', 'Kansas City', 'Comedy Club KC ', 'Kansas City, MO', NULL, NULL, '2026-10-02 19:00:00', '2026-10-02 21:30:00', 0, NULL, NULL, 'https://www.thecomedyclubkc.com/shows/337892', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Comedy Club KC ', NULL, 'conference', 'United States', 'Kansas City', 'Comedy Club KC ', 'Kansas City, MO', NULL, NULL, '2026-10-02 21:30:00', '2026-10-03 00:00:00', 0, NULL, NULL, 'https://www.thecomedyclubkc.com/shows/337893', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Comedy Club KC ', NULL, 'conference', 'United States', 'Kansas City', 'Comedy Club KC ', 'Kansas City, MO', NULL, NULL, '2026-10-03 18:00:00', '2026-10-03 20:30:00', 0, NULL, NULL, 'https://www.thecomedyclubkc.com/shows/337894', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Comedy Club KC ', NULL, 'conference', 'United States', 'Kansas City', 'Comedy Club KC ', 'Kansas City, MO', NULL, NULL, '2026-10-03 20:45:00', '2026-10-03 23:15:00', 0, NULL, NULL, 'https://www.thecomedyclubkc.com/shows/337895', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Tacoma Comedy Club Downtown', NULL, 'conference', 'United States', 'Tacoma', 'Tacoma Comedy Club Downtown', 'Tacoma, WA', NULL, NULL, '2026-11-06 19:00:00', '2026-11-06 21:30:00', 0, NULL, NULL, 'https://www.thecomedyclubkc.com/shows/337896', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Tacoma Comedy Club Downtown', NULL, 'conference', 'United States', 'Tacoma', 'Tacoma Comedy Club Downtown', 'Tacoma, WA', NULL, NULL, '2026-11-06 21:45:00', '2026-11-07 00:15:00', 0, NULL, NULL, 'https://www.tacomacomedyclub.com/events/132082', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Tacoma Comedy Club Downtown', NULL, 'conference', 'United States', 'Tacoma', 'Tacoma Comedy Club Downtown', 'Tacoma, WA', NULL, NULL, '2026-11-07 18:00:00', '2026-11-07 20:30:00', 0, NULL, NULL, 'https://www.tacomacomedyclub.com/events/132082', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Tacoma Comedy Club Downtown', NULL, 'conference', 'United States', 'Tacoma', 'Tacoma Comedy Club Downtown', 'Tacoma, WA', NULL, NULL, '2026-11-07 20:45:00', '2026-11-07 23:15:00', 0, NULL, NULL, 'https://www.tacomacomedyclub.com/events/132082', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Tacoma Comedy Club Downtown', NULL, 'conference', 'United States', 'Tacoma', 'Tacoma Comedy Club Downtown', 'Tacoma, WA', NULL, NULL, '2026-11-08 18:00:00', '2026-11-08 20:30:00', 0, NULL, NULL, 'https://www.tacomacomedyclub.com/events/132082', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Punch Line Sacramento', NULL, 'conference', 'United States', 'Sacramento', 'Punch Line Sacramento', 'Sacramento, CA', NULL, NULL, '2027-01-29 19:00:00', '2027-01-29 21:30:00', 0, NULL, NULL, 'https://www.tacomacomedyclub.com/events/132082', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Punch Line Sacramento', NULL, 'conference', 'United States', 'Sacramento', 'Punch Line Sacramento', 'Sacramento, CA', NULL, NULL, '2027-01-29 21:15:00', '2027-01-29 23:45:00', 0, NULL, NULL, 'https://www.ticketmaster.com/maz-jobrani-tickets/artist/1264279?venueId=229428', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Punch Line Sacramento', NULL, 'conference', 'United States', 'Sacramento', 'Punch Line Sacramento', 'Sacramento, CA', NULL, NULL, '2027-01-30 19:00:00', '2027-01-30 21:30:00', 0, NULL, NULL, 'https://www.ticketmaster.com/maz-jobrani-tickets/artist/1264279?venueId=229428', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Punch Line Sacramento', NULL, 'conference', 'United States', 'Sacramento', 'Punch Line Sacramento', 'Sacramento, CA', NULL, NULL, '2027-01-30 21:15:00', '2027-01-30 23:45:00', 0, NULL, NULL, 'https://www.ticketmaster.com/maz-jobrani-tickets/artist/1264279?venueId=229428', 'Maz Jobrani', NULL, 'approved'),
  ('Maz Jobrani @ Punch Line Sacramento', NULL, 'conference', 'United States', 'Sacramento', 'Punch Line Sacramento', 'Sacramento, CA', NULL, NULL, '2027-01-31 19:00:00', '2027-01-31 21:30:00', 0, NULL, NULL, 'https://www.ticketmaster.com/maz-jobrani-tickets/artist/1264279?venueId=229428', 'Maz Jobrani', NULL, 'approved')
;