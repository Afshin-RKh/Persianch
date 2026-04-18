-- PersianHub Clean Database Seed
-- Import this via phpMyAdmin after truncating the businesses table
-- Encoding: UTF-8 / utf8mb4

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;

TRUNCATE TABLE `businesses`;

INSERT INTO `businesses`
  (`id`, `name`, `name_fa`, `category`, `city`, `canton`, `address`, `phone`, `website`, `email`, `instagram`, `description`, `description_fa`, `logo_url`, `image_url`, `google_maps_url`, `lat`, `lng`, `is_featured`, `is_verified`, `is_approved`)
VALUES

(4, 'Kookoo', 'کوکو', 'restaurant', 'Zurich', 'Zurich',
 'Theaterstrasse 12, 8001 Zurich', '+41 44 504 80 46', 'https://www.kookoofood.ch', NULL, 'kookoofood.ch',
 'Persian rice bowls with fragrant saffron rice, slow-cooked stews, yogurt dips and fresh salads. Healthy and sustainable. Multiple locations across Zurich.',
 'کاسه‌های برنج ایرانی با برنج زعفرانی معطر، خورش‌های کند-پخته، ماست و سالاد تازه. سالم و پایدار. چندین شعبه در سراسر زوریخ.',
 NULL, NULL, NULL, 47.36663820, 8.54653280, 1, 1, 1),

(5, 'Hoengg Oriental', 'رستوران ایرانی هونگ', 'restaurant', 'Zurich', 'Zurich',
 'Limmattalstrasse 213, 8049 Zurich', '+41 44 554 91 28', 'https://www.xn--hnggeroriental-vpb.ch', NULL, NULL,
 'Traditional Persian restaurant in Zurich-Hoengg. Known for delicious kebabs and small plates. Cozy atmosphere with outdoor seating, delivery and takeaway.',
 'رستوران سنتی ایرانی در زوریخ-هونگ. مشهور به کباب‌های خوشمزه و پیش‌غذاهای متنوع. فضای دنج با نشیمن در فضای باز، تحویل و بیرون‌بر.',
 NULL, NULL, NULL, 47.40202630, 8.49736020, 0, 1, 1),

(6, 'Karun Persian Restaurant', 'رستوران کارون', 'restaurant', 'Zurich', 'Zurich',
 'Zuercherstrasse 91, 8952 Schlieren', '+41 44 731 92 37', 'https://restaurant-karun.ch', NULL, NULL,
 'Casual, affordable Persian restaurant with excellent reviews for authentic Iranian cuisine and outstanding service.',
 'رستوران ایرانی با قیمت مناسب و نظرات عالی برای غذای اصیل ایرانی و خدمات برجسته.',
 NULL, NULL, NULL, 47.39818310, 8.45916890, 0, 1, 1),

(8, 'Payam Persian Food', 'پیام - غذای ایرانی', 'restaurant', 'Zurich', 'Zurich',
 'Am Wasser 135, 8049 Zurich', '+41 44 451 72 62', NULL, NULL, NULL,
 'Small cash-only restaurant renowned for fresh, made-to-order Persian dishes. Must-try: lamb shank and kebab koobideh. Known for generous portions.',
 'رستوران کوچک نقدی مشهور به غذاهای تازه ایرانی. حتماً ماهیچه و کباب کوبیده را امتحان کنید. معروف به وعده‌های سخاوتمند.',
 NULL, NULL, NULL, 47.39917210, 8.49784510, 0, 1, 1),

(9, 'Mahnaz Restaurant', 'رستوران مهناز', 'restaurant', 'Zurich', 'Zurich',
 'Bremgartnerstrasse 16, 8953 Dietikon', '+41 44 555 84 55', 'https://www.mahnaz-restaurant.ch', 'restaurant-mahnaz@gmx.ch', NULL,
 'Women-owned Persian restaurant offering authentic Iranian cuisine. Praised for impeccable service. Delivery, takeaway and dine-in available.',
 'رستوران ایرانی با مدیریت بانوان. مشهور به سرویس بی‌نقص. تحویل، بیرون‌بر و رستوران موجود.',
 NULL, NULL, NULL, 47.40358350, 8.40186770, 0, 1, 1),

