-- Fix canton/city names to match filter list
-- Run this after importing businesses_final.sql

-- USA: remove state suffixes
UPDATE businesses SET canton = 'Atlanta'        WHERE canton = 'Atlanta, GA';
UPDATE businesses SET canton = 'Austin'         WHERE canton = 'Austin, TX';
UPDATE businesses SET canton = 'Boston'         WHERE canton = 'Boston, MA';
UPDATE businesses SET canton = 'Chicago'        WHERE canton = 'Chicago, IL';
UPDATE businesses SET canton = 'Dallas'         WHERE canton = 'Dallas, TX';
UPDATE businesses SET canton = 'Denver'         WHERE canton = 'Denver, CO';
UPDATE businesses SET canton = 'Houston'        WHERE canton = 'Houston, TX';
UPDATE businesses SET canton = 'Irvine'         WHERE canton = 'Irvine, CA';
UPDATE businesses SET canton = 'Las Vegas'      WHERE canton = 'Las Vegas, NV';
UPDATE businesses SET canton = 'Los Angeles'    WHERE canton = 'Los Angeles, CA';
UPDATE businesses SET canton = 'Miami'          WHERE canton = 'Miami, FL';
UPDATE businesses SET canton = 'Minneapolis'    WHERE canton = 'Minneapolis, MN';
UPDATE businesses SET canton = 'New York City'  WHERE canton = 'New York, NY';
UPDATE businesses SET canton = 'Phoenix'        WHERE canton = 'Phoenix, AZ';
UPDATE businesses SET canton = 'Portland'       WHERE canton = 'Portland, OR';
UPDATE businesses SET canton = 'San Diego'      WHERE canton = 'San Diego, CA';
UPDATE businesses SET canton = 'San Francisco'  WHERE canton = 'San Francisco, CA';
UPDATE businesses SET canton = 'San Jose'       WHERE canton = 'San Jose, CA';
UPDATE businesses SET canton = 'Seattle'        WHERE canton = 'Seattle, WA';
UPDATE businesses SET canton = 'Washington DC'  WHERE canton = 'Washington, DC';
UPDATE businesses SET canton = 'Richmond'       WHERE canton = 'Richmond' AND country = 'United States';

-- Germany: native → English
UPDATE businesses SET canton = 'Munich'         WHERE canton = 'München';
UPDATE businesses SET canton = 'Cologne'        WHERE canton = 'Köln';
UPDATE businesses SET canton = 'Frankfurt'      WHERE canton = 'Frankfurt am Main';
UPDATE businesses SET canton = 'Hanover'        WHERE canton = 'Hannover';
UPDATE businesses SET canton = 'Nuremberg'      WHERE canton = 'Nürnberg';
UPDATE businesses SET canton = 'Vienna'         WHERE canton = 'Wien';

-- German regions → nearest major city
UPDATE businesses SET canton = 'Stuttgart'      WHERE canton = 'Baden-Württemberg';
UPDATE businesses SET canton = 'Munich'         WHERE canton = 'Bavaria';
UPDATE businesses SET canton = 'Frankfurt'      WHERE canton = 'Hesse';
UPDATE businesses SET canton = 'Cologne'        WHERE canton = 'North Rhine-Westphalia';
UPDATE businesses SET canton = 'Dresden'        WHERE canton = 'Saxony';

-- Italy: native → English
UPDATE businesses SET canton = 'Milan'          WHERE canton = 'Milano';
UPDATE businesses SET canton = 'Rome'           WHERE canton = 'Roma';
UPDATE businesses SET canton = 'Turin'          WHERE canton = 'Torino';
UPDATE businesses SET canton = 'Genoa'          WHERE canton = 'Genova';
UPDATE businesses SET canton = 'Padua'          WHERE canton = 'Padova';

-- Italian regions → nearest major city
UPDATE businesses SET canton = 'Milan'          WHERE canton = 'Lombardy';
UPDATE businesses SET canton = 'Rome'           WHERE canton = 'Lazio';

