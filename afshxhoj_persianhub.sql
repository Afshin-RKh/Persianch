-- PersianHub Clean Database Seed
-- Import this via phpMyAdmin after truncating the businesses table
-- Encoding: UTF-8 / utf8mb4

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;

TRUNCATE TABLE `businesses`;

-- Add country column if it doesn't exist
ALTER TABLE `businesses` ADD COLUMN IF NOT EXISTS `country` VARCHAR(100) DEFAULT 'Switzerland' BEFORE `city`;

INSERT INTO `businesses`
  (`id`, `name`, `name_fa`, `category`, `country`, `city`, `canton`, `address`, `phone`, `website`, `email`, `instagram`, `description`, `description_fa`, `logo_url`, `image_url`, `google_maps_url`, `lat`, `lng`, `is_featured`, `is_verified`, `is_approved`)
VALUES

(4, 'Kookoo', 'کوکو', 'restaurant', 'Switzerland', 'Zurich', 'Zurich',
 'Theaterstrasse 12, 8001 Zurich', '+41 44 504 80 46', 'https://www.kookoofood.ch', NULL, 'kookoofood.ch',
 'Persian rice bowls with fragrant saffron rice, slow-cooked stews, yogurt dips and fresh salads. Healthy and sustainable. Multiple locations across Zurich.',
 'کاسه‌های برنج ایرانی با برنج زعفرانی معطر، خورش‌های کند-پخته، ماست و سالاد تازه. سالم و پایدار. چندین شعبه در سراسر زوریخ.',
 NULL, NULL, NULL, 47.36663820, 8.54653280, 1, 1, 1),

(5, 'Hoengg Oriental', 'رستوران ایرانی هونگ', 'restaurant', 'Switzerland', 'Zurich', 'Zurich',
 'Limmattalstrasse 213, 8049 Zurich', '+41 44 554 91 28', 'https://www.xn--hnggeroriental-vpb.ch', NULL, NULL,
 'Traditional Persian restaurant in Zurich-Hoengg. Known for delicious kebabs and small plates. Cozy atmosphere with outdoor seating, delivery and takeaway.',
 'رستوران سنتی ایرانی در زوریخ-هونگ. مشهور به کباب‌های خوشمزه و پیش‌غذاهای متنوع. فضای دنج با نشیمن در فضای باز، تحویل و بیرون‌بر.',
 NULL, NULL, NULL, 47.40202630, 8.49736020, 0, 1, 1),

(6, 'Karun Persian Restaurant', 'رستوران کارون', 'restaurant', 'Switzerland', 'Zurich', 'Zurich',
 'Zuercherstrasse 91, 8952 Schlieren', '+41 44 731 92 37', 'https://restaurant-karun.ch', NULL, NULL,
 'Casual, affordable Persian restaurant with excellent reviews for authentic Iranian cuisine and outstanding service.',
 'رستوران ایرانی با قیمت مناسب و نظرات عالی برای غذای اصیل ایرانی و خدمات برجسته.',
 NULL, NULL, NULL, 47.39818310, 8.45916890, 0, 1, 1),

(8, 'Payam Persian Food', 'پیام - غذای ایرانی', 'restaurant', 'Switzerland', 'Zurich', 'Zurich',
 'Am Wasser 135, 8049 Zurich', '+41 44 451 72 62', NULL, NULL, NULL,
 'Small cash-only restaurant renowned for fresh, made-to-order Persian dishes. Must-try: lamb shank and kebab koobideh. Known for generous portions.',
 'رستوران کوچک نقدی مشهور به غذاهای تازه ایرانی. حتماً ماهیچه و کباب کوبیده را امتحان کنید. معروف به وعده‌های سخاوتمند.',
 NULL, NULL, NULL, 47.39917210, 8.49784510, 0, 1, 1),

(9, 'Mahnaz Restaurant', 'رستوران مهناز', 'restaurant', 'Switzerland', 'Zurich', 'Zurich',
 'Bremgartnerstrasse 16, 8953 Dietikon', '+41 44 555 84 55', 'https://www.mahnaz-restaurant.ch', 'restaurant-mahnaz@gmx.ch', NULL,
 'Women-owned Persian restaurant offering authentic Iranian cuisine. Praised for impeccable service. Delivery, takeaway and dine-in available.',
 'رستوران ایرانی با مدیریت بانوان. مشهور به سرویس بی‌نقص. تحویل، بیرون‌بر و رستوران موجود.',
 NULL, NULL, NULL, 47.40358350, 8.40186770, 0, 1, 1),

(10, 'Big Alex - Shahrzad', 'رستوران شهرزاد', 'restaurant', 'Switzerland', 'Baden', 'Aargau',
 'Untere Halde 2, 5400 Baden', '+41 56 664 00 00', 'https://bigalex.ch', NULL, 'restaurant_grosser_alexander',
 'Persian fine dining combining authentic Iranian cuisine with Swiss culinary standards. Won the Swiss Location Award. Chef Mohammad trained in Michelin-starred restaurants.',
 'رستوران ایرانی مجلل با ترکیب آشپزی اصیل ایرانی با معیارهای آشپزی سوئیسی. برنده جایزه Swiss Location Award. سرآشپز محمد در رستوران‌های میشلن آموزش دیده است.',
 NULL, 'https://cdn.prod.website-files.com/664e01e6e63312193e7b834c/664e09229585bbce36f638b8_Big%20Alex.png', NULL, 47.47449910, 8.29999880, 1, 1, 1),

(11, 'NUUH Persian Cooking', 'نوه - آشپزی ایرانی', 'restaurant', 'Switzerland', 'Zurich', 'Zurich',
 'Glattalstrasse 507, 8153 Ruemlang', '+41 78 403 89 24', 'https://www.nuuh.ch', 'welcome@nuuh.ch', NULL,
 'Persian catering and cooking events. Combines Iranian culinary roots with Swiss gastronomy. Available on Uber Eats. Caters conferences, private parties and office events.',
 'پذیرایی و رویدادهای آشپزی ایرانی. ریشه‌های آشپزی ایران را با گاسترونومی سوئیس ترکیب می‌کند. در اوبر ایتس موجود است.',
 NULL, 'https://static.wixstatic.com/media/fa4d19_740fbbdb65fb4896ae5a14860b2b257e~mv2.jpg/v1/fill/w_2500,h_1666,al_c/fa4d19_740fbbdb65fb4896ae5a14860b2b257e~mv2.jpg', NULL, 47.43970100, 8.53564320, 0, 1, 1),

(12, 'Damavand Restaurant', 'رستوران دماوند', 'restaurant', 'Switzerland', 'Geneva', 'Geneva',
 'Route de Thonon 82, 1222 Vesenaz', '+41 22 554 82 82', 'https://www.damavand.ch', 'info@damavand.ch', 'damavandswitzerland',
 'Founded 2017 by an Iranian couple. Charcoal-grilled marinated skewers, slow-cooked stews and saffron rice using family recipes. Also available on Uber Eats and Smood.',
 'تأسیس ۲۰۱۷ توسط یک زوج ایرانی. سیخ‌های کبابی با زغال، خورش‌های کند-پخته و برنج زعفرانی با دستور خانوادگی. در اوبر ایتس و اسمود موجود.',
 NULL, 'https://static.wixstatic.com/media/916915_e0e511178c9d4945b2dcc34cc3c76d42~mv2.jpg/v1/fill/w_964,h_480,al_c/916915_e0e511178c9d4945b2dcc34cc3c76d42~mv2.jpg', NULL, 46.24210970, 6.20190970, 1, 1, 1),

(14, 'Restaurant Tehran Center', 'رستوران تهران مرکز', 'restaurant', 'Switzerland', 'Geneva', 'Geneva',
 '18 Rue des Paquis, 1201 Geneva', NULL, 'https://www.restaurant-tehran-center.ch', NULL, 'tehran.geneva.center',
 'Second location of Restaurant Tehran in the Paquis neighborhood. Authentic Iranian cuisine, well-reviewed on TheFork and TripAdvisor.',
 'شعبه دوم رستوران تهران در محله پاکی. غذای اصیل ایرانی، نقدهای خوب در TheFork و TripAdvisor.',
 NULL, NULL, NULL, 46.21079870, 6.14888110, 0, 1, 1),

(17, 'Golestan Restaurant', 'رستوران گلستان', 'restaurant', 'Switzerland', 'Geneva', 'Geneva',
 'Rue de Monthoux 58, 1201 Geneva', '+41 22 731 76 76', 'http://www.golestanrestaurant.com', NULL, 'restaurantgolestan',
 'Established Persian restaurant in Geneva Paquis neighborhood. Offers dine-in, delivery and takeout. Listed on TripAdvisor, TheFork and Yelp.',
 'رستوران ایرانی با سابقه در محله پاکی ژنو. تحویل، بیرون‌بر و نشستن در رستوران.',
 NULL, NULL, NULL, 46.21148070, 6.14570550, 0, 1, 1),