(10, 'Big Alex - Shahrzad', 'رستوران شهرزاد', 'restaurant', 'Baden', 'Aargau',
 'Untere Halde 2, 5400 Baden', '+41 56 664 00 00', 'https://bigalex.ch', NULL, 'restaurant_grosser_alexander',
 'Persian fine dining combining authentic Iranian cuisine with Swiss culinary standards. Won the Swiss Location Award. Chef Mohammad trained in Michelin-starred restaurants.',
 'رستوران ایرانی مجلل با ترکیب آشپزی اصیل ایرانی با معیارهای آشپزی سوئیسی. برنده جایزه Swiss Location Award. سرآشپز محمد در رستوران‌های میشلن آموزش دیده است.',
 NULL, 'https://cdn.prod.website-files.com/664e01e6e63312193e7b834c/664e09229585bbce36f638b8_Big%20Alex.png', NULL, 47.47449910, 8.29999880, 1, 1, 1),

(11, 'NUUH Persian Cooking', 'نوه - آشپزی ایرانی', 'restaurant', 'Zurich', 'Zurich',
 'Glattalstrasse 507, 8153 Ruemlang', '+41 78 403 89 24', 'https://www.nuuh.ch', 'welcome@nuuh.ch', NULL,
 'Persian catering and cooking events. Combines Iranian culinary roots with Swiss gastronomy. Available on Uber Eats. Caters conferences, private parties and office events.',
 'پذیرایی و رویدادهای آشپزی ایرانی. ریشه‌های آشپزی ایران را با گاسترونومی سوئیس ترکیب می‌کند. در اوبر ایتس موجود است.',
 NULL, 'https://static.wixstatic.com/media/fa4d19_740fbbdb65fb4896ae5a14860b2b257e~mv2.jpg/v1/fill/w_2500,h_1666,al_c/fa4d19_740fbbdb65fb4896ae5a14860b2b257e~mv2.jpg', NULL, 47.43970100, 8.53564320, 0, 1, 1),

(12, 'Damavand Restaurant', 'رستوران دماوند', 'restaurant', 'Geneva', 'Geneva',
 'Route de Thonon 82, 1222 Vesenaz', '+41 22 554 82 82', 'https://www.damavand.ch', 'info@damavand.ch', 'damavandswitzerland',
 'Founded 2017 by an Iranian couple. Charcoal-grilled marinated skewers, slow-cooked stews and saffron rice using family recipes. Also available on Uber Eats and Smood.',
 'تأسیس ۲۰۱۷ توسط یک زوج ایرانی. سیخ‌های کبابی با زغال، خورش‌های کند-پخته و برنج زعفرانی با دستور خانوادگی. در اوبر ایتس و اسمود موجود.',
 NULL, 'https://static.wixstatic.com/media/916915_e0e511178c9d4945b2dcc34cc3c76d42~mv2.jpg/v1/fill/w_964,h_480,al_c/916915_e0e511178c9d4945b2dcc34cc3c76d42~mv2.jpg', NULL, 46.24210970, 6.20190970, 1, 1, 1),

(14, 'Restaurant Tehran Center', 'رستوران تهران مرکز', 'restaurant', 'Geneva', 'Geneva',
 '18 Rue des Paquis, 1201 Geneva', NULL, 'https://www.restaurant-tehran-center.ch', NULL, 'tehran.geneva.center',
 'Second location of Restaurant Tehran in the Paquis neighborhood. Authentic Iranian cuisine, well-reviewed on TheFork and TripAdvisor.',
 'شعبه دوم رستوران تهران در محله پاکی. غذای اصیل ایرانی، نقدهای خوب در TheFork و TripAdvisor.',
 NULL, NULL, NULL, 46.21079870, 6.14888110, 0, 1, 1),

(17, 'Golestan Restaurant', 'رستوران گلستان', 'restaurant', 'Geneva', 'Geneva',
 'Rue de Monthoux 58, 1201 Geneva', '+41 22 731 76 76', 'http://www.golestanrestaurant.com', NULL, 'restaurantgolestan',
 'Established Persian restaurant in Geneva Paquis neighborhood. Offers dine-in, delivery and takeout. Listed on TripAdvisor, TheFork and Yelp.',
 'رستوران ایرانی با سابقه در محله پاکی ژنو. تحویل، بیرون‌بر و نشستن در رستوران.',
 NULL, NULL, NULL, 46.21148070, 6.14570550, 0, 1, 1),