-- Netherlands: native → English
UPDATE businesses SET canton = 'The Hague'      WHERE canton = 's-Gravenhage';
UPDATE businesses SET canton = 'Amsterdam'      WHERE canton = 'North Holland';
UPDATE businesses SET canton = 'Rotterdam'      WHERE canton = 'South Holland';

-- Belgium
UPDATE businesses SET canton = 'Ghent'          WHERE canton = 'Gent';
UPDATE businesses SET canton = 'Brussels'       WHERE canton = 'Ixelles - Elsene';
UPDATE businesses SET canton = 'Brussels'       WHERE canton = 'Schaerbeek - Schaarbeek';
UPDATE businesses SET canton = 'Antwerp'        WHERE canton = 'Flanders';

-- Sweden: native → English
UPDATE businesses SET canton = 'Gothenburg'     WHERE canton = 'Göteborg';
UPDATE businesses SET canton = 'Gothenburg'     WHERE canton = 'Västra Götaland';
UPDATE businesses SET canton = 'Malmö'          WHERE canton = 'Skåne';
UPDATE businesses SET canton = 'Gothenburg'     WHERE canton = 'Sollentuna';
UPDATE businesses SET canton = 'Stockholm'      WHERE canton = 'Sollentuna kommun';
UPDATE businesses SET canton = 'Stockholm'      WHERE canton = 'Sundbybergs kommun';
UPDATE businesses SET canton = 'Stockholm'      WHERE canton = 'Solna';

-- Norway
UPDATE businesses SET canton = 'Bergen'         WHERE canton = 'Vestland';

-- Denmark
UPDATE businesses SET canton = 'Copenhagen'     WHERE canton = 'København';
UPDATE businesses SET canton = 'Copenhagen'     WHERE canton = 'Frederiksberg';
UPDATE businesses SET canton = 'Aarhus'         WHERE canton = 'Sønderborg';

-- Switzerland: native → English
UPDATE businesses SET canton = 'Geneva'         WHERE canton = 'Genève';

-- UK
UPDATE businesses SET canton = 'London'         WHERE canton = 'Greater London';
UPDATE businesses SET canton = 'Newcastle'      WHERE canton = 'Newcastle upon Tyne';
UPDATE businesses SET canton = 'Manchester'     WHERE canton = 'Salford';
UPDATE businesses SET canton = 'Manchester'     WHERE canton = 'Stockport';
UPDATE businesses SET canton = 'London'         WHERE canton = 'Hertsmere';
UPDATE businesses SET canton = 'London'         WHERE canton = 'Twickenham';
UPDATE businesses SET canton = 'London'         WHERE canton = 'Egham';
UPDATE businesses SET canton = 'Birmingham'     WHERE canton = 'West Midlands';
UPDATE businesses SET canton = 'Manchester'     WHERE canton = 'North West';

-- France: regions → nearest major city
UPDATE businesses SET canton = 'Lyon'           WHERE canton = 'Auvergne-Rhône-Alpes';
UPDATE businesses SET canton = 'Strasbourg'     WHERE canton = 'Grand Est';
UPDATE businesses SET canton = 'Bordeaux'       WHERE canton = 'Nouvelle-Aquitaine';
UPDATE businesses SET canton = 'Toulouse'       WHERE canton = 'Occitanie';
UPDATE businesses SET canton = 'Marseille'      WHERE canton = 'Provence-Alpes-Côte d Azur';
UPDATE businesses SET canton = 'Marseille'      WHERE canton = 'Provence-Alpes-Côte d''Azur';

-- Austria: native → English
UPDATE businesses SET canton = 'Graz'           WHERE canton = 'Styria';

-- Canada
UPDATE businesses SET canton = 'Montreal'       WHERE canton = 'Laval' AND country = 'Canada';