(19, 'Ardineh Persian Gastronomy', 'اردینه - غذای ایرانی', 'cafe', 'Switzerland', 'Lausanne', 'Vaud',
 NULL, '+41 79 349 79 44', 'https://www.ardineh.ch', NULL, 'ardineh',
 'Persian catering and dinner club sharing generational Iranian culinary heritage. Complete gastronomy menus, private cooking classes, dinner club events and festive boxes. Featured in Le Temps newspaper.',
 'پذیرایی ایرانی و کلوب شام که میراث آشپزی نسل‌های ایرانی را به اشتراک می‌گذارد. منوهای کامل گاسترونومی، کلاس‌های آشپزی خصوصی و رویدادهای شام. معرفی شده در روزنامه Le Temps.',
 NULL, 'https://static.wixstatic.com/media/4cb251_dc295ab07708435b8353db574bdeff4b~mv2.png/v1/fit/w_2500,h_1330,al_c/4cb251_dc295ab07708435b8353db574bdeff4b~mv2.png', NULL, 46.59048050, 6.62678850, 0, 1, 1),

(20, 'Persienmarkt', 'بازار پرشیا', 'grocery', 'Switzerland', 'Aargau', 'Aargau',
 'Webermühle 11, 5432 Neuenhof', '+41 76 397 21 01', 'https://persienmarkt.ch', 'customer.service@persienmarkt.ch', 'persienmarkt.shop',
 'Dedicated Persian supermarket and online shop. Sells Persian food products, snacks, sweets, saffron and spices. Ships across Switzerland.',
 'سوپرمارکت و فروشگاه آنلاین اختصاصی ایرانی. محصولات غذایی، تنقلات، شیرینی، زعفران و ادویه‌جات ایرانی می‌فروشد. ارسال در سراسر سوئیس.',
 NULL, 'https://persienmarkt.ch/cdn/shop/files/Persien_market_ED_Reza_250.jpg?v=1613725978', NULL, 47.45851320, 8.31247820, 1, 1, 1),

(21, 'Ariana Food', 'آریانا فود', 'grocery', 'Switzerland', 'Geneva', 'Geneva',
 'Halle de Rive, Boulevard Helvetique, 1207 Geneva', '+41 22 736 53 60', NULL, NULL, NULL,
 'Persian food supplier and specialty grocery inside the Halle de Rive market. Well-known in the Geneva Iranian community for sourcing Persian-specific ingredients.',
 'تأمین‌کننده غذای ایرانی در بازار هال دو ریو ژنو. در بین جامعه ایرانی ژنو برای تهیه مواد اولیه ایرانی شناخته شده.',
 NULL, NULL, NULL, 46.20051640, 6.15430520, 0, 1, 1),

(22, 'Salon Tina Tehran', 'سالن تینا تهران', 'hairdresser', 'Switzerland', 'Zurich', 'Zurich',
 NULL, NULL, 'https://tinatehran.ch', NULL, 'tinatehranbeauty',
 'Iranian-owned hair salon with 25+ years of experience. Services include Balayage, coloration, keratin treatments, hair extensions, facials and men grooming. Also sells a branded Tina Tehran haircare product line.',
 'آرایشگاه ایرانی با بیش از ۲۵ سال تجربه. خدمات شامل بالایاژ، رنگ، کراتین، اکستنشن مو، فیشال و آرایش مردانه.',
 NULL, NULL, NULL, 47.39131670, 8.48933320, 1, 1, 1),

(34, 'Restaurant Pasargades', 'رستوران پاسارگاد', 'restaurant', 'Switzerland', '', 'Geneva',
 'Rue du-Roveray 14, 1207 Geneva', '+41 22 900 14 02', NULL, NULL, NULL,
 'Traditional Persian restaurant in Geneva offering authentic Iranian dishes and warm hospitality.',
 'رستوران سنتی ایرانی در ژنو با غذاهای اصیل ایرانی و مهمان‌نوازی گرم.',
 NULL, NULL, NULL, 46.20524120, 6.15890240, 0, 0, 1),

(36, 'Little Persia', 'پرشیای کوچک', 'restaurant', 'Switzerland', '', 'Vaud',
 'Avenue Louis-Ruchonnet 7, 1003 Lausanne', '+41 21 357 38 57', NULL, NULL, NULL,
 'Cosy Persian restaurant in Lausanne serving homestyle Iranian cooking with fresh ingredients.',
 'رستوران دنج ایرانی در لوزان با آشپزی خانگی ایرانی و مواد اولیه تازه.',
 NULL, NULL, NULL, 46.51803320, 6.62674400, 0, 0, 1),

(39, 'Le Palais Oriental', 'کاخ شرق', 'restaurant', 'Switzerland', '', 'Vaud',
 'Quai E. Ansermet 6, 1820 Montreux', '+41 21 963 12 71', NULL, NULL, NULL,
 'Oriental restaurant in Montreux with stunning lake views, serving Persian and Middle Eastern cuisine.',
 'رستوران شرقی در مونترو با چشم‌انداز زیبای دریاچه، ارائه غذای ایرانی و خاورمیانه‌ای.',
 NULL, NULL, NULL, 46.43070740, 6.90914560, 0, 0, 1),

(41, 'Persian Gulf', 'خلیج فارس', 'restaurant', 'Switzerland', '', 'Basel-Stadt',
 'Viaduktstrasse 10, 4051 Basel', NULL, NULL, NULL, NULL,
 'Persian food stall inside the Markthalle Basel, offering fresh Iranian street food and traditional dishes.',
 'غرفه غذای ایرانی داخل مارکت‌هاله بازل، ارائه غذای خیابانی ایرانی و غذاهای سنتی.',
 NULL, NULL, NULL, 47.54891090, 7.58721830, 0, 0, 1),

(46, '1001 Notte', 'هزار و یک شب', 'restaurant', 'Switzerland', '', 'Ticino',
 'Via Zurigo 6, 6900 Lugano', '+41 91 923 19 37', NULL, NULL, NULL,
 'Middle Eastern and Persian restaurant in Lugano evoking the spirit of 1001 Nights with flavourful Iranian and oriental dishes.',
 'رستوران خاورمیانه‌ای و ایرانی در لوگانو با الهام از روح هزار و یک شب با غذاهای ایرانی و شرقی.',
 NULL, NULL, NULL, 46.01174530, 8.95444910, 0, 0, 1),

(47, 'Safari Oriental Restaurant', 'رستوران صفاری شرقی', 'restaurant', 'Switzerland', '', 'Aargau',
 'Buchserstrasse 30, 5000 Aarau', '+41 62 823 92 55', 'https://safari-oriental-restaurant.ch', NULL, 'safariorientalrestaurant',
 'Oriental restaurant in Aarau offering Persian and Middle Eastern cuisine in a welcoming atmosphere.',
 'رستوران شرقی در آراو با غذای ایرانی و خاورمیانه‌ای در فضایی صمیمانه.',
 NULL, NULL, NULL, 47.39072020, 8.06031820, 0, 0, 1),

(48, 'Shiraz Barber', 'آرایشگاه شیراز', 'hairdresser', 'Switzerland', '', 'Bern',
 'Melchtalstrasse 19, 3014 Bern', '+41 76 404 99 88', NULL, NULL, NULL,
 'Persian-owned barber shop in Bern offering modern and traditional haircuts and grooming services.',
 'آرایشگاه ایرانی در برن با خدمات مدرن و سنتی کوتاهی مو و آرایش.',
 NULL, NULL, NULL, 46.96150020, 7.45605470, 0, 0, 1),

(53, 'Suba Casa', 'سوبا کازا', 'restaurant', 'Switzerland', '', 'Lucerne',
 'An der Kleinen Emme 1, 6014 Luzern', '+41 41 558 50 51', 'https://suba-casa.com', NULL, 'suba_casa',
 'Fusion restaurant combining Italian and Persian-Afghan cooking. Menu features handmade pizza, pasta and traditional dishes including Qabuli Palau and Bolani.',
 'رستوران فیوژن با ترکیب آشپزی ایتالیایی و ایرانی-افغانی. منو شامل پیتزا و پاستا دست‌ساز و غذاهای سنتی.',
 NULL, NULL, NULL, 47.05293420, 8.25608290, 0, 0, 1),

(55, 'Baran Restaurant', 'رستوران باران', 'restaurant', 'Switzerland', '', 'Zurich',
 'Kilchbergstrasse 8, 8134 Adliswil', '+41 44 510 90 88', NULL, NULL, NULL,
 'Persian and Afghan restaurant and takeaway in Adliswil, south of Zurich. Serves Middle Eastern, Persian and Mediterranean cuisine.',
 'رستوران و بیرون‌بر ایرانی و افغانی در آدلیسویل جنوب زوریخ. غذای خاورمیانه‌ای، ایرانی و مدیترانه‌ای.',
 NULL, NULL, NULL, 47.31227890, 8.52837800, 0, 0, 1),