(19, 'Ardineh Persian Gastronomy', 'اردینه - غذای ایرانی', 'cafe', 'Lausanne', 'Vaud',
 NULL, '+41 79 349 79 44', 'https://www.ardineh.ch', NULL, 'ardineh',
 'Persian catering and dinner club sharing generational Iranian culinary heritage. Complete gastronomy menus, private cooking classes, dinner club events and festive boxes. Featured in Le Temps newspaper.',
 'پذیرایی ایرانی و کلوب شام که میراث آشپزی نسل‌های ایرانی را به اشتراک می‌گذارد. منوهای کامل گاسترونومی، کلاس‌های آشپزی خصوصی و رویدادهای شام. معرفی شده در روزنامه Le Temps.',
 NULL, 'https://static.wixstatic.com/media/4cb251_dc295ab07708435b8353db574bdeff4b~mv2.png/v1/fit/w_2500,h_1330,al_c/4cb251_dc295ab07708435b8353db574bdeff4b~mv2.png', NULL, 46.59048050, 6.62678850, 0, 1, 1),

(20, 'Persienmarkt', 'بازار پرشیا', 'grocery', 'Aargau', 'Aargau',
 'Webermühle 11, 5432 Neuenhof', '+41 76 397 21 01', 'https://persienmarkt.ch', 'customer.service@persienmarkt.ch', 'persienmarkt.shop',
 'Dedicated Persian supermarket and online shop. Sells Persian food products, snacks, sweets, saffron and spices. Ships across Switzerland.',
 'سوپرمارکت و فروشگاه آنلاین اختصاصی ایرانی. محصولات غذایی، تنقلات، شیرینی، زعفران و ادویه‌جات ایرانی می‌فروشد. ارسال در سراسر سوئیس.',
 NULL, 'https://persienmarkt.ch/cdn/shop/files/Persien_market_ED_Reza_250.jpg?v=1613725978', NULL, 47.45851320, 8.31247820, 1, 1, 1),

(21, 'Ariana Food', 'آریانا فود', 'grocery', 'Geneva', 'Geneva',
 'Halle de Rive, Boulevard Helvetique, 1207 Geneva', '+41 22 736 53 60', NULL, NULL, NULL,
 'Persian food supplier and specialty grocery inside the Halle de Rive market. Well-known in the Geneva Iranian community for sourcing Persian-specific ingredients.',
 'تأمین‌کننده غذای ایرانی در بازار هال دو ریو ژنو. در بین جامعه ایرانی ژنو برای تهیه مواد اولیه ایرانی شناخته شده.',
 NULL, NULL, NULL, 46.20051640, 6.15430520, 0, 1, 1),

(22, 'Salon Tina Tehran', 'سالن تینا تهران', 'hairdresser', 'Zurich', 'Zurich',
 NULL, NULL, 'https://tinatehran.ch', NULL, 'tinatehranbeauty',
 'Iranian-owned hair salon with 25+ years of experience. Services include Balayage, coloration, keratin treatments, hair extensions, facials and men grooming. Also sells a branded Tina Tehran haircare product line.',
 'آرایشگاه ایرانی با بیش از ۲۵ سال تجربه. خدمات شامل بالایاژ، رنگ، کراتین، اکستنشن مو، فیشال و آرایش مردانه.',
 NULL, NULL, NULL, 47.39131670, 8.48933320, 1, 1, 1),

(34, 'Restaurant Pasargades', 'رستوران پاسارگاد', 'restaurant', '', 'Geneva',
 'Rue du-Roveray 14, 1207 Geneva', '+41 22 900 14 02', NULL, NULL, NULL,
 'Traditional Persian restaurant in Geneva offering authentic Iranian dishes and warm hospitality.',
 'رستوران سنتی ایرانی در ژنو با غذاهای اصیل ایرانی و مهمان‌نوازی گرم.',
 NULL, NULL, NULL, 46.20524120, 6.15890240, 0, 0, 1),

(36, 'Little Persia', 'پرشیای کوچک', 'restaurant', '', 'Vaud',
 'Avenue Louis-Ruchonnet 7, 1003 Lausanne', '+41 21 357 38 57', NULL, NULL, NULL,
 'Cosy Persian restaurant in Lausanne serving homestyle Iranian cooking with fresh ingredients.',
 'رستوران دنج ایرانی در لوزان با آشپزی خانگی ایرانی و مواد اولیه تازه.',
 NULL, NULL, NULL, 46.51803320, 6.62674400, 0, 0, 1),