(58, 'Persisch.ch', 'پرشیش', 'grocery', 'Switzerland', '', 'Aargau',
 'Dorfstrasse 18c, 5442 Fislisbach', '+41 79 372 32 08', 'https://persisch.ch', 'info@persisch.ch', NULL,
 'Online shop for Persian dried fruits, nuts, spices, sweets and natural products. Operating in Switzerland for over 30 years. Nationwide delivery via Swiss Post.',
 'فروشگاه آنلاین میوه‌خشک، آجیل، ادویه، شیرینی و محصولات طبیعی ایرانی. بیش از ۳۰ سال فعالیت در سوئیس. ارسال سراسری.',
 NULL, NULL, NULL, 47.43601560, 8.29612850, 0, 0, 1),

(62, 'Anar Restaurant', 'رستوران انار', 'restaurant', 'Switzerland', '', 'Geneva',
 'Geneva', '+41 79 589 40 13', NULL, NULL, 'restaurant.anar.ge',
 'Highly-rated Iranian restaurant in Geneva with a 9.5/10 on TheFork. Open 7 days a week 11:00-23:00. Halal, family-friendly, available for delivery via Smood.',
 'رستوران ایرانی با امتیاز عالی در ژنو. هفت روز هفته ۱۱ تا ۲۳. حلال، مناسب خانواده، تحویل از طریق اسمود.',
 NULL, NULL, NULL, 46.20440000, 6.14320000, 0, 0, 1),

(85, 'Restaurant Tehran', 'رستوران تهران', 'restaurant', 'Switzerland', '', 'Geneva',
 'Rue des Paquis 18, 1201 Geneva', '+41 22 731 22 22', 'https://restaurant-tehran.ch', NULL, NULL,
 'Authentic Persian restaurant in Geneva Paquis near the lake. Traditional Iranian cuisine, open daily with takeout and delivery.',
 'رستوران اصیل ایرانی در پاکی ژنو نزدیک دریاچه. غذای سنتی ایرانی، هر روز با بیرون‌بر و تحویل.',
 NULL, NULL, NULL, 46.20940000, 6.14860000, 0, 0, 1),

(86, 'Mama Persia', 'مامان پرشیا', 'restaurant', 'Switzerland', '', 'Zurich',
 'Seestrasse 116, 8803 Ruschlikon', '+41 43 388 05 15', NULL, NULL, NULL,
 'Persian restaurant on the shores of Lake Zurich offering traditional Iranian cuisine.',
 'رستوران ایرانی در کنار دریاچه زوریخ با غذاهای سنتی ایرانی در چشم‌اندازی زیبا.',
 NULL, NULL, NULL, 47.30240000, 8.56090000, 0, 0, 1),

(87, 'Kian Persian Restaurant', 'رستوران کیان', 'restaurant', 'Switzerland', '', 'Zurich',
 'Stampfenbachstrasse 24, 8001 Zurich', '+41 44 577 41 00', NULL, NULL, NULL,
 'Authentic Persian cuisine in the heart of Zurich serving traditional Iranian dishes in an elegant setting.',
 'غذای اصیل ایرانی در قلب زوریخ با غذاهای سنتی در فضایی شیک.',
 NULL, NULL, NULL, 47.37870000, 8.54380000, 0, 0, 1),

(88, 'Restaurant Persepolis', 'رستوران تخت‌جمشید', 'restaurant', 'Switzerland', '', 'Geneva',
 'Rue Chaponniere 7, 1201 Geneva', '+41 22 900 19 19', NULL, NULL, NULL,
 'Persian restaurant in central Geneva serving classic Iranian cuisine including kebabs, stews and rice dishes.',
 'رستوران ایرانی در مرکز ژنو با غذاهای کلاسیک ایرانی شامل کباب، خورش و برنج.',
 NULL, NULL, NULL, 46.20950000, 6.14480000, 0, 0, 1),

(89, 'Reflets de Perse', 'بازتاب‌های پرشیا', 'restaurant', 'Switzerland', '', 'Vaud',
 'Avenue Emile-Henri-Jaques-Dalcroze 9, 1007 Lausanne', NULL, NULL, NULL, NULL,
 'Refined Persian restaurant in Lausanne with elegant decor and traditional Iranian recipes.',
 'رستوران ظریف ایرانی در لوزان با دکور شیک و دستورهای سنتی ایرانی.',
 NULL, NULL, NULL, 46.51180000, 6.60940000, 0, 0, 1),

(90, 'TAJ Persisches Restaurant', 'رستوران تاج', 'restaurant', 'Switzerland', '', 'Basel-Stadt',
 'Mullheimerstrasse 152, 4057 Basel', '+41 79 398 12 89', NULL, NULL, NULL,
 'Authentic Persian restaurant in Basel serving kebabs, ghormeh sabzi and rice specialties.',
 'رستوران اصیل ایرانی در بازل با کباب، قرمه‌سبزی و تخصص‌های برنجی.',
 NULL, NULL, NULL, 47.56990000, 7.59240000, 0, 0, 1),

(92, 'Banoo im Rossli', 'بانو در راسلی', 'restaurant', 'Switzerland', '', 'St. Gallen',
 'Hauptplatz 5, 8640 Rapperswil-Jona', '+41 55 525 63 93', NULL, NULL, NULL,
 'Persian restaurant in the historic Rossli building in Rapperswil offering traditional Iranian home cooking.',
 'رستوران ایرانی در ساختمان تاریخی راسلی در راپرسویل با آشپزی خانگی سنتی ایرانی.',
 NULL, NULL, NULL, 47.22670000, 8.81610000, 0, 0, 1),

(93, 'Shiraz Restaurant', 'رستوران شیراز', 'restaurant', 'Switzerland', '', 'Solothurn',
 'Oltnerstrasse 29, 5012 Schonenwerd', '+41 79 503 59 90', 'https://shiraz-restaurant.ch', NULL, 'shiraz_restaurant_schweiz',
 'Persian restaurant in Schonenwerd serving authentic Iranian dishes.',
 'رستوران ایرانی در شونن‌ورد با غذاهای اصیل ایرانی. رزرو آنلاین از طریق وبسایت.',
 NULL, NULL, NULL, 47.37000000, 8.00220000, 0, 0, 1),

(94, 'Cafe Restaurant Safran', 'کافه رستوران زعفران', 'cafe', 'Switzerland', '', 'Schaffhausen',
 'Muhlentalstrasse 2, 8200 Schaffhausen', '+41 52 620 10 45', 'https://cafe-restaurant-safran.ch', 'info@cafe-restaurant-safran.ch', NULL,
 'Persian-inspired cafe and restaurant in Schaffhausen named after the prized Iranian spice saffron.',
 'کافه و رستوران با الهام ایرانی در شافهاوزن به نام ادویه ارزشمند ایرانی زعفران.',
 NULL, NULL, NULL, 47.69950000, 8.63260000, 0, 0, 1),

(95, 'Safran Persisches Restaurant', 'رستوران زعفران', 'restaurant', 'Switzerland', '', 'Lucerne',
 'Gerliswilstrasse 62, 6020 Emmenbrucke', NULL, 'https://persischesrestaurant.ch', NULL, NULL,
 'Authentic Persian restaurant near Lucerne specialising in kebabs and traditional Iranian dishes. Takeout and delivery available.',
 'رستوران اصیل ایرانی نزدیک لوسرن متخصص در کباب و غذاهای سنتی ایرانی. بیرون‌بر و تحویل موجود.',
 NULL, NULL, NULL, 47.07600000, 8.27470000, 0, 0, 1),

(96, 'Cyrus KitchenBar', 'سایروس کیچن‌بار', 'restaurant', 'Switzerland', '', 'St. Gallen',
 'Schutzengasse 8, 9000 St. Gallen', '+41 71 220 11 12', 'https://cyrus-sg.ch', NULL, 'cyrus.kitchenbar',
 'Premium Persian restaurant and bar near St. Gallen train station, opened 2024. Fine Persian cuisine, tapas and cocktails.',
 'رستوران و بار برتر ایرانی نزدیک ایستگاه قطار سنت گالن، افتتاح ۲۰۲۴. غذای ظریف ایرانی، تاپاس و کوکتل.',
 NULL, NULL, NULL, 47.42450000, 9.37670000, 0, 0, 1),

(97, 'Persian Food Kitchen', 'آشپزخانه غذای ایرانی', 'restaurant', 'Switzerland', '', 'Zurich',
 'Aargauerstrasse 200, 8048 Zurich', NULL, 'https://persianfoodkitchen.ch', NULL, NULL,
 'Vegetarian Persian restaurant by Iranian chef Parsa Bejarsari. Fresh traditional and creative Persian dishes daily. Dine-in or takeaway.',
 'رستوران گیاهی ایرانی توسط سرآشپز ایرانی پارسا. غذاهای تازه سنتی و خلاقانه ایرانی روزانه. نشستن یا بیرون‌بر.',
 NULL, NULL, NULL, 47.37690000, 8.50600000, 0, 0, 1),

(98, 'PAS Markt', 'پاس مارکت', 'grocery', 'Switzerland', '', 'Zurich',
 'Schaffhauserstrasse 500, 8052 Zurich', NULL, NULL, NULL, NULL,
 'Persian grocery store in Zurich-Seebach with Iranian spices, rice, dried fruit and sweets.',
 'فروشگاه ایرانی در زوریخ با ادویه‌جات، برنج، میوه‌خشک و شیرینی ایرانی.',
 NULL, NULL, NULL, 47.40860000, 8.53640000, 0, 0, 1),

(99, 'Swisspica', 'سویس‌پیکا', 'grocery', 'Switzerland', '', 'Zurich',
 'Zwickystrasse 61, 8600 Dubendorf', '+41 76 579 27 55', 'https://swisspica.ch', NULL, NULL,
 'Swiss supplier of premium Iranian saffron, caviar and pistachios. Supplies top Swiss hotels including Suvretta House and The Chedi Andermatt.',
 'تأمین‌کننده سوئیسی زعفران، خاویار و پسته برتر ایرانی. تأمین‌کننده هتل‌های برتر سوئیس از جمله Suvretta House.',
 NULL, NULL, NULL, 47.39680000, 8.61940000, 0, 0, 1),

(100, 'YALDA Cuisine Orientale', 'یلدا - غذای شرقی', 'restaurant', 'Switzerland', '', 'Zurich',
 'Gustav-Gull-Platz 2, 8004 Zurich', '+41 44 542 88 99', 'https://yalda.ch', NULL, 'yalda_cuisine_orientale',
 'Oriental buffet restaurant named after Persian Yalda Night. Hot and cold Middle Eastern buffets plus an in-house bazaar with spices and cookbooks.',
 'رستوران بوفه شرقی به نام شب یلدای ایرانی. بوفه گرم و سرد خاورمیانه‌ای به علاوه بازار داخلی با ادویه و کتاب آشپزی.',
 NULL, NULL, NULL, 47.37790000, 8.53620000, 0, 0, 1),

(101, 'YALDA Cuisine Orientale Sihlcity', 'یلدا - غذای شرقی (زیل‌سیتی)', 'restaurant', 'Switzerland', '', 'Zurich',
 'Kalanderplatz 1, 8045 Zurich', '+41 44 578 07 08', 'https://yalda.ch', NULL, 'yalda_cuisine_orientale',
 'Second YALDA location in Sihlcity. Oriental buffet named after the Persian winter solstice festival with in-house bazaar.',
 'شعبه دوم یلدا در زیل‌سیتی. بوفه شرقی به نام جشن انقلاب زمستانی ایرانی با بازار داخلی.',
 NULL, NULL, NULL, 47.36340000, 8.52670000, 0, 0, 1),

(102, 'Restaurant Hafez', 'رستوران حافظ', 'restaurant', 'Switzerland', '', 'Geneva',
 'Rue Adrien-Lachenal 22, 1207 Geneva', '+41 22 700 00 81', NULL, NULL, NULL,
 'Long-established Iranian restaurant in Geneva Eaux-Vives. Named after the Persian poet Hafez, serving koobideh kebabs, saffron rice and Iranian stews.',
 'رستوران ایرانی با سابقه طولانی در ژنو. به نام شاعر ایرانی حافظ. کباب کوبیده، برنج زعفرانی و خورش‌های ایرانی.',
 NULL, NULL, NULL, 46.20520000, 6.15890000, 0, 0, 1),

(103, 'Molana Restaurant', 'رستوران مولانا', 'restaurant', 'Switzerland', '', 'Vaud',
 'Avenue Frederic-Recordon 2, 1004 Lausanne', '+41 21 862 88 88', 'https://molanarestaurant20.com', NULL, NULL,
 'Modern Iranian restaurant in Lausanne offering traditional Persian cuisine with lamb kebabs, stews and saffron basmati rice in an oriental atmosphere.',
 'رستوران مدرن ایرانی در لوزان با کباب بره، خورش و برنج باسمتی زعفرانی در فضای شرقی.',
 NULL, NULL, NULL, 46.52010000, 6.62670000, 0, 0, 1),

(104, 'Chef Majid', 'شف مجید', 'restaurant', 'Switzerland', '', 'Vaud',
 'Rue de Verdeaux 16, 1020 Renens', NULL, 'https://chefmajid.ch', NULL, NULL,
 'Authentic Persian restaurant and supermarket with over 30 years of culinary experience. Traditional Iranian dishes with warm hospitality.',
 'رستوران و سوپرمارکت اصیل ایرانی با بیش از ۳۰ سال تجربه آشپزی. غذاهای سنتی ایرانی با مهمان‌نوازی گرم.',
 NULL, NULL, NULL, 46.53780000, 6.59220000, 0, 0, 1),

(105, 'Pishi Breakfast', 'پیشی صبحانه', 'cafe', 'Switzerland', '', 'Solothurn',
 'Muhletalweg 12, 4600 Olten', NULL, 'https://pishibreakfast.ch', NULL, 'pishibreakfast',
 'Homemade oriental breakfast restaurant specialising in Iranian and Turkish breakfast items. Fresh traditional dishes and evening Persian cuisine.',
 'رستوران صبحانه شرقی خانگی متخصص در صبحانه ایرانی و ترکی. غذاهای تازه سنتی و شام ایرانی.',
 NULL, NULL, NULL, 47.35260000, 7.90780000, 0, 0, 1),

(106, 'Damavand Switzerland', 'دماوند سوئیس', 'restaurant', 'Switzerland', '', 'Geneva',
 'Geneva', NULL, 'https://damavand.ch', NULL, NULL,
 'Iranian restaurant and catering founded by chef Maryam, offering authentic charcoal-grilled marinated skewers and slow-cooked Persian stews since 2017.',
 'رستوران و پذیرایی ایرانی تأسیس توسط سرآشپز مریم. کباب‌های معطر و خورش‌های کند-پخته از ۲۰۱۷.',
 NULL, NULL, NULL, 46.20440000, 6.14320000, 0, 0, 1),

(107, 'Herat Restaurant', 'رستوران هرات', 'restaurant', 'Switzerland', '', 'Vaud',
 'Avenue Alexandre-Vinet 22, 1004 Lausanne', '+41 21 647 30 35', 'https://herat.ch', 'info@herat.ch', 'herat.restaurant',
 'Persian and Afghan restaurant in Lausanne offering traditional Middle Eastern and Iranian cuisine with authentic flavours.',
 'رستوران ایرانی و افغانی در لوزان با غذاهای سنتی خاورمیانه‌ای و ایرانی با طعم‌های اصیل.',
 NULL, NULL, NULL, 46.51900000, 6.62180000, 0, 0, 1),

(108, 'Chalet Persia', 'شالت پرشیا', 'other', 'Switzerland', '', 'Zurich',
 'Switzerland', NULL, 'https://chalet-persia.ch', NULL, NULL,
 'Premium Persian event catering service operating since 2013. Authentic Persian cuisine for weddings, birthdays, corporate events and private functions across Switzerland.',
 'سرویس پذیرایی رویدادهای ایرانی برتر از ۲۰۱۳. غذای اصیل ایرانی برای عروسی، جشن تولد و مجالس شرکتی در سراسر سوئیس.',
 NULL, NULL, NULL, 46.81820000, 8.22750000, 0, 0, 1),

(109, 'Royal Oriental', 'رویال اورینتال', 'restaurant', 'Switzerland', '', 'Geneva',
 'Avenue Louis-Casai 60, 1216 Meyrin', '+41 22 788 87 87', NULL, NULL, 'restaurant.royal.oriental',
 'One of the largest Iranian restaurants in Geneva. Serves Persian and Middle Eastern cuisine including lamb kebabs and traditional rice dishes. Outdoor terrace, open daily 11:30-23:00.',
 'یکی از بزرگ‌ترین رستوران‌های ایرانی در ژنو. کباب بره و غذاهای برنجی سنتی. تراس خارجی، هر روز ۱۱:۳۰ تا ۲۳.',
 NULL, NULL, NULL, 46.23020000, 6.10790000, 0, 0, 1);

-- ============================================================
-- GERMANY
-- ============================================================

INSERT INTO `businesses`
  (`id`, `name`, `name_fa`, `category`, `country`, `city`, `canton`, `address`, `phone`, `website`, `email`, `instagram`, `description`, `description_fa`, `logo_url`, `image_url`, `google_maps_url`, `lat`, `lng`, `is_featured`, `is_verified`, `is_approved`)
VALUES