(39, 'Le Palais Oriental', 'کاخ شرق', 'restaurant', '', 'Vaud',
 'Quai E. Ansermet 6, 1820 Montreux', '+41 21 963 12 71', NULL, NULL, NULL,
 'Oriental restaurant in Montreux with stunning lake views, serving Persian and Middle Eastern cuisine.',
 'رستوران شرقی در مونترو با چشم‌انداز زیبای دریاچه، ارائه غذای ایرانی و خاورمیانه‌ای.',
 NULL, NULL, NULL, 46.43070740, 6.90914560, 0, 0, 1),

(41, 'Persian Gulf', 'خلیج فارس', 'restaurant', '', 'Basel-Stadt',
 'Viaduktstrasse 10, 4051 Basel', NULL, NULL, NULL, NULL,
 'Persian food stall inside the Markthalle Basel, offering fresh Iranian street food and traditional dishes.',
 'غرفه غذای ایرانی داخل مارکت‌هاله بازل، ارائه غذای خیابانی ایرانی و غذاهای سنتی.',
 NULL, NULL, NULL, 47.54891090, 7.58721830, 0, 0, 1),

(46, '1001 Notte', 'هزار و یک شب', 'restaurant', '', 'Ticino',
 'Via Zurigo 6, 6900 Lugano', '+41 91 923 19 37', NULL, NULL, NULL,
 'Middle Eastern and Persian restaurant in Lugano evoking the spirit of 1001 Nights with flavourful Iranian and oriental dishes.',
 'رستوران خاورمیانه‌ای و ایرانی در لوگانو با الهام از روح هزار و یک شب با غذاهای ایرانی و شرقی.',
 NULL, NULL, NULL, 46.01174530, 8.95444910, 0, 0, 1),

(47, 'Safari Oriental Restaurant', 'رستوران صفاری شرقی', 'restaurant', '', 'Aargau',
 'Buchserstrasse 30, 5000 Aarau', '+41 62 823 92 55', 'https://safari-oriental-restaurant.ch', NULL, 'safariorientalrestaurant',
 'Oriental restaurant in Aarau offering Persian and Middle Eastern cuisine in a welcoming atmosphere.',
 'رستوران شرقی در آراو با غذای ایرانی و خاورمیانه‌ای در فضایی صمیمانه.',
 NULL, NULL, NULL, 47.39072020, 8.06031820, 0, 0, 1),

(48, 'Shiraz Barber', 'آرایشگاه شیراز', 'hairdresser', '', 'Bern',
 'Melchtalstrasse 19, 3014 Bern', '+41 76 404 99 88', NULL, NULL, NULL,
 'Persian-owned barber shop in Bern offering modern and traditional haircuts and grooming services.',
 'آرایشگاه ایرانی در برن با خدمات مدرن و سنتی کوتاهی مو و آرایش.',
 NULL, NULL, NULL, 46.96150020, 7.45605470, 0, 0, 1),

(53, 'Suba Casa', 'سوبا کازا', 'restaurant', '', 'Lucerne',
 'An der Kleinen Emme 1, 6014 Luzern', '+41 41 558 50 51', 'https://suba-casa.com', NULL, 'suba_casa',
 'Fusion restaurant combining Italian and Persian-Afghan cooking. Menu features handmade pizza, pasta and traditional dishes including Qabuli Palau and Bolani.',
 'رستوران فیوژن با ترکیب آشپزی ایتالیایی و ایرانی-افغانی. منو شامل پیتزا و پاستا دست‌ساز و غذاهای سنتی.',
 NULL, NULL, NULL, 47.05293420, 8.25608290, 0, 0, 1),

(55, 'Baran Restaurant', 'رستوران باران', 'restaurant', '', 'Zurich',
 'Kilchbergstrasse 8, 8134 Adliswil', '+41 44 510 90 88', NULL, NULL, NULL,
 'Persian and Afghan restaurant and takeaway in Adliswil, south of Zurich. Serves Middle Eastern, Persian and Mediterranean cuisine.',
 'رستوران و بیرون‌بر ایرانی و افغانی در آدلیسویل جنوب زوریخ. غذای خاورمیانه‌ای، ایرانی و مدیترانه‌ای.',
 NULL, NULL, NULL, 47.31227890, 8.52837800, 0, 0, 1),