-- BERLIN
(112, 'Kourosh Restaurant', 'رستوران کوروش', 'restaurant', 'Germany', 'Berlin', 'Berlin',
 'Lietzenburger Str. 20b, 10789 Berlin', '+49 172 9441960', 'https://www.kourosh.berlin', NULL, 'kourosh_restaurant_berlin',
 'Authentic Persian cuisine in the heart of Berlin-Schöneberg. Traditional grilled dishes, aromatic stews and fresh appetizers. Offers a VIP area for private events and live entertainment. Delivery available.',
 'غذای اصیل ایرانی در قلب برلین-شونبرگ. کباب‌های سنتی، خورش‌های معطر و پیش‌غذاهای تازه. بخش VIP برای رویدادهای خصوصی و موسیقی زنده. سرویس تحویل موجود.',
 NULL, NULL, NULL, 52.49920000, 13.33420000, 1, 1, 1),

(113, 'Restaurant Persepolis', 'رستوران پرسپولیس', 'restaurant', 'Germany', 'Berlin', 'Berlin',
 'Kurfürstenstr. 127, 10785 Berlin', '+49 30 45086734', NULL, NULL, NULL,
 'Popular Persian restaurant in Berlin-Mitte open daily until late. Well-reviewed for its authentic Iranian menu and welcoming atmosphere.',
 'رستوران ایرانی محبوب در برلین. هر روز تا دیر وقت باز است. نقدهای عالی برای منوی اصیل ایرانی.',
 NULL, NULL, NULL, 52.50650000, 13.35800000, 0, 1, 1),

(114, 'Karun Restaurant', 'رستوران کارون', 'restaurant', 'Germany', 'Berlin', 'Berlin',
 'Pestalozzistr. 29, 10627 Berlin', '+49 30 31519715', NULL, NULL, NULL,
 'Traditional Persian-Arabic restaurant in Berlin-Charlottenburg. Freshly prepared daily specials, catering for events. A second location at Kantstraße 36. Known for its saffron rice, fresh juices and oriental sweets.',
 'رستوران سنتی ایرانی-عربی در برلین-شارلوتنبورگ. غذاهای روزانه تازه، پذیرایی برای رویدادها. شعبه دوم در کانت‌شتراسه ۳۶.',
 NULL, NULL, NULL, 52.50280000, 13.30720000, 0, 1, 1),

(115, 'Shayan', 'شایان', 'restaurant', 'Germany', 'Berlin', 'Berlin',
 'Goltzstr. 23, 10781 Berlin', '+49 30 2151547', NULL, NULL, NULL,
 'Long-established Persian restaurant in Schöneberg, open daily from 11:30 am. A neighbourhood favourite for authentic Iranian kebabs, stews and rice dishes.',
 'رستوران ایرانی باسابقه در شونبرگ، هر روز از ساعت ۱۱:۳۰ باز است. محبوب محله برای کباب، خورش و برنج ایرانی.',
 NULL, NULL, NULL, 52.49610000, 13.35310000, 0, 1, 1),

(116, 'Safran', 'زعفران', 'restaurant', 'Germany', 'Berlin', 'Berlin',
 'Oranienstr. 172, 10999 Berlin', '+49 30 6156211', NULL, NULL, NULL,
 'Popular Iranian restaurant in Kreuzberg specialising in traditional and modern Persian cuisine. Known as one of the most visited Iranian restaurants in the city. Saffron assortment platter highly recommended.',
 'رستوران ایرانی محبوب در کروتسبرگ، متخصص در آشپزی سنتی و مدرن ایرانی. یکی از پربازدیدترین رستوران‌های ایرانی شهر.',
 NULL, NULL, NULL, 52.49980000, 13.42370000, 0, 1, 1),

(117, 'Naardoun', 'ناردون', 'restaurant', 'Germany', 'Berlin', 'Berlin',
 'Windscheidstr. 27, 10627 Berlin', NULL, NULL, NULL, NULL,
 'Health-focused Persian restaurant in Charlottenburg. Seasonal menu of slow-braised veal, lamb and chicken enriched with pomegranate, walnuts, herbs and pistachios. Fully fresh, no flavour enhancers. Vegetarian and vegan options.',
 'رستوران ایرانی با تمرکز بر سلامت در شارلوتنبورگ. منوی فصلی با گوشت خورشتی، انار، گردو، کشمش و پسته. تازه و بدون افزودنی. گزینه‌های گیاهی و وگان.',
 NULL, NULL, NULL, 52.50490000, 13.30970000, 0, 1, 1),

(118, 'Fanous Restaurant', 'رستوران فانوس', 'restaurant', 'Germany', 'Berlin', 'Berlin',
 'Düppelstr. 38, 12163 Berlin', '+49 30 26577200', NULL, NULL, NULL,
 'Persian restaurant with homemade specialties in Berlin-Steglitz. Open daily from 11 am, late-night kitchen on weekends. Cosy traditional setting.',
 'رستوران ایرانی با غذاهای خانگی در برلین-اشتگلیتس. هر روز از ساعت ۱۱ صبح، آخر هفته تا دیر وقت.',
 NULL, NULL, NULL, 52.46130000, 13.32920000, 0, 1, 1),

(119, 'Olivengarten', 'باغ زیتون', 'restaurant', 'Germany', 'Berlin', 'Berlin',
 'Spichernstr. 24, 10777 Berlin', '+49 30 85014015', NULL, NULL, NULL,
 'Persian and Mediterranean restaurant in Wilmersdorf, open daily until midnight. Welcoming atmosphere with a broad menu of Iranian and oriental dishes.',
 'رستوران ایرانی و مدیترانه‌ای در ویلمرسدورف، هر روز تا نیمه‌شب. فضای صمیمانه با منوی گسترده.',
 NULL, NULL, NULL, 52.49410000, 13.33740000, 0, 1, 1),

(120, 'Bazarche Hafez', 'بازارچه حافظ', 'grocery', 'Germany', 'Berlin', 'Berlin',
 'Alt-Moabit 74, 10555 Berlin', NULL, NULL, NULL, NULL,
 'Iranian specialty food store in Berlin-Moabit. Stocks Persian vegetables, fresh baked goods, pistachios, preserves, drinks, handicrafts, rice cookers and a wide range of Persian sauces and ingredients with recipe suggestions.',
 'فروشگاه مواد غذایی ایرانی در برلین-موآبیت. سبزیجات، نان تازه، پسته، کنسرو، نوشیدنی، صنایع دستی، پلوپز و طیف گسترده‌ای از سس‌ها و مواد اولیه ایرانی.',
 NULL, NULL, NULL, 52.52550000, 13.34270000, 0, 1, 1),

-- FRANKFURT
(121, 'Restaurant Kish', 'رستوران کیش', 'restaurant', 'Germany', 'Frankfurt', 'Hesse',
 'Leipziger Str. 16A, 60487 Frankfurt am Main', '+49 69 77039888', 'https://kish-restaurant.de', 'info@kish-restaurant.de', 'kishpersischrestaurant',
 'One of Frankfurt's most beloved Persian restaurants in Bockenheim. Stunning chandelier-filled interior reminiscent of the Shah Cheragh Shrine. Pay-what-you-want lunch buffet, belly dancing, shisha. Mixed grill skewers and saffron lamb shank are highlights.',
 'یکی از محبوب‌ترین رستوران‌های ایرانی فرانکفورت در محله بوکنهایم. دکور باشکوه با لوسترهای درخشان. بوفه ناهار با قیمت آزاد، رقص شکم، قلیان. سیخ مخلوط و ماهیچه زعفرانی از هایلایت‌های منو.',
 NULL, NULL, NULL, 50.12180000, 8.65760000, 1, 1, 1),

(122, 'Zarathustra Restaurant', 'رستوران زرتشت', 'restaurant', 'Germany', 'Frankfurt', 'Hesse',
 'Jahnstr. 1, 60318 Frankfurt am Main', '+49 69 20024976', 'https://zarathustra-restaurant.de', 'info@zarathustra-restaurant.de', 'zarathustra.restaurant',
 'Acclaimed Persian restaurant in central Frankfurt rated 4.8/5 by over 3,000 reviewers. Chef with 20+ years of experience. Catering service available for weddings and events. Sister restaurant to Kish.',
 'رستوران ایرانی مشهور در مرکز فرانکفورت با امتیاز ۴.۸ از بیش از ۳۰۰۰ نقد. آشپز با بیش از ۲۰ سال تجربه. سرویس پذیرایی برای عروسی و مراسم.',
 NULL, NULL, NULL, 50.12000000, 8.68560000, 1, 1, 1),

(123, 'Negin Persian Supermarket', 'سوپرمارکت نگین', 'grocery', 'Germany', 'Frankfurt', 'Hesse',
 'Raimundstraße 137, 60320 Frankfurt am Main', '+49 4969 24006625', NULL, NULL, NULL,
 'Vibrant Persian grocery store in Frankfurt specialising in authentic Iranian products. Wide selection of high-quality spices, fresh produce, saffron and traditional delicacies. Known for friendly staff and a warm, cultural atmosphere.',
 'سوپرمارکت ایرانی پر جنب و جوش در فرانکفورت. انتخاب گسترده‌ای از ادویه‌های باکیفیت، محصولات تازه، زعفران و خوشمزه‌های سنتی. معروف به کارمندان دوستانه.',
 NULL, NULL, NULL, 50.13770000, 8.67440000, 0, 1, 1),

-- MUNICH
(124, 'Tahdig', 'تَهدیگ', 'restaurant', 'Germany', 'Munich', 'Bavaria',
 'Thierschstr. 35, 80538 Munich', '+49 89 24293180', 'https://www.tahdig.de', NULL, 'tahdig089',
 'Highly acclaimed Persian restaurant in central Munich, ranked among the city's best. Known for its crispy tahdig, authentic stews, and outstanding service. Rated 4.8/5 by over 650 OpenTable reviewers. Described as the best Persian food outside Los Angeles.',
 'رستوران ایرانی بسیار محبوب در مرکز مونیخ. معروف به تهدیگ ترد، خورش‌های اصیل و سرویس درخشان. امتیاز ۴.۸ از ۶۵۰ نظر. بهترین غذای ایرانی در اروپا.',
 NULL, NULL, NULL, 48.13670000, 11.59400000, 1, 1, 1),

(125, 'Shandiz', 'شاندیز', 'restaurant', 'Germany', 'Munich', 'Bavaria',
 'Dachauer Str. 50, 80335 Munich', '+49 89 59947986', 'https://www.shandiz.de', NULL, 'shandizmunich',
 'Persian and oriental restaurant next to Munich Hauptbahnhof. Family atmosphere with traditional recipes, belly dancing evenings, and catering for celebrations up to 50 people. Online ordering and delivery available.',
 'رستوران ایرانی و شرقی در کنار ایستگاه مرکزی مونیخ. فضای خانوادگی با دستورهای سنتی، شب‌های رقص شکم، پذیرایی برای مراسم تا ۵۰ نفر. سفارش آنلاین و تحویل.',
 NULL, NULL, NULL, 48.14530000, 11.55700000, 0, 1, 1),

-- HAMBURG
(126, 'Parissa''s', 'پاریسا', 'restaurant', 'Germany', 'Hamburg', 'Hamburg',
 'Sierichstraße 94, 22301 Hamburg', '+49 40 63918515', 'https://www.parissas.de', 'Kontakt@parissas.de', NULL,
 'Top-rated Persian restaurant in Hamburg-Nord with an exceptional 4.9/5 rating from over 5,200 reviewers. 44 indoor seats and 36 terrace spots. Menu of 117 Persian dishes plus an extensive cocktail and wine bar. Ideal for romantic dinners and group celebrations.',
 'رستوران ایرانی با بالاترین امتیاز در هامبورگ، ۴.۹ از ۵۲۰۰ نظر. ۴۴ صندلی داخلی و ۳۶ صندلی تراس. ۱۱۷ غذای ایرانی به علاوه بار کوکتل و شراب.',
 NULL, NULL, NULL, 53.58290000, 10.00220000, 1, 1, 1),

(127, 'Sepideh Restaurant', 'رستوران سپیده', 'restaurant', 'Germany', 'Hamburg', 'Hamburg',
 'Hammer Str. 5, 22041 Hamburg', '+49 40 42900376', 'https://restaurant-sepideh.de', NULL, NULL,
 'Family-run Persian restaurant in Hamburg-Wandsbek. Rated 4.5/5 by over 2,000 reviewers. Specialises in meze, spicy stews and robust grilled dishes with outdoor seating. Affordable prices and generous portions. No alcohol.',
 'رستوران ایرانی خانوادگی در هامبورگ-واندزبک. امتیاز ۴.۵ از ۲۰۰۰ نظر. متخصص در مزه، خورش‌های تند و کباب با صندلی فضای باز. قیمت مناسب و وعده‌های بزرگ.',
 NULL, NULL, NULL, 53.57000000, 10.05330000, 0, 1, 1),

(128, 'Restaurant Teheran', 'رستوران تهران', 'restaurant', 'Germany', 'Hamburg', 'Hamburg',
 'Adenauerallee 70, 20097 Hamburg', '+49 40 28008992', NULL, NULL, NULL,
 'Established Persian restaurant in Hamburg open daily. Classic Iranian cuisine including kebabs, saffron rice and traditional stews in a warm setting.',
 'رستوران ایرانی باسابقه در هامبورگ، هر روز باز. آشپزی کلاسیک ایرانی شامل کباب، برنج زعفرانی و خورش در فضایی دلنشین.',
 NULL, NULL, NULL, 53.55270000, 10.01780000, 0, 1, 1),

(129, 'Restaurant Molana', 'رستوران مولانا', 'restaurant', 'Germany', 'Hamburg', 'Hamburg',
 'Danziger Str. 14, 20099 Hamburg', '+49 40 28052824', NULL, NULL, NULL,
 'Persian restaurant in Hamburg St. Georg serving authentic Iranian cuisine. Open daily with a focus on traditional dishes and warm hospitality.',
 'رستوران ایرانی در هامبورگ سنت گئورگ با غذاهای اصیل ایرانی. هر روز باز با تمرکز بر غذاهای سنتی و مهمان‌نوازی گرم.',
 NULL, NULL, NULL, 53.55670000, 10.01870000, 0, 1, 1);

-- Reset AUTO_INCREMENT to continue from where we left off
ALTER TABLE `businesses` AUTO_INCREMENT = 130;

-- ============================================================
-- GERMANY – Additional categories: hairdresser, cafe/bakery, grocery, lawyer, dentist, other
-- ============================================================

INSERT INTO `businesses`
  (`id`, `name`, `name_fa`, `category`, `country`, `city`, `canton`, `address`, `phone`, `website`, `email`, `instagram`, `description`, `description_fa`, `logo_url`, `image_url`, `google_maps_url`, `lat`, `lng`, `is_featured`, `is_verified`, `is_approved`)
VALUES

-- HAIRDRESSER
(130, 'Salon Hamid Nosrati', 'سالن حمید نصرتی', 'hairdresser', 'Germany', 'Berlin', 'Berlin',
 'Kantstraße 69, 10627 Berlin', '+49 30 82075902', 'https://salon-hamid-nosrati.business.site', 'hamid.nosrati@gmx.de', NULL,
 'Iranian-owned unisex hair salon in Berlin-Charlottenburg. Specialises in haircuts, colouring, keratin treatments and permanent straightening. Highly praised by clients for Hamid's personal touch, positive energy and exceptional value for money.',
 'آرایشگاه ایرانی در برلین-شارلوتنبورگ. متخصص در کوتاهی، رنگ، کراتین و صاف‌کردن. معروف به رویکرد شخصی حمید، انرژی مثبت و قیمت مناسب.',
 NULL, NULL, NULL, 52.50470000, 13.30960000, 1, 1, 1),

(131, 'Orkide Persian Restaurant & Salon', 'رستوران و آرایشگاه ارکیده', 'restaurant', 'Germany', 'Berlin', 'Berlin',
 'Kaiserdamm 4, 14057 Berlin', '+49 30 63339555', 'https://www.orkide-berlin.de', NULL, 'orkide14057',
 'Persian restaurant in Berlin-Charlottenburg open daily 12–23. Known for chelo kebab, fesenjoon and saffron rice. Friendly team and consistently top-reviewed for authentic Persian specialties.',
 'رستوران ایرانی در برلین-شارلوتنبورگ، هر روز ۱۲ تا ۲۳. معروف به چلو کباب، فسنجان و برنج زعفرانی. تیمی صمیمانه با نقدهای عالی.',
 NULL, NULL, NULL, 52.51450000, 13.28860000, 0, 1, 1),

-- BAKERY / CAFE (Hamburg)
(132, 'Baastan Sangak', 'باستان سنگک', 'cafe', 'Germany', 'Hamburg', 'Hamburg',
 'Fuhlsbüttler Str. 468, 22309 Hamburg', '+49 40 33989021', 'https://baastan.de', NULL, NULL,
 'Beloved Persian bakery in Hamburg-Wandsbek baking traditional Sangak flatbread stone-baked on a river of hot pebbles, plus Barbari and other Iranian breads. Rated 4.6/5 by over 250 reviewers. Cash only. Described by customers as "a taste of home".',
 'نانوایی ایرانی محبوب در هامبورگ-واندزبک. نان سنگک سنتی پخته‌شده روی سنگ‌های داغ، به علاوه نان بربری. امتیاز ۴.۶ از ۲۵۰ نقد. نقدی.',
 NULL, NULL, NULL, 53.60760000, 10.04820000, 1, 1, 1),