(58, 'Persisch.ch', 'پرشیش', 'grocery', '', 'Aargau',
 'Dorfstrasse 18c, 5442 Fislisbach', '+41 79 372 32 08', 'https://persisch.ch', 'info@persisch.ch', NULL,
 'Online shop for Persian dried fruits, nuts, spices, sweets and natural products. Operating in Switzerland for over 30 years. Nationwide delivery via Swiss Post.',
 'فروشگاه آنلاین میوه‌خشک، آجیل، ادویه، شیرینی و محصولات طبیعی ایرانی. بیش از ۳۰ سال فعالیت در سوئیس. ارسال سراسری.',
 NULL, NULL, NULL, 47.43601560, 8.29612850, 0, 0, 1),

(62, 'Anar Restaurant', 'رستوران انار', 'restaurant', '', 'Geneva',
 'Geneva', '+41 79 589 40 13', NULL, NULL, 'restaurant.anar.ge',
 'Highly-rated Iranian restaurant in Geneva with a 9.5/10 on TheFork. Open 7 days a week 11:00-23:00. Halal, family-friendly, available for delivery via Smood.',
 'رستوران ایرانی با امتیاز عالی در ژنو. هفت روز هفته ۱۱ تا ۲۳. حلال، مناسب خانواده، تحویل از طریق اسمود.',
 NULL, NULL, NULL, 46.20440000, 6.14320000, 0, 0, 1),

(85, 'Restaurant Tehran', 'رستوران تهران', 'restaurant', '', 'Geneva',
 'Rue des Paquis 18, 1201 Geneva', '+41 22 731 22 22', 'https://restaurant-tehran.ch', NULL, NULL,
 'Authentic Persian restaurant in Geneva Paquis near the lake. Traditional Iranian cuisine, open daily with takeout and delivery.',
 'رستوران اصیل ایرانی در پاکی ژنو نزدیک دریاچه. غذای سنتی ایرانی، هر روز با بیرون‌بر و تحویل.',
 NULL, NULL, NULL, 46.20940000, 6.14860000, 0, 0, 1),

(86, 'Mama Persia', 'مامان پرشیا', 'restaurant', '', 'Zurich',
 'Seestrasse 116, 8803 Ruschlikon', '+41 43 388 05 15', NULL, NULL, NULL,
 'Persian restaurant on the shores of Lake Zurich offering traditional Iranian cuisine.',
 'رستوران ایرانی در کنار دریاچه زوریخ با غذاهای سنتی ایرانی در چشم‌اندازی زیبا.',
 NULL, NULL, NULL, 47.30240000, 8.56090000, 0, 0, 1),

(87, 'Kian Persian Restaurant', 'رستوران کیان', 'restaurant', '', 'Zurich',
 'Stampfenbachstrasse 24, 8001 Zurich', '+41 44 577 41 00', NULL, NULL, NULL,
 'Authentic Persian cuisine in the heart of Zurich serving traditional Iranian dishes in an elegant setting.',
 'غذای اصیل ایرانی در قلب زوریخ با غذاهای سنتی در فضایی شیک.',
 NULL, NULL, NULL, 47.37870000, 8.54380000, 0, 0, 1),

(88, 'Restaurant Persepolis', 'رستوران تخت‌جمشید', 'restaurant', '', 'Geneva',
 'Rue Chaponniere 7, 1201 Geneva', '+41 22 900 19 19', NULL, NULL, NULL,
 'Persian restaurant in central Geneva serving classic Iranian cuisine including kebabs, stews and rice dishes.',
 'رستوران ایرانی در مرکز ژنو با غذاهای کلاسیک ایرانی شامل کباب، خورش و برنج.',
 NULL, NULL, NULL, 46.20950000, 6.14480000, 0, 0, 1),

(89, 'Reflets de Perse', 'بازتاب‌های پرشیا', 'restaurant', '', 'Vaud',
 'Avenue Emile-Henri-Jaques-Dalcroze 9, 1007 Lausanne', NULL, NULL, NULL, NULL,
 'Refined Persian restaurant in Lausanne with elegant decor and traditional Iranian recipes.',
 'رستوران ظریف ایرانی در لوزان با دکور شیک و دستورهای سنتی ایرانی.',
 NULL, NULL, NULL, 46.51180000, 6.60940000, 0, 0, 1),