(133, 'Sangaki Paytakht Market', 'بازار سنگکی پایتخت', 'grocery', 'Germany', 'Hamburg', 'Hamburg',
 'Pappelallee 8, 22089 Hamburg', NULL, NULL, NULL, NULL,
 'Persian market and bakery in Hamburg-Wandsbek. Stocks authentic Iranian grocery products and bakes fresh Sangak bread in-house. Rated 4.4/5 by over 150 reviewers. Cash only. Warm, cosy atmosphere — a community hub for Hamburg's Iranian diaspora.',
 'بازار و نانوایی ایرانی در هامبورگ-واندزبک. مواد غذایی ایرانی اصیل و نان سنگک تازه. امتیاز ۴.۴. نقدی. فضای گرم — محل تجمع ایرانیان هامبورگ.',
 NULL, NULL, NULL, 53.57590000, 10.05950000, 0, 1, 1),

-- GROCERY (Berlin)
(134, 'TS Food Supermarkt', 'سوپرمارکت TS فود', 'grocery', 'Germany', 'Berlin', 'Berlin',
 'Alt-Moabit 74, 10555 Berlin', NULL, NULL, NULL, NULL,
 'Persian, Indian, Afghan and Middle Eastern grocery store in Berlin-Moabit. Over 70 varieties of rice, a wide selection of Persian spices, herbs, canned goods and specialty ingredients. Free parking available. Affordable prices.',
 'سوپرمارکت ایرانی، هندی، افغانی و خاورمیانه‌ای در برلین-موآبیت. بیش از ۷۰ نوع برنج، ادویه‌جات، گیاهان دارویی و مواد اولیه ایرانی. پارکینگ رایگان.',
 NULL, NULL, NULL, 52.52550000, 13.34270000, 0, 1, 1),

-- LAWYER (Frankfurt)
(135, 'Kanzlei Dr. Dr. Iranbomy', 'دفتر وکالت دکتر ایرانبومی', 'other', 'Germany', 'Frankfurt', 'Hesse',
 'Düsseldorfer Str. 14, 60329 Frankfurt am Main', '+49 69 15028264', 'https://iranbomy.com', 'info@iranbomy.com', NULL,
 'Iranian-German law firm in Frankfurt led by Dr. Dr. Seyed Shahram Iranbomy. Farsi, English, German, Arabic and Russian-speaking. Specialises in criminal law, family law, inheritance, employment, immigration and international business law. Cooperates with lawyers in Iran, UAE, USA and China. Regularly featured in ARD, ZDF, Der Spiegel and FAZ.',
 'دفتر وکالت ایرانی-آلمانی در فرانکفورت به سرپرستی دکتر شهرام ایرانبومی. فارسی، انگلیسی، آلمانی، عربی و روسی. متخصص در حقوق کیفری، خانواده، ارث، کار، مهاجرت و تجارت بین‌المللی.',
 NULL, NULL, NULL, 50.10510000, 8.67510000, 1, 1, 1),

-- LAWYER (Aachen / multi-city)
(136, 'Schlun & Elseven – Iran Desk', 'اشلون و الزون – میز ایران', 'other', 'Germany', 'Aachen', 'North Rhine-Westphalia',
 'Von-Coels-Str. 214, 52080 Aachen', '+49 241 4757140', 'https://se-legal.de', 'info@se-legal.de', NULL,
 'German law firm with a dedicated Iran Desk led by Dr. Sepehr Moshiri, a Farsi-fluent lawyer. Handles immigration, business formation, citizenship, family law and extradition defence for Iranian clients. Digital-first: full remote representation available. Also has offices in Düsseldorf. 24h contact line.',
 'موسسه حقوقی آلمانی با میز ایران به سرپرستی دکتر سپهر مشیری، وکیل فارسی‌زبان. مهاجرت، تشکیل شرکت، تابعیت، حقوق خانواده و استرداد. نمایندگی کاملاً از راه دور. دفتر دوم در دوسلدورف.',
 NULL, NULL, NULL, 50.77770000, 6.10420000, 0, 1, 1),

-- DENTIST (Berlin)
(137, 'Zahnarztpraxis Dr. Nasrin Boroujeni', 'دندانپزشکی دکتر نسرین بروجنی', 'other', 'Germany', 'Berlin', 'Berlin',
 'Hindenburgdamm 74, 12203 Berlin', NULL, NULL, NULL, NULL,
 'Iranian dentist in Berlin-Lichterfelde. Dr. Nasrin Boroujeni provides personalised dental care with a focus on patient comfort and minimal waiting times. Farsi-speaking practice covering general dentistry, prophylaxis and cosmetic treatments. Accepts statutory and private health insurance.',
 'دندانپزشک ایرانی در برلین-لیختنفلده. دکتر نسرین بروجنی مراقبت دندانی شخصی‌سازی‌شده با تأکید بر آسایش بیمار. فارسی‌زبان. پوشش بیمه دولتی و خصوصی.',
 NULL, NULL, NULL, 52.44640000, 13.29300000, 0, 1, 1);

-- Reset AUTO_INCREMENT
ALTER TABLE `businesses` AUTO_INCREMENT = 138;

-- ============================================================
-- FRANCE
-- ============================================================

INSERT INTO `businesses`
  (`id`, `name`, `name_fa`, `category`, `country`, `city`, `canton`, `address`, `phone`, `website`, `email`, `instagram`, `description`, `description_fa`, `logo_url`, `image_url`, `google_maps_url`, `lat`, `lng`, `is_featured`, `is_verified`, `is_approved`)
VALUES

(138, 'Shabestan – Champs-Élysées', 'شبستان شانزلیزه', 'restaurant', 'France', 'Paris', 'Île-de-France',
 '5 Rue du Commandant Rivière, 75008 Paris', '+33 1 45 63 95 68', 'https://shabestan.paris', 'contact@shabestan.paris', NULL,
 'One of Paris most established Persian restaurants, steps from the Champs-Elysees. Over 11 years of Persian culinary tradition – marinated kebabs, rich stews, saffron rice and oriental grills. Open daily 12:00–22:30. Also on Deliveroo, Just Eat and Uber Eats.',
 'یکی از معتبرترین رستوران‌های ایرانی پاریس، چند قدمی شانزلیزه. بیش از ۱۱ سال سنت آشپزی ایرانی – کباب مارینه، خورش‌های غنی، برنج زعفرانی. هر روز ۱۲ تا ۲۲:۳۰.',
 NULL, NULL, NULL, 48.87430000, 2.30840000, 1, 1, 1),

(139, 'Shabestan – Grenelle', 'شبستان گرنل', 'restaurant', 'France', 'Paris', 'Île-de-France',
 '98 Boulevard de Grenelle, 75015 Paris', '+33 1 44 90 08 27', 'https://shabestan.paris', 'contact@shabestan.paris', NULL,
 'Second Parisian address of Shabestan, near Motte-Picquet in the 15th. Hybrid lunch concept with daily Persian dishes, plus a la carte Persian classics in the evening. Catering for weddings and events. Mon–Sat 12:00–22:30.',
 'شعبه دوم شبستان در پاریس ۱۵. ناهار با غذاهای روزانه ایرانی، شام آلاکارت. پذیرایی برای عروسی و مراسم.',
 NULL, NULL, NULL, 48.84820000, 2.29750000, 0, 1, 1),

(140, 'Shabestan – Mirabeau', 'شبستان میرابو', 'restaurant', 'France', 'Paris', 'Île-de-France',
 '38 Avenue de Versailles, 75016 Paris', '+33 1 45 25 51 15', 'https://shabestan.paris', 'contact@shabestan.paris', NULL,
 'Third Shabestan location in the 16th arrondissement near Pont Mirabeau. Evening-only Persian grill and Oriental specialties. Open Mon–Fri from 18:00, Sat–Sun from 12:00.',
 'شعبه سوم شبستان در پاریس ۱۶، نزدیک پل میرابو. کباب و تخصص‌های شرقی، فقط شام. دوشنبه تا جمعه از ۱۸، شنبه-یکشنبه از ۱۲.',
 NULL, NULL, NULL, 48.84590000, 2.27680000, 0, 1, 1),

(141, 'Mazeh', 'مازه', 'restaurant', 'France', 'Paris', 'Île-de-France',
 '65 Rue des Entrepreneurs, 75015 Paris', NULL, NULL, NULL, NULL,
 'An institution of Persian gastronomy in Paris Petit Tehran neighbourhood since 1984. Now run by Sam and his father Mahmood. Famous for basmati rice, subtle stews and fresh bread. Favourite of the Iranian diaspora and discerning Parisians.',
 'نماد آشپزی ایرانی در محله «تهران کوچک» پاریس از ۱۹۸۴. اداره سام و پدرش محمود. مشهور به برنج باسمتی، خورش‌های ظریف و نان تازه.',
 NULL, NULL, NULL, 48.84730000, 2.29110000, 1, 1, 1),