(90, 'TAJ Persisches Restaurant', 'رستوران تاج', 'restaurant', '', 'Basel-Stadt',
 'Mullheimerstrasse 152, 4057 Basel', '+41 79 398 12 89', NULL, NULL, NULL,
 'Authentic Persian restaurant in Basel serving kebabs, ghormeh sabzi and rice specialties.',
 'رستوران اصیل ایرانی در بازل با کباب، قرمه‌سبزی و تخصص‌های برنجی.',
 NULL, NULL, NULL, 47.56990000, 7.59240000, 0, 0, 1),

(92, 'Banoo im Rossli', 'بانو در راسلی', 'restaurant', '', 'St. Gallen',
 'Hauptplatz 5, 8640 Rapperswil-Jona', '+41 55 525 63 93', NULL, NULL, NULL,
 'Persian restaurant in the historic Rossli building in Rapperswil offering traditional Iranian home cooking.',
 'رستوران ایرانی در ساختمان تاریخی راسلی در راپرسویل با آشپزی خانگی سنتی ایرانی.',
 NULL, NULL, NULL, 47.22670000, 8.81610000, 0, 0, 1),

(93, 'Shiraz Restaurant', 'رستوران شیراز', 'restaurant', '', 'Solothurn',
 'Oltnerstrasse 29, 5012 Schonenwerd', '+41 79 503 59 90', 'https://shiraz-restaurant.ch', NULL, 'shiraz_restaurant_schweiz',
 'Persian restaurant in Schonenwerd serving authentic Iranian dishes.',
 'رستوران ایرانی در شونن‌ورد با غذاهای اصیل ایرانی. رزرو آنلاین از طریق وبسایت.',
 NULL, NULL, NULL, 47.37000000, 8.00220000, 0, 0, 1),

(94, 'Cafe Restaurant Safran', 'کافه رستوران زعفران', 'cafe', '', 'Schaffhausen',
 'Muhlentalstrasse 2, 8200 Schaffhausen', '+41 52 620 10 45', 'https://cafe-restaurant-safran.ch', 'info@cafe-restaurant-safran.ch', NULL,
 'Persian-inspired cafe and restaurant in Schaffhausen named after the prized Iranian spice saffron.',
 'کافه و رستوران با الهام ایرانی در شافهاوزن به نام ادویه ارزشمند ایرانی زعفران.',
 NULL, NULL, NULL, 47.69950000, 8.63260000, 0, 0, 1),

(95, 'Safran Persisches Restaurant', 'رستوران زعفران', 'restaurant', '', 'Lucerne',
 'Gerliswilstrasse 62, 6020 Emmenbrucke', NULL, 'https://persischesrestaurant.ch', NULL, NULL,
 'Authentic Persian restaurant near Lucerne specialising in kebabs and traditional Iranian dishes. Takeout and delivery available.',
 'رستوران اصیل ایرانی نزدیک لوسرن متخصص در کباب و غذاهای سنتی ایرانی. بیرون‌بر و تحویل موجود.',
 NULL, NULL, NULL, 47.07600000, 8.27470000, 0, 0, 1),

(96, 'Cyrus KitchenBar', 'سایروس کیچن‌بار', 'restaurant', '', 'St. Gallen',
 'Schutzengasse 8, 9000 St. Gallen', '+41 71 220 11 12', 'https://cyrus-sg.ch', NULL, 'cyrus.kitchenbar',
 'Premium Persian restaurant and bar near St. Gallen train station, opened 2024. Fine Persian cuisine, tapas and cocktails.',
 'رستوران و بار برتر ایرانی نزدیک ایستگاه قطار سنت گالن، افتتاح ۲۰۲۴. غذای ظریف ایرانی، تاپاس و کوکتل.',
 NULL, NULL, NULL, 47.42450000, 9.37670000, 0, 0, 1),

(97, 'Persian Food Kitchen', 'آشپزخانه غذای ایرانی', 'restaurant', '', 'Zurich',
 'Aargauerstrasse 200, 8048 Zurich', NULL, 'https://persianfoodkitchen.ch', NULL, NULL,
 'Vegetarian Persian restaurant by Iranian chef Parsa Bejarsari. Fresh traditional and creative Persian dishes daily. Dine-in or takeaway.',
 'رستوران گیاهی ایرانی توسط سرآشپز ایرانی پارسا. غذاهای تازه سنتی و خلاقانه ایرانی روزانه. نشستن یا بیرون‌بر.',
 NULL, NULL, NULL, 47.37690000, 8.50600000, 0, 0, 1),

(98, 'PAS Markt', 'پاس مارکت', 'grocery', '', 'Zurich',
 'Schaffhauserstrasse 500, 8052 Zurich', NULL, NULL, NULL, NULL,
 'Persian grocery store in Zurich-Seebach with Iranian spices, rice, dried fruit and sweets.',
 'فروشگاه ایرانی در زوریخ با ادویه‌جات، برنج، میوه‌خشک و شیرینی ایرانی.',
 NULL, NULL, NULL, 47.40860000, 8.53640000, 0, 0, 1),

(99, 'Swisspica', 'سویس‌پیکا', 'grocery', '', 'Zurich',
 'Zwickystrasse 61, 8600 Dubendorf', '+41 76 579 27 55', 'https://swisspica.ch', NULL, NULL,
 'Swiss supplier of premium Iranian saffron, caviar and pistachios. Supplies top Swiss hotels including Suvretta House and The Chedi Andermatt.',
 'تأمین‌کننده سوئیسی زعفران، خاویار و پسته برتر ایرانی. تأمین‌کننده هتل‌های برتر سوئیس از جمله Suvretta House.',
 NULL, NULL, NULL, 47.39680000, 8.61940000, 0, 0, 1),

(100, 'YALDA Cuisine Orientale', 'یلدا - غذای شرقی', 'restaurant', '', 'Zurich',
 'Gustav-Gull-Platz 2, 8004 Zurich', '+41 44 542 88 99', 'https://yalda.ch', NULL, 'yalda_cuisine_orientale',
 'Oriental buffet restaurant named after Persian Yalda Night. Hot and cold Middle Eastern buffets plus an in-house bazaar with spices and cookbooks.',
 'رستوران بوفه شرقی به نام شب یلدای ایرانی. بوفه گرم و سرد خاورمیانه‌ای به علاوه بازار داخلی با ادویه و کتاب آشپزی.',
 NULL, NULL, NULL, 47.37790000, 8.53620000, 0, 0, 1),

(101, 'YALDA Cuisine Orientale Sihlcity', 'یلدا - غذای شرقی (زیل‌سیتی)', 'restaurant', '', 'Zurich',
 'Kalanderplatz 1, 8045 Zurich', '+41 44 578 07 08', 'https://yalda.ch', NULL, 'yalda_cuisine_orientale',
 'Second YALDA location in Sihlcity. Oriental buffet named after the Persian winter solstice festival with in-house bazaar.',
 'شعبه دوم یلدا در زیل‌سیتی. بوفه شرقی به نام جشن انقلاب زمستانی ایرانی با بازار داخلی.',
 NULL, NULL, NULL, 47.36340000, 8.52670000, 0, 0, 1),

(102, 'Restaurant Hafez', 'رستوران حافظ', 'restaurant', '', 'Geneva',
 'Rue Adrien-Lachenal 22, 1207 Geneva', '+41 22 700 00 81', NULL, NULL, NULL,
 'Long-established Iranian restaurant in Geneva Eaux-Vives. Named after the Persian poet Hafez, serving koobideh kebabs, saffron rice and Iranian stews.',
 'رستوران ایرانی با سابقه طولانی در ژنو. به نام شاعر ایرانی حافظ. کباب کوبیده، برنج زعفرانی و خورش‌های ایرانی.',
 NULL, NULL, NULL, 46.20520000, 6.15890000, 0, 0, 1),

(103, 'Molana Restaurant', 'رستوران مولانا', 'restaurant', '', 'Vaud',
 'Avenue Frederic-Recordon 2, 1004 Lausanne', '+41 21 862 88 88', 'https://molanarestaurant20.com', NULL, NULL,
 'Modern Iranian restaurant in Lausanne offering traditional Persian cuisine with lamb kebabs, stews and saffron basmati rice in an oriental atmosphere.',
 'رستوران مدرن ایرانی در لوزان با کباب بره، خورش و برنج باسمتی زعفرانی در فضای شرقی.',
 NULL, NULL, NULL, 46.52010000, 6.62670000, 0, 0, 1),