(142, 'Cheminée', 'شومینه', 'restaurant', 'France', 'Paris', 'Île-de-France',
 '60bis Rue des Entrepreneurs, 75015 Paris', '+33 9 53 67 94 73', 'https://restaurant-cheminee.fr', NULL, 'restaurant.cheminee.paris',
 'Family-run Persian restaurant in Paris 15th rated 4.3/5 from 700+ reviews. Chef Fattaneh Taghizadeh reinterprets traditional Persian recipes with French sensibility. Specialises in northern Iranian grill traditions. Private dining room for 14. Halal. Open daily 11:00–22:45.',
 'رستوران ایرانی خانوادگی در پاریس ۱۵ با ۴.۳ از ۷۰۰ نقد. سرآشپز فتانه تقی‌زاده. حلال. اتاق خصوصی ۱۴ نفره. هر روز ۱۱ تا ۲۲:۴۵.',
 NULL, NULL, NULL, 48.84690000, 2.29200000, 1, 1, 1),

(143, 'Toranj', 'ترنج', 'restaurant', 'France', 'Paris', 'Île-de-France',
 '287 Rue Saint-Jacques, 75005 Paris', NULL, 'https://toranj-restaurant.fr', NULL, NULL,
 'Cosy family-run Persian restaurant in the 5th near the Pantheon and Jardin du Luxembourg. Husband cooks, wife serves. Rated 9.6/10 on TheFork and 4.5/5 on TripAdvisor. Acclaimed for fesenjan, ghormeh sabzi and albaloo polo. All dishes homemade. Mon–Sat lunch and dinner.',
 'رستوران ایرانی خانوادگی دنج در پاریس ۵. ۹.۶ از ۱۰ در TheFork. مشهور به فسنجان، قرمه‌سبزی و آلبالو پلو. تمام غذاها خانگی.',
 NULL, NULL, NULL, 48.84640000, 2.34360000, 1, 1, 1),

(144, 'Le Palais de la Perse', 'کاخ پارس', 'restaurant', 'France', 'Paris', 'Île-de-France',
 '285 Rue Saint-Jacques, 75005 Paris', NULL, NULL, NULL, NULL,
 'Authentic Persian restaurant in the Latin Quarter rated 9.1/10 on TheFork. Budget-friendly with a generous menu of Iranian classics – ghormeh sabzi, gheymeh polo, zereshk polo and kebabs. English-speaking staff. Vegetarian options. Mon–Sat 11:00–23:00.',
 'رستوران اصیل ایرانی در محله لاتن پاریس. امتیاز ۹.۱. قرمه‌سبزی، قیمه‌پلو، زرشک‌پلو و کباب. گزینه گیاهی.',
 NULL, NULL, NULL, 48.84590000, 2.34310000, 0, 1, 1),

(145, 'Restaurant Téhéran', 'رستوران تهران', 'restaurant', 'France', 'Paris', 'Île-de-France',
 '8 Rue Beaugrenelle, 75015 Paris', '+33 1 45 78 69 51', 'https://restaurant-teheran.fr', NULL, 'restaurantteheran',
 'Founded in 2014 in the heart of Paris Iranian community by Mahmood. Open 7 days 12:00–23:00. Traditional dishes including koobideh, gheymeh bademjan and zereshk polo. Delivery to 7th, 8th, 15th and 16th arrondissements. Catering for events.',
 'تأسیس ۲۰۱۴ توسط محمود. هر روز ۱۲ تا ۲۳. کوبیده، قیمه بادمجان، زرشک‌پلو. تحویل به محله‌های ۷، ۸، ۱۵ و ۱۶.',
 NULL, NULL, NULL, 48.84660000, 2.28950000, 0, 1, 1),

(146, 'Norouz', 'نوروز', 'restaurant', 'France', 'Paris', 'Île-de-France',
 '48 Rue du Dessous des Berges, 75013 Paris', '+33 7 69 76 39 93', 'https://norouz-restaurant.eatbu.com', 'norouzparis2020@gmail.com', 'norouz_restaurant_',
 'Franco-Iranian restaurant near Bibliotheque Francois Mitterrand in the 13th. Rated 4.5/5 from 450+ reviews. Fresh seasonal Persian cuisine. Vegetarian-friendly with terrace, fesenjan, baghali polo and Persian desserts. Mon–Sat lunch and dinner, Sun lunch.',
 'رستوران فرانسوی-ایرانی در پاریس ۱۳. امتیاز ۴.۵ از ۴۵۰ نقد. منوی فصلی تازه. تراس، فسنجان، باقالی‌پلو، دسرهای ایرانی.',
 NULL, NULL, NULL, 48.82860000, 2.37510000, 0, 1, 1),

-- GROCERY
(147, 'Eskan Épicerie Iranienne', 'اسکان - اپیسری ایرانی', 'grocery', 'France', 'Paris', 'Île-de-France',
 '62bis Rue des Entrepreneurs, 75015 Paris', '+33 1 45 77 06 16', 'https://www.eskan-paris15.fr', NULL, NULL,
 'Iconic Iranian grocery in the heart of Paris Petit Tehran, open since 1990. Persian rice varieties, saffron, dried limes, pomegranate molasses, dried herbs, sohan biscuits, traditional sweets, Persian teas and books. Online shop with nationwide delivery in France.',
 'اپیسری ایرانی نمادین در قلب «تهران کوچک» پاریس از ۱۹۹۰. برنج ایرانی، زعفران، لیمو عمانی، رب انار، سبزی خشک، سوهان، شیرینی سنتی، چای ایرانی. فروشگاه آنلاین با ارسال سراسری.',
 NULL, NULL, NULL, 48.84690000, 2.29170000, 1, 1, 1),

(148, 'Sepide Épicerie Iranienne', 'اپیسری ایرانی سپیده', 'grocery', 'France', 'Paris', 'Île-de-France',
 '62ter Rue des Entrepreneurs, 75015 Paris', NULL, 'https://sepide.fr', NULL, NULL,
 'Beloved Iranian grocery and patisserie in Paris 15th, open over 25 years. Dried fruits, saffron, honey, nuts, nougat and Iranian pastries. Famous for papilloni pastries. Features a miniature Persian poetry and literature corner. Open daily 9am–11pm. Online orders available.',
 'اپیسری و شیرینی‌فروشی ایرانی محبوب در پاریس ۱۵، بیش از ۲۵ سال. میوه‌خشک، زعفران، عسل، آجیل، گز و شیرینی ایرانی. کتابخانه کوچک شعر فارسی. هر روز ۹ تا ۲۳.',
 NULL, NULL, NULL, 48.84690000, 2.29160000, 0, 1, 1),

-- LAWYER
(149, 'Cabinet Cohen Amir-Aslani', 'دفتر وکالت کوهن امیراسلانی', 'other', 'France', 'Paris', 'Île-de-France',
 '45 Avenue Montaigne, 75008 Paris', '+33 1 42 12 99 00', 'https://www.cohenamiraslani.com', 'a.amiraslani@caa-avocats.com', NULL,
 'Prestigious Franco-Iranian law firm on Avenue Montaigne, co-founded by Maitre Ardavan Amir-Aslani, Farsi-fluent, admitted to the Paris Bar since 1994. Specialises in international business law, M&A, investment, family law and Middle East matters. Has represented states including Iraq and Pakistan. 50+ lawyers. Offices also in New York and Hanoi.',
 'موسسه حقوقی فرانسوی-ایرانی معتبر در خیابان مونتنی. مؤسس متر اردوان امیراسلانی، وکیل فارسی‌زبان از ۱۹۹۴. متخصص در حقوق تجاری بین‌المللی، M&A، سرمایه‌گذاری، حقوق خانواده و امور خاورمیانه. بیش از ۵۰ وکیل.',
 NULL, NULL, NULL, 48.86580000, 2.30510000, 1, 1, 1),

(150, 'Cabinet Coline Dassant', 'دفتر وکالت دسان', 'other', 'France', 'Paris', 'Île-de-France',
 'Paris, France', NULL, 'https://www.avocat-dassant.fr', NULL, NULL,
 'Franco-Iranian law firm led by Maitre Coline Baharee Dassant. Farsi-speaking. Specialises in immigration (visas, carte de sejour, change of status), real estate investment in France, family law and international inheritance. Consultations in-office or by phone and videoconference.',
 'موسسه حقوقی فرانسوی-ایرانی به سرپرستی مِتر کولین بهاره دسان. فارسی‌زبان. متخصص در مهاجرت، کارت اقامت، سرمایه‌گذاری ملکی در فرانسه، حقوق خانواده و ارث بین‌المللی.',
 NULL, NULL, NULL, 48.85340000, 2.34840000, 0, 1, 1);

-- Reset AUTO_INCREMENT
ALTER TABLE `businesses` AUTO_INCREMENT = 151;