(104, 'Chef Majid', 'شف مجید', 'restaurant', '', 'Vaud',
 'Rue de Verdeaux 16, 1020 Renens', NULL, 'https://chefmajid.ch', NULL, NULL,
 'Authentic Persian restaurant and supermarket with over 30 years of culinary experience. Traditional Iranian dishes with warm hospitality.',
 'رستوران و سوپرمارکت اصیل ایرانی با بیش از ۳۰ سال تجربه آشپزی. غذاهای سنتی ایرانی با مهمان‌نوازی گرم.',
 NULL, NULL, NULL, 46.53780000, 6.59220000, 0, 0, 1),

(105, 'Pishi Breakfast', 'پیشی صبحانه', 'cafe', '', 'Solothurn',
 'Muhletalweg 12, 4600 Olten', NULL, 'https://pishibreakfast.ch', NULL, 'pishibreakfast',
 'Homemade oriental breakfast restaurant specialising in Iranian and Turkish breakfast items. Fresh traditional dishes and evening Persian cuisine.',
 'رستوران صبحانه شرقی خانگی متخصص در صبحانه ایرانی و ترکی. غذاهای تازه سنتی و شام ایرانی.',
 NULL, NULL, NULL, 47.35260000, 7.90780000, 0, 0, 1),

(106, 'Damavand Switzerland', 'دماوند سوئیس', 'restaurant', '', 'Geneva',
 'Geneva', NULL, 'https://damavand.ch', NULL, NULL,
 'Iranian restaurant and catering founded by chef Maryam, offering authentic charcoal-grilled marinated skewers and slow-cooked Persian stews since 2017.',
 'رستوران و پذیرایی ایرانی تأسیس توسط سرآشپز مریم. کباب‌های معطر و خورش‌های کند-پخته از ۲۰۱۷.',
 NULL, NULL, NULL, 46.20440000, 6.14320000, 0, 0, 1),

(107, 'Herat Restaurant', 'رستوران هرات', 'restaurant', '', 'Vaud',
 'Avenue Alexandre-Vinet 22, 1004 Lausanne', '+41 21 647 30 35', 'https://herat.ch', 'info@herat.ch', 'herat.restaurant',
 'Persian and Afghan restaurant in Lausanne offering traditional Middle Eastern and Iranian cuisine with authentic flavours.',
 'رستوران ایرانی و افغانی در لوزان با غذاهای سنتی خاورمیانه‌ای و ایرانی با طعم‌های اصیل.',
 NULL, NULL, NULL, 46.51900000, 6.62180000, 0, 0, 1),

(108, 'Chalet Persia', 'شالت پرشیا', 'other', '', 'Zurich',
 'Switzerland', NULL, 'https://chalet-persia.ch', NULL, NULL,
 'Premium Persian event catering service operating since 2013. Authentic Persian cuisine for weddings, birthdays, corporate events and private functions across Switzerland.',
 'سرویس پذیرایی رویدادهای ایرانی برتر از ۲۰۱۳. غذای اصیل ایرانی برای عروسی، جشن تولد و مجالس شرکتی در سراسر سوئیس.',
 NULL, NULL, NULL, 46.81820000, 8.22750000, 0, 0, 1),

(109, 'Royal Oriental', 'رویال اورینتال', 'restaurant', '', 'Geneva',
 'Avenue Louis-Casai 60, 1216 Meyrin', '+41 22 788 87 87', NULL, NULL, 'restaurant.royal.oriental',
 'One of the largest Iranian restaurants in Geneva. Serves Persian and Middle Eastern cuisine including lamb kebabs and traditional rice dishes. Outdoor terrace, open daily 11:30-23:00.',
 'یکی از بزرگ‌ترین رستوران‌های ایرانی در ژنو. کباب بره و غذاهای برنجی سنتی. تراس خارجی، هر روز ۱۱:۳۰ تا ۲۳.',
 NULL, NULL, NULL, 46.23020000, 6.10790000, 0, 0, 1);

-- Reset AUTO_INCREMENT to continue from where we left off
ALTER TABLE `businesses` AUTO_INCREMENT = 112;
