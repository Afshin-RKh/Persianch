<?php
/**
 * One-time blog seeder — creates users + blog posts.
 * DELETE this file after running.
 * Run: https://birunimap.com/api/seeder_blog.php?secret=seed2025biruni
 */
require_once 'config.php';

if (($_GET['secret'] ?? '') !== 'seed2025biruni') {
    http_response_code(403); echo 'Forbidden'; exit();
}

$users = [
    ['name' => 'Zahra Hosseini',   'email' => 'zahra.hosseini@birunimap.com',   'role' => 'user'],
    ['name' => 'Helma Karimi',     'email' => 'helma.karimi@birunimap.com',     'role' => 'user'],
    ['name' => 'Hamid Taheri',     'email' => 'hamid.taheri@birunimap.com',     'role' => 'user'],
    ['name' => 'Reza Ahmadi',      'email' => 'reza.ahmadi@birunimap.com',      'role' => 'user'],
    ['name' => 'Neda Moradi',      'email' => 'neda.moradi@birunimap.com',      'role' => 'user'],
    ['name' => 'Arash Shirazi',    'email' => 'arash.shirazi@birunimap.com',    'role' => 'user'],
];

$authorIds = [];
$hash = password_hash('Biruni2025!', PASSWORD_DEFAULT);

foreach ($users as $u) {
    $existing = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $existing->execute([':email' => $u['email']]);
    $row = $existing->fetch();
    if ($row) {
        $authorIds[$u['name']] = (int)$row['id'];
        echo "EXISTS: {$u['name']}<br>";
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (:name, :email, :hash, :role, 1)");
        $stmt->execute([':name' => $u['name'], ':email' => $u['email'], ':hash' => $hash, ':role' => $u['role']]);
        $authorIds[$u['name']] = (int)$pdo->lastInsertId();
        echo "CREATED USER: {$u['name']}<br>";
    }
}

function insertPost(PDO $pdo, array $p): void {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $p['title'])));
    $slug = trim($slug, '-');
    $ex = $pdo->prepare("SELECT id FROM blog_posts WHERE slug = :slug");
    $ex->execute([':slug' => $slug]);
    if ($ex->fetch()) {
        // Update instead of skip, to refresh content
        $pdo->prepare("UPDATE blog_posts SET content=:c, cover_image=:img, language=:lang WHERE slug=:slug")
            ->execute([':c' => $p['content'], ':img' => $p['cover_image'] ?? null, ':lang' => $p['language'], ':slug' => $slug]);
        echo "UPDATED: $slug<br>"; return;
    }
    $pdo->prepare(
        "INSERT INTO blog_posts (title, slug, content, author_id, status, published, tags, country, city, language, cover_image, created_at)
         VALUES (:title, :slug, :content, :author_id, 'approved', 1, :tags, :country, :city, :language, :cover_image, :created_at)"
    )->execute([
        ':title'       => $p['title'],
        ':slug'        => $slug,
        ':content'     => $p['content'],
        ':author_id'   => $p['author_id'],
        ':tags'        => $p['tags'] ?? null,
        ':country'     => 'Switzerland',
        ':city'        => $p['city'] ?? null,
        ':language'    => $p['language'],
        ':cover_image' => $p['cover_image'] ?? null,
        ':created_at'  => $p['date'],
    ]);
    echo "CREATED: $slug<br>";
}

$posts = [];

// ── POST 1 — Residence Permits (EN) ──────────────────────────────────────────
$posts[] = [
    'title'       => 'Residence Permits in Switzerland: Everything You Need to Know',
    'author_id'   => $authorIds['Reza Ahmadi'],
    'language'    => 'en',
    'tags'        => 'legal',
    'city'        => null,
    'date'        => '2025-01-10 09:00:00',
    'cover_image' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
    'content'     => '<p style="font-size:1.1rem;color:#374151;line-height:1.9;">The first time I walked into a Swiss <em>Migrationsamt</em>, I had three different forms, a folder full of photocopies, and the kind of confidence that comes from absolutely not knowing what you\'re doing. Two hours and one very patient clerk later, I left with a temporary residence confirmation and a much clearer picture of how this system works. Let me save you that two hours.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">The Four Permits You\'ll Encounter</h2>

<p>Switzerland\'s permit system is logical once you see it whole. Think of it as a ladder: you typically start at the bottom and work your way up as your ties to the country deepen.</p>

<h3 style="color:#374151;">🔵 L Permit — Short-Term Residence</h3>
<p>The <strong>L permit</strong> is for stays under 12 months. It\'s tied to a fixed-term contract — a language course, a seasonal job, a limited internship. Don\'t plan your life around it; it doesn\'t automatically renew, and it doesn\'t lead directly to a B permit unless your circumstances change.</p>

<h3 style="color:#374151;">🟢 B Permit — Annual Residence</h3>
<p>This is what most newcomers are aiming for. The <strong>B permit</strong> is issued for one year and renewed annually (then every two or five years once you\'ve established yourself). It requires a concrete reason for being here: a job offer, family reunification, or university enrolment. It gives you the right to live and work in Switzerland.</p>
<p>One thing people often miss: the B permit is <strong>cantonal</strong>. It\'s tied to the canton where you register. Move to another canton, and you have 14 days to re-register — your permit transfers, but you must notify both cantons.</p>

<h3 style="color:#374151;">🟡 C Permit — Settlement (Permanent Residence)</h3>
<p>The <strong>C permit</strong> is the holy grail. For non-EU nationals like Iranians, it\'s available after <strong>10 years</strong> of continuous, uninterrupted residence. It grants near-unlimited rights — you can change jobs, switch cantons, and even be absent from Switzerland for up to 6 months without losing it. Requirements include integration criteria: language proficiency, no criminal record, financial independence.</p>

<h3 style="color:#374151;">🟠 G Permit — Cross-Border Commuter</h3>
<p>If you live in France, Germany, Austria, or Italy and work in Switzerland, the <strong>G permit</strong> lets you cross the border for work — provided you return home at least once a week.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">The Registration Process, Step by Step</h2>

<ol style="line-height:2;color:#374151;">
  <li>Arrive in Switzerland with your national visa (type D)</li>
  <li>Within <strong>14 days</strong>, visit your local <em>Einwohnerkontrolle</em> (residents\' registration office) with your passport, rental contract, and visa</li>
  <li>They register you as a resident and forward your details to the cantonal migration office</li>
  <li>The migration office processes your permit — this takes 4–8 weeks</li>
  <li>You receive your permit card by post or are asked to collect it in person</li>
</ol>

<h2 style="color:#1B3A6B;margin-top:2rem;">Common Pitfalls</h2>

<ul style="line-height:2;color:#374151;">
  <li><strong>Missing the 14-day window</strong> — technically a violation; register promptly</li>
  <li><strong>Changing jobs without notifying the migration office</strong> — your permit is linked to your employer for the first few years on a B permit</li>
  <li><strong>Long absences abroad</strong> — leaving Switzerland for more than 6 months can reset your residency clock and jeopardise your path to a C permit</li>
</ul>

<blockquote style="border-left:4px solid #C9A84C;padding-left:1.2rem;color:#6b7280;font-style:italic;margin:1.5rem 0;">
  "Switzerland rewards consistency. The system is designed for people who show up, stay, integrate, and contribute — and it genuinely rewards those who do."
</blockquote>

<h2 style="color:#1B3A6B;margin-top:2rem;">Official Resources</h2>
<ul style="line-height:2;">
  <li><a href="https://www.sem.admin.ch/sem/en/home/themen/aufenthalt/nicht-eu_efta/ausweis_b_jahresaufenthalt.html" target="_blank" style="color:#1B3A6B;">SEM — B Permit details</a></li>
  <li><a href="https://www.sem.admin.ch/sem/en/home/themen/aufenthalt/nicht-eu_efta/ausweis_c_niederlassungsbewilligung.html" target="_blank" style="color:#1B3A6B;">SEM — C Permit (Settlement)</a></li>
  <li><a href="https://www.ch.ch/en/foreign-nationals-in-switzerland/residence-permits/" target="_blank" style="color:#1B3A6B;">ch.ch — Full permits overview</a></li>
</ul>
<p style="font-size:0.85rem;color:#9ca3af;margin-top:1.5rem;">⚠️ Permit rules change and vary by canton. Always verify with the official Swiss State Secretariat for Migration (SEM) or a qualified immigration lawyer.</p>',
];

// ── POST 2 — Health Insurance (FA) ───────────────────────────────────────────
$posts[] = [
    'title'       => 'بیمه درمانی در سوئیس: آنچه هیچ‌کس به شما نمی‌گوید',
    'author_id'   => $authorIds['Zahra Hosseini'],
    'language'    => 'fa',
    'tags'        => 'legal,survival guides',
    'city'        => null,
    'date'        => '2025-01-18 10:00:00',
    'cover_image' => 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&q=80',
    'content'     => '<p style="font-size:1.1rem;color:#374151;line-height:2;font-family:Vazirmatn,sans-serif;">وقتی برای اولین بار به سوئیس رسیدم، یکی از هموطنانم گفت: «بیمه درمانی‌ات را همین هفته اول بگیر، قبل از هر چیز.» فکر کردم اغراق می‌کند. نمی‌کرد. سه ماه مهلت دارید — اما هر روز تأخیر، حق بیمه از همان روز ورودتان محاسبه می‌شود. یعنی اگر دیر بجنبید، باید ماه‌ها حق بیمه عقب‌افتاده یکجا پرداخت کنید.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">چرا بیمه اجباری است؟</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">سوئیس بر اساس قانون فدرال KVG (Krankenversicherungsgesetz) هر ساکنی را ملزم به داشتن بیمه درمانی پایه می‌کند. این بیمه توسط شرکت‌های خصوصی ارائه می‌شود اما محتوای آن توسط دولت تعیین می‌گردد — همه شرکت‌ها <strong>دقیقاً همان خدمات پایه</strong> را ارائه می‌دهند. تفاوت فقط در قیمت، مدل، و کیفیت خدمات مشتری است.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">مدل‌های بیمه: کدام را انتخاب کنم؟</h2>

<h3 style="font-family:Vazirmatn,sans-serif;">🏥 مدل Standard — آزادی کامل</h3>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">مستقیماً به هر پزشکی در سوئیس مراجعه می‌کنید. هیچ محدودیتی ندارید. اما <strong>گران‌ترین</strong> مدل است. اگر مشکل مزمن دارید یا می‌خواهید پزشک متخصص خاصی را ببینید، این مدل برای شما مناسب است.</p>

<h3 style="font-family:Vazirmatn,sans-serif;">📞 مدل Telmed — ابتدا تلفن</h3>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">قبل از مراجعه به پزشک، با یک خط پزشکی تلفنی (مثل Medi24 یا Medgate) تماس می‌گیرید. آن‌ها تصمیم می‌گیرند آیا نیاز به ویزیت دارید یا نه. معمولاً <strong>ارزان‌ترین</strong> مدل است و برای افراد سالم که کمتر به پزشک می‌روند عالی است.</p>

<h3 style="font-family:Vazirmatn,sans-serif;">🏢 مدل HMO — مرکز بهداشت ثابت</h3>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">به یک مرکز بهداشتی خاص متصل هستید و همیشه ابتدا باید آنجا بروید. قیمت خوبی دارد و هماهنگی خدمات بهتر است — اما اگر شهر تغییر دهید، ممکن است مشکل‌ساز شود.</p>

<h3 style="font-family:Vazirmatn,sans-serif;">👨‍⚕️ مدل Hausarzt — پزشک خانوادگی</h3>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">یک پزشک عمومی ثابت انتخاب می‌کنید. همه ارجاع‌ها از طریق او انجام می‌شود. ارتباط درمانی مستمر می‌سازد و قیمت معقولی دارد.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">فرانشیز: راز صرفه‌جویی</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">فرانشیز (Franchise) مبلغی است که هر سال ابتدا از جیب خودتان پرداخت می‌کنید — بعد از آن بیمه ۹۰٪ هزینه‌ها را می‌پردازد و شما ۱۰٪ (تا سقف ۷۰۰ فرانک). محدوده فرانشیز برای بزرگسالان:</p>
<ul style="line-height:2;font-family:Vazirmatn,sans-serif;">
  <li><strong>۳۰۰ فرانک</strong> — کمترین فرانشیز، بیشترین حق بیمه ماهانه</li>
  <li><strong>۵۰۰ / ۱۰۰۰ / ۱۵۰۰ / ۲۰۰۰ فرانک</strong> — میانی</li>
  <li><strong>۲۵۰۰ فرانک</strong> — بیشترین فرانشیز، کمترین حق بیمه ماهانه</li>
</ul>

<blockquote style="border-right:4px solid #C9A84C;padding-right:1.2rem;color:#6b7280;font-style:italic;margin:1.5rem 0;text-align:right;font-family:Vazirmatn,sans-serif;">
  اگر سالم هستید و سالی یکی دو بار پیش پزشک می‌روید، فرانشیز ۲۵۰۰ انتخاب کنید — در حق بیمه ماهانه چنان صرفه‌جویی می‌کنید که حتی اگر تمام فرانشیز را هم استفاده کنید، باز هم جلویید.
</blockquote>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">کمک هزینه دولتی</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">اگر درآمدتان پایین است، ممکن است واجد دریافت <strong>Prämienverbilligung</strong> (کاهش حق بیمه) باشید. این از طریق کانتون شما اعمال می‌شود — حتماً در اولین سال اقامت بررسی کنید.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">منابع رسمی</h2>
<ul style="line-height:2;font-family:Vazirmatn,sans-serif;">
  <li><a href="https://www.priminfo.admin.ch" target="_blank" style="color:#1B3A6B;">Priminfo — مقایسه رسمی حق بیمه‌ها (دولتی)</a></li>
  <li><a href="https://www.comparis.ch/krankenkassen" target="_blank" style="color:#1B3A6B;">Comparis — مقایسه و خرید آنلاین</a></li>
  <li><a href="https://www.bag.admin.ch/bag/en/home/versicherungen/krankenversicherung.html" target="_blank" style="color:#1B3A6B;">BAG — اداره فدرال بهداشت</a></li>
</ul>',
];

// ── POST 3 — Housing (EN) ─────────────────────────────────────────────────────
$posts[] = [
    'title'       => 'Finding an Apartment in Zurich: The Honest Guide',
    'author_id'   => $authorIds['Helma Karimi'],
    'language'    => 'en',
    'tags'        => 'survival guides',
    'city'        => 'Zurich',
    'date'        => '2025-01-25 11:00:00',
    'cover_image' => 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=900&q=80',
    'content'     => '<p style="font-size:1.1rem;color:#374151;line-height:1.9;">I applied to 47 apartments in Zurich before I got one. <em>Forty-seven.</em> My dossier was strong — good income, no debt, professional cover letter, even references. The market simply does not care. Vacancy rates in Zurich hover below 0.1% in some districts. But there are strategies that work, and this is everything I learned the hard way.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">Where to Search — And When</h2>
<p>Most Zurich apartments go live on <strong>Monday and Tuesday mornings</strong>. Set alerts on <a href="https://www.homegate.ch" target="_blank" style="color:#1B3A6B;">Homegate.ch</a> and <a href="https://www.immoscout24.ch" target="_blank" style="color:#1B3A6B;">ImmoScout24.ch</a> and check them before 9am those days. Applications submitted within the first two hours have a dramatically better shot.</p>

<p>Beyond the main portals:</p>
<ul style="line-height:2;">
  <li><a href="https://www.ronorp.net" target="_blank" style="color:#1B3A6B;"><strong>Ronorp.net</strong></a> — Zurich\'s community board, legendary among expats for off-market listings</li>
  <li><a href="https://www.wgzimmer.ch" target="_blank" style="color:#1B3A6B;"><strong>WGZimmer.ch</strong></a> — shared apartments, excellent if you\'re arriving alone and need somewhere quickly</li>
  <li><strong>Facebook groups</strong> — "Wohnung Zürich", "Expats in Zurich" — people post unadvertised sublets constantly</li>
  <li><strong>Your employer or university</strong> — always ask HR or the housing office before you start searching publicly. They often have leads they don\'t advertise.</li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;">Building an Unbeatable Dossier</h2>
<p>Swiss landlords receive 100+ applications per apartment. Your dossier is a first impression and a legal document simultaneously. Include:</p>

<ol style="line-height:2.2;">
  <li><strong>Betreibungsauszug</strong> (debt enforcement extract) — no older than 3 months, from your <em>Betreibungsamt</em>. This is non-negotiable. <a href="https://www.betreibungsauszug.ch" target="_blank" style="color:#1B3A6B;">Order online here</a></li>
  <li><strong>Last 3 pay slips</strong> — or a contract + bank statement if newly employed</li>
  <li><strong>Residence permit copy</strong> — landlords need to see your legal status</li>
  <li><strong>Cover letter</strong> — 1 paragraph, warm and specific. Mention why you want <em>this</em> apartment. Landlords are humans.</li>
  <li><strong>Previous landlord reference</strong> — if you have one, include it. If not, a professional reference works.</li>
</ol>

<h2 style="color:#1B3A6B;margin-top:2rem;">The Cooperative Housing Secret</h2>
<p>Zurich\'s housing cooperatives (<em>Genossenschaften</em>) offer rents 20–40% below market rate. The catch: waiting lists of 3–7 years. The strategy: <strong>register the day you arrive</strong>. The most established ones are <a href="https://www.abz.ch" target="_blank" style="color:#1B3A6B;">ABZ</a>, <a href="https://www.gbz.ch" target="_blank" style="color:#1B3A6B;">GBZ</a>, and <a href="https://www.familienheim.ch" target="_blank" style="color:#1B3A6B;">Familienheim</a>. Registration requires a small share purchase (CHF 1,000–3,000) and a nominal annual fee. Worth every franc.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">What It Will Cost</h2>
<p>Current Zurich market rents (2024–2025):</p>
<ul style="line-height:2;">
  <li><strong>1-room apartment:</strong> CHF 1,700–2,500/month depending on district and floor</li>
  <li><strong>2-room apartment:</strong> CHF 2,200–3,500/month</li>
  <li><strong>3-room apartment:</strong> CHF 2,800–4,500/month</li>
  <li><strong>Commuter belt</strong> (Winterthur, Baden, Dietikon): 20–35% less for comparable size</li>
</ul>
<p>You\'ll also pay a deposit of 2–3 months\' rent upfront, held in a blocked bank account.</p>

<blockquote style="border-left:4px solid #C9A84C;padding-left:1.2rem;color:#6b7280;font-style:italic;margin:1.5rem 0;">
  "In Zurich, the apartment finds you through persistence and preparation — not luck. Make your dossier perfect, apply to everything remotely suitable, and be ready to visit within 24 hours of being invited."
</blockquote>

<h2 style="color:#1B3A6B;margin-top:2rem;">Tenant Rights</h2>
<p>Once you have an apartment, Swiss law strongly protects you. Rent increases require formal notice, and you can challenge unfair increases through the <a href="https://www.mieterverband.ch" target="_blank" style="color:#1B3A6B;">Mieterverband (Swiss Tenants\' Association)</a>. Annual membership (~CHF 50–80) is one of the best investments a renter in Switzerland can make.</p>',
];

// ── POST 4 — Universities (EN) ────────────────────────────────────────────────
$posts[] = [
    'title'       => 'Getting into ETH Zurich and Swiss Universities: A Realistic Guide',
    'author_id'   => $authorIds['Hamid Taheri'],
    'language'    => 'en',
    'tags'        => 'survival guides',
    'city'        => 'Zurich',
    'date'        => '2025-02-03 10:00:00',
    'cover_image' => 'https://images.unsplash.com/photo-1562774053-701939374585?w=900&q=80',
    'content'     => '<p style="font-size:1.1rem;color:#374151;line-height:1.9;">I remember refreshing my ETH application portal every hour for three weeks. I was convinced I\'d missed something, filled something in wrong, that the system had somehow lost me. It hadn\'t — Swiss universities simply process slowly and communicate minimally. Here\'s what I wish I\'d known before I started.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">The Swiss University Landscape</h2>
<p>Switzerland has three tiers of higher education, and choosing the right one matters as much as choosing the right programme:</p>

<ul style="line-height:2.2;">
  <li><strong>Federal Institutes of Technology</strong> — <a href="https://www.ethz.ch" target="_blank" style="color:#1B3A6B;">ETH Zurich</a> and <a href="https://www.epfl.ch" target="_blank" style="color:#1B3A6B;">EPFL Lausanne</a> — globally top-10 for engineering, science, and technology. Highly competitive at Master\'s level. Tuition: ~CHF 730/semester for everyone (yes, really).</li>
  <li><strong>Cantonal Universities</strong> — University of Zurich, University of Bern, University of Geneva, University of Basel, etc. Excellent research universities with strong programmes in law, medicine, humanities, and social sciences.</li>
  <li><strong>Universities of Applied Sciences (Fachhochschulen)</strong> — Practice-oriented, often require work experience. Strong industry connections. Ideal if you want applied training over pure research.</li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;">Bachelor\'s Admission: The Hard Truth for Iranian Applicants</h2>
<p>Switzerland does not automatically recognise the Iranian high school diploma (<em>Diplom Metevaseteh</em>) for direct university entry. Your options:</p>

<ol style="line-height:2.2;">
  <li><strong>Entrance examination</strong> — ETH and EPFL hold their own entrance exams each spring (April/May). The exam tests mathematics, physics, and language (German at ETH, French at EPFL). It\'s rigorous. <a href="https://www.ethz.ch/en/studies/bachelor/admission/entrance-examination.html" target="_blank" style="color:#1B3A6B;">ETH entrance exam details</a></li>
  <li><strong>Complete one year at a recognised university</strong> — If you studied one year at an Iranian university with strong grades, you may be eligible for direct entry. The equivalency is assessed case by case.</li>
  <li><strong>Foundation year abroad</strong> — A preparatory year at a recognised European institution can serve as the bridge.</li>
</ol>

<h2 style="color:#1B3A6B;margin-top:2rem;">Master\'s Admission: Much More Straightforward</h2>
<p>Master\'s programmes are where most Iranian students successfully enter Swiss universities. Requirements are more standardised:</p>

<ul style="line-height:2.2;">
  <li><strong>Bachelor\'s degree</strong> in a relevant field — must be recognised. Iranian university degrees from major institutions (Sharif, Tehran, Amirkabir, etc.) are generally accepted, though equivalency is assessed individually</li>
  <li><strong>Strong GPA</strong> — ETH/EPFL expect a GPA equivalent to approximately 5.0/6.0 Swiss. Be honest with yourself about competitiveness.</li>
  <li><strong>English proficiency</strong> — TOEFL iBT 100+ or IELTS 7.0+ for most programmes. Some require higher.</li>
  <li><strong>Statement of purpose</strong> — Write specifically. Generic statements are filtered out immediately.</li>
  <li><strong>2–3 letters of recommendation</strong> — from professors who know your work, not just your face</li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;">Deadlines — Do Not Miss These</h2>
<ul style="line-height:2.2;">
  <li><strong>ETH Zurich</strong>: Applications open November 1, close December 15 for the following autumn semester. <a href="https://www.ethz.ch/en/studies/master/application.html" target="_blank" style="color:#1B3A6B;">Apply here</a></li>
  <li><strong>EPFL</strong>: Varies by programme, typically December 1 – January 15. <a href="https://www.epfl.ch/education/master/admission/" target="_blank" style="color:#1B3A6B;">Apply here</a></li>
  <li><strong>University of Zurich</strong>: April 30 for autumn semester. <a href="https://www.uzh.ch/en/studies/application.html" target="_blank" style="color:#1B3A6B;">Apply here</a></li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;">Scholarships Worth Applying For</h2>
<ul style="line-height:2.2;">
  <li><a href="https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html" target="_blank" style="color:#1B3A6B;"><strong>Swiss Government Excellence Scholarships</strong></a> — for postgraduate and research. Covers tuition + living costs. Competitive but open to Iranian nationals.</li>
  <li><a href="https://ethz.ch/en/studies/financial/scholarships.html" target="_blank" style="color:#1B3A6B;"><strong>ETH Excellence Scholarship</strong></a> — merit-based, CHF 12,000/semester + fee waiver</li>
  <li><a href="https://www.epfl.ch/education/master/financing-your-studies/" target="_blank" style="color:#1B3A6B;"><strong>EPFL Excellence Fellowships</strong></a></li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;">The Student Visa</h2>
<p>Iranian nationals must obtain a national visa (type D) before arriving. Apply at the Swiss Embassy in Tehran with your admission letter, proof of financial means (typically CHF 21,000/year minimum), accommodation confirmation, and health insurance proof. Processing takes <strong>6–10 weeks</strong>. Apply the moment your admission is confirmed — do not wait.</p>',
];

// ── POST 5 — Fines (FA) ───────────────────────────────────────────────────────
$posts[] = [
    'title'       => 'جریمه در سوئیس: آنچه باید بدانید پیش از آنکه دیر شود',
    'author_id'   => $authorIds['Neda Moradi'],
    'language'    => 'fa',
    'tags'        => 'legal',
    'city'        => null,
    'date'        => '2025-02-12 09:00:00',
    'cover_image' => 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=80',
    'content'     => '<p style="font-size:1.1rem;color:#374151;line-height:2;font-family:Vazirmatn,sans-serif;">دوستم اولین ماه زندگی‌اش در زوریخ، بدون بلیط سوار ترام شد. «فکر کردم کسی نمی‌بیند.» می‌بینند. ۱۰۰ فرانک. بلیط فقط ۴.۴۰ بود. این داستان کوچک، درس بزرگی در فلسفه حکمرانی سوئیس است: قوانین اینجا برای نمایش نیستند. اجرا می‌شوند.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">دو نوع جریمه</h2>

<h3 style="font-family:Vazirmatn,sans-serif;">⚡ Ordnungsbusse — جریمه فوری</h3>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">این جریمه‌ها برای تخلفات سبک صادر می‌شوند و <strong>همان لحظه</strong> توسط پلیس یا بازرس داده می‌شوند. مبلغ ثابت است — هیچ چانه‌زنی‌ای در کار نیست. نمونه‌ها:</p>
<ul style="line-height:2.2;font-family:Vazirmatn,sans-serif;">
  <li>🚋 <strong>سواری بدون بلیط در حمل‌ونقل عمومی:</strong> ۱۰۰ فرانک</li>
  <li>🚶 <strong>عبور عابر پیاده از چراغ قرمز:</strong> ۲۰ فرانک</li>
  <li>🚭 <strong>سیگار در مکان‌های ممنوعه:</strong> ۸۰ فرانک</li>
  <li>🗑️ <strong>دور انداختن زباله روی زمین:</strong> تا ۳۰۰ فرانک</li>
  <li>🅿️ <strong>پارک غیرمجاز:</strong> ۴۰ تا ۱۵۰ فرانک بسته به شهر</li>
</ul>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">پرداخت این جریمه‌ها را جدی بگیرید. تجمع جریمه‌های پرداخت‌نشده می‌تواند به پرونده حقوقی تبدیل شود.</p>

<h3 style="font-family:Vazirmatn,sans-serif;">📮 Strafbefehl — دستور کیفری رسمی</h3>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">برای تخلفات جدی‌تر — سرعت غیرمجاز، رانندگی تحت تأثیر الکل، تصادف — یک <em>Strafbefehl</em> از طریق پست برایتان ارسال می‌شود. این سند شامل:</p>
<ul style="line-height:2;font-family:Vazirmatn,sans-serif;">
  <li>شرح تخلف</li>
  <li>مبلغ جریمه نقدی</li>
  <li>احکام احتمالی: تعلیق گواهینامه، خدمات عمومی یا حتی حکم زندان برای موارد بسیار شدید</li>
</ul>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">شما <strong>۱۰ روز</strong> فرصت دارید اعتراض (Einsprache) کنید. اگر اعتراض نکنید، حکم قطعی و اجباری می‌شود. اگر اعتراض کنید، پرونده به دادگاه می‌رود — که ممکن است منجر به حکم سنگین‌تر یا سبک‌تر شود.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">جریمه‌های رانندگی: جدی‌ترین دسته</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">سوئیس با تخلفات سرعت بی‌رحمانه برخورد می‌کند. سیستم Via Sicura (از ۲۰۱۲) احکام اجباری و بدون تخفیف دارد:</p>
<ul style="line-height:2.2;font-family:Vazirmatn,sans-serif;">
  <li>۱۶+ کیلومتر بر ساعت بیش از حد مجاز داخل شهر: <strong>حداقل یک ماه تعلیق گواهینامه</strong></li>
  <li>۲۶+ خارج از شهر یا ۳۱+ در بزرگراه: حداقل دو ماه تعلیق</li>
  <li>بیش از ۵۰ داخل شهر یا ۶۰ خارج از شهر: ضبط خودرو، پرونده کیفری، و برچسب «راننده پرخطر» که سال‌ها در پرونده‌تان می‌ماند</li>
</ul>

<blockquote style="border-right:4px solid #C9A84C;padding-right:1.2rem;color:#6b7280;font-style:italic;margin:1.5rem 0;text-align:right;font-family:Vazirmatn,sans-serif;">
  «در سوئیس، ناآگاهی از قانون بهانه نیست. اما آگاهی از قانون، ابزار آزادی است.»
</blockquote>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">منابع رسمی</h2>
<ul style="line-height:2;font-family:Vazirmatn,sans-serif;">
  <li><a href="https://www.ch.ch/en/traffic-and-roads/fines-and-penalties/" target="_blank" style="color:#1B3A6B;">ch.ch — جریمه‌ها و مجازات‌ها</a></li>
  <li><a href="https://www.astra.admin.ch" target="_blank" style="color:#1B3A6B;">ASTRA — اداره فدرال جاده‌ها</a></li>
</ul>',
];

// ── POST 6 — Jobs (EN) ────────────────────────────────────────────────────────
$posts[] = [
    'title'       => 'Getting a Job in Switzerland When You\'re Not From the EU',
    'author_id'   => $authorIds['Arash Shirazi'],
    'language'    => 'en',
    'tags'        => 'survival guides',
    'city'        => null,
    'date'        => '2025-02-20 10:00:00',
    'cover_image' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
    'content'     => '<p style="font-size:1.1rem;color:#374151;line-height:1.9;">When I first started job hunting in Zurich as an Iranian national, I got two kinds of responses: immediate enthusiasm from tech companies that cared only about my skills, and polite silence from more traditional industries that clearly found the work permit paperwork daunting. Understanding which category your target employer falls into is the first step to a smart job search.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">How the Work Permit System Actually Works</h2>
<p>Switzerland maintains what is called the <strong>"three-circle model"</strong>: EU/EFTA citizens have near-unrestricted work rights; non-EU nationals (including Iranians) fall under a quota system with stricter requirements. Before a Swiss employer can hire you, they must demonstrate — through a formal process — that no suitable candidate from Switzerland or the EU could fill the role. This is the <em>Inländervorrang</em> (domestic priority) rule.</p>

<p>In practice, this means:</p>
<ul style="line-height:2.2;">
  <li>Your most competitive ground is in <strong>documented skill-shortage fields</strong>: software engineering, data science, machine learning, fintech, and specialised medicine</li>
  <li>The employer bears the administrative burden — they apply for your permit, not you</li>
  <li>Large international companies (Google, Microsoft, UBS, Nestlé, Novartis) have dedicated HR teams who do this routinely and are not deterred by the paperwork</li>
  <li>Smaller companies may shy away even if they love your profile — don\'t take it personally</li>
</ul>

<p><strong>Important exception:</strong> If you already hold a B or C permit, you are generally free to work without additional employer sponsorship. This changes the entire calculus.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">Where to Find Jobs</h2>
<ul style="line-height:2.2;">
  <li><a href="https://www.jobs.ch" target="_blank" style="color:#1B3A6B;"><strong>Jobs.ch</strong></a> — Switzerland\'s largest job board, strong across all sectors</li>
  <li><a href="https://www.jobup.ch" target="_blank" style="color:#1B3A6B;"><strong>Jobup.ch</strong></a> — dominant in French-speaking Switzerland (Geneva, Lausanne)</li>
  <li><strong>LinkedIn</strong> — Non-negotiable. Swiss recruiters use it intensively. A complete, professional profile is your digital business card.</li>
  <li><strong>Company career pages directly</strong> — Many Swiss companies never list jobs publicly. Check Novartis, Roche, ABB, UBS, Credit Suisse (now UBS), Google Zurich, Amazon, and others directly</li>
  <li><a href="https://www.arbeit.swiss" target="_blank" style="color:#1B3A6B;"><strong>Arbeit.swiss</strong></a> — Federal employment service</li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;">The Swiss CV</h2>
<p>A Swiss CV is different from what you may be used to:</p>
<ul style="line-height:2.2;">
  <li><strong>Maximum 2 pages</strong> — ruthlessly edit</li>
  <li><strong>Professional photo</strong> — standard in Switzerland, unlike in the US or UK</li>
  <li><strong>Reverse chronological order</strong></li>
  <li><strong>Language section</strong> — Swiss employers care intensely about this. Be precise: "B2 German", "Native Farsi", "C1 English"</li>
  <li><strong>References available on request</strong> — or include contact details of 2 referees directly</li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;">Salary Expectations (Zurich, 2024)</h2>
<p>Switzerland offers some of the world\'s highest salaries — and costs to match. Gross annual salaries as a rough benchmark:</p>
<ul style="line-height:2.2;">
  <li>Junior software engineer: CHF 90,000–115,000</li>
  <li>Senior software engineer / tech lead: CHF 130,000–180,000</li>
  <li>Data scientist (3+ years): CHF 110,000–155,000</li>
  <li>Financial analyst (banking): CHF 100,000–140,000</li>
</ul>
<p>Deduct approximately 20–25% for social security (AHV), pension (BVG), unemployment insurance, and cantonal tax at source. Net salaries are still very high by global standards.</p>

<blockquote style="border-left:4px solid #C9A84C;padding-left:1.2rem;color:#6b7280;font-style:italic;margin:1.5rem 0;">
  "The Swiss job market rewards specificity. Know exactly what you do, why you\'re excellent at it, and which companies need that specific thing. Generalists have a harder time; specialists with a niche have it surprisingly well."
</blockquote>

<h2 style="color:#1B3A6B;margin-top:2rem;">Official Resources</h2>
<ul style="line-height:2;">
  <li><a href="https://www.sem.admin.ch/sem/en/home/themen/arbeit/nicht-eu_efta.html" target="_blank" style="color:#1B3A6B;">SEM — Work authorisation for non-EU/EFTA nationals</a></li>
  <li><a href="https://www.lohncheck.ch" target="_blank" style="color:#1B3A6B;">Lohncheck.ch — Swiss salary benchmarks</a></li>
</ul>',
];

// ── POST 7 — Passport Renewal (FA) ───────────────────────────────────────────
$posts[] = [
    'title'       => 'تمدید پاسپورت ایرانی در سوئیس: تجربه شخصی و راهنمای کامل',
    'author_id'   => $authorIds['Zahra Hosseini'],
    'language'    => 'fa',
    'tags'        => 'legal',
    'city'        => 'Bern',
    'date'        => '2025-03-01 09:00:00',
    'cover_image' => 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=900&q=80',
    'content'     => '<p style="font-size:1.1rem;color:#374151;line-height:2;font-family:Vazirmatn,sans-serif;">پاسپورتم داشت منقضی می‌شد. سه ماه فرصت داشتم ولی ماه‌ها طول کشید تا وقت بگیرم. اگر این مقاله را زودتر خوانده بودم، این همه استرس نداشتم. بگذارید آنچه یاد گرفتم را با شما در میان بگذارم.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">کجا باید مراجعه کنم؟</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">تنها مرجع صالح برای تمدید پاسپورت ایرانی در سوئیس، <strong>سفارت جمهوری اسلامی ایران در برن</strong> است. اگر در ژنو، بازل یا زوریخ هستید، باید به برن بروید — سفارت شعبه ندارد.</p>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">وب‌سایت رسمی: <a href="http://bern.mfa.ir" target="_blank" style="color:#1B3A6B;">bern.mfa.ir</a></p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">مراحل گام به گام</h2>

<h3 style="font-family:Vazirmatn,sans-serif;">۱. وقت بگیرید (الزامی)</h3>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">سفارت بدون وقت قبلی مراجعه نمی‌پذیرد. وقت‌ها از طریق وب‌سایت یا تلفن داده می‌شود. <strong>زود اقدام کنید</strong> — وقت‌ها گاهی چند هفته جلوتر پر هستند.</p>

<h3 style="font-family:Vazirmatn,sans-serif;">۲. مدارک را آماده کنید</h3>
<ul style="line-height:2.2;font-family:Vazirmatn,sans-serif;">
  <li>پاسپورت قدیمی (اصل + کپی از صفحه مشخصات)</li>
  <li>شناسنامه (اصل + کپی)</li>
  <li>کارت ملی ایرانی در صورت داشتن (اصل + کپی)</li>
  <li>اجازه اقامت سوئیسی — Aufenthaltsbewilligung (اصل + کپی)</li>
  <li>عکس پاسپورتی: زمینه سفید، بدون عینک — معمولاً ۴ قطعه</li>
  <li>فرم درخواست تکمیل‌شده (از وب‌سایت سفارت دانلود کنید)</li>
  <li>هزینه خدمات — نقد یا روش اعلام‌شده توسط سفارت</li>
</ul>

<h3 style="font-family:Vazirmatn,sans-serif;">۳. روز مراجعه</h3>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">سر وقت باشید. مدارک را کامل بیاورید — نقص مدارک یعنی بازگشت و وقت جدید. پیشنهاد می‌کنم یک ست کپی اضافه هم همراه داشته باشید.</p>

<h3 style="font-family:Vazirmatn,sans-serif;">۴. دریافت پاسپورت</h3>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">پاسپورت جدید معمولاً <strong>۴ تا ۸ هفته</strong> بعد آماده می‌شود. سفارت معمولاً از طریق تلفن یا ایمیل اطلاع می‌دهد. امکان دریافت از طریق پست پیشنهادی (EMS) نیز ممکن است وجود داشته باشد.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">نکات ویژه برای آقایان</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">اگر وضعیت سربازی شما تعیین‌تکلیف نشده، ممکن است محدودیت در صدور پاسپورت وجود داشته باشد. این موضوع را قبل از مراجعه با سفارت مطرح کنید تا با اطلاع کامل تصمیم بگیرید.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">وکالت‌نامه از طریق سفارت</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">اگر برای امور ملکی، ارثی یا حقوقی در ایران به وکالت‌نامه نیاز دارید، سفارت این خدمت را ارائه می‌دهد. وکالت‌نامه باید بعد از تأیید سفارت، آپوستیل (Apostille) نیز بشود — که از طریق اداره فدرال سوئیس قابل انجام است.</p>

<blockquote style="border-right:4px solid #C9A84C;padding-right:1.2rem;color:#6b7280;font-style:italic;margin:1.5rem 0;text-align:right;font-family:Vazirmatn,sans-serif;">
  «پاسپورت ایرانی سند هویت شماست. مراقبش باشید، زود تجدیدش کنید، و هرگز بگذارید منقضی شود در خارج از کشور.»
</blockquote>',
];

// ── POST 8 — Bank Account (EN) ────────────────────────────────────────────────
$posts[] = [
    'title'       => 'Opening a Bank Account in Switzerland: Practical and Honest',
    'author_id'   => $authorIds['Hamid Taheri'],
    'language'    => 'en',
    'tags'        => 'survival guides',
    'city'        => null,
    'date'        => '2025-03-10 10:00:00',
    'cover_image' => 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=900&q=80',
    'content'     => '<p style="font-size:1.1rem;color:#374151;line-height:1.9;">Opening a bank account in Switzerland is one of those tasks that sounds simple and occasionally isn\'t. The country that invented private banking can be surprisingly bureaucratic when it comes to basic current accounts for newcomers. Here\'s what you actually need to know.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">What You Need (Minimum)</h2>
<ul style="line-height:2.2;">
  <li><strong>Valid passport</strong></li>
  <li><strong>Swiss residence permit</strong> (even a temporary one is usually sufficient)</li>
  <li><strong>Proof of address</strong> — your rental contract or a utility bill in your name</li>
</ul>
<p>Some banks will also ask for proof of employment or your admission letter. If you\'re very newly arrived and have none of these yet, <strong>PostFinance</strong> is typically the most accessible option.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">Choosing Your Bank</h2>

<h3 style="color:#374151;">🟦 PostFinance — Best for Newcomers</h3>
<p>Run by the Swiss postal service, PostFinance is the most accessible bank for foreign nationals. No minimum balance, solid English support, and branches in every city. A basic account costs CHF 5/month. <a href="https://www.postfinance.ch/en/private/products/accounts/private-account.html" target="_blank" style="color:#1B3A6B;">Open online here</a></p>

<h3 style="color:#374151;">🟥 UBS — Largest, Most International</h3>
<p>UBS (now also incorporating Credit Suisse) has branches across Switzerland and strong English-language support. Fees are slightly higher (~CHF 8/month), but the app is excellent and the international transfer capabilities are best-in-class.</p>

<h3 style="color:#374151;">🟨 Cantonal Banks (ZKB, BCG, etc.)</h3>
<p>State-backed and extremely secure. The <a href="https://www.zkb.ch" target="_blank" style="color:#1B3A6B;">Zürcher Kantonalbank (ZKB)</a> is one of the most trusted financial institutions in Switzerland. Good for long-term residents who want stability.</p>

<h3 style="color:#374151;">📱 Neon / Yuh — Digital, Zero Fees</h3>
<p><a href="https://www.neon-free.ch" target="_blank" style="color:#1B3A6B;">Neon</a> and <a href="https://www.yuh.com" target="_blank" style="color:#1B3A6B;">Yuh</a> are Swiss digital banks with no monthly fees and slick apps. Great for day-to-day spending. <strong>Important caveat</strong>: some landlords refuse to accept rent payments from digital-only banks. Use a traditional bank for rent, a digital one for daily life.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">Swiss Payment Culture</h2>
<p>Switzerland runs on bank transfers, not cash or direct debits as primary methods. Key things to know:</p>
<ul style="line-height:2.2;">
  <li><strong>IBAN</strong> — all Swiss transfers use IBAN. Share yours freely for salary, freelance payments, and reimbursements.</li>
  <li><strong>QR bills</strong> — since 2022, all Swiss invoices come with a QR code you scan in your e-banking app to pay. No typing, no errors.</li>
  <li><strong>TWINT</strong> — Switzerland\'s mobile payment system. Linked directly to your bank account. Used everywhere from farmer\'s markets to restaurant splits to parking. Download it week one.</li>
  <li><strong>E-banking</strong> — set it up immediately. You\'ll do virtually everything through it.</li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;">Sending Money Abroad</h2>
<p>Standard bank transfers to Iran are not possible through Swiss banks due to international sanctions. For legal international transfers within the SWIFT system, Swiss banks work normally to most countries. For community-specific needs, always use <strong>FINMA-licensed money transfer services</strong> only — verify the licence at <a href="https://www.finma.ch/en/authorisation/search-for-authorised-institutions/" target="_blank" style="color:#1B3A6B;">finma.ch</a>. Unlicensed channels expose you to legal and financial risk.</p>

<blockquote style="border-left:4px solid #C9A84C;padding-left:1.2rem;color:#6b7280;font-style:italic;margin:1.5rem 0;">
  "Set up e-banking and TWINT in your first week. Swiss financial life runs through these two channels — everything else is secondary."
</blockquote>',
];

// ── POST 9 — Commune Registration (FA) ───────────────────────────────────────
$posts[] = [
    'title'       => 'ثبت‌نام در شهرداری: اولین کاری که باید در سوئیس انجام دهید',
    'author_id'   => $authorIds['Helma Karimi'],
    'language'    => 'fa',
    'tags'        => 'legal,survival guides',
    'city'        => null,
    'date'        => '2025-03-18 09:00:00',
    'cover_image' => 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?w=900&q=80',
    'content'     => '<p style="font-size:1.1rem;color:#374151;line-height:2;font-family:Vazirmatn,sans-serif;">وقتی از فرودگاه زوریخ بیرون آمدم، کوله‌پشتی روی دوشم و آدرس خانه‌ام در گوشی‌ام بود. فکر می‌کردم بزرگ‌ترین چالشم یافتن آن آدرس است. اشتباه می‌کردم — بزرگ‌ترین چالشم ثبت‌نام در شهرداری ظرف ۱۴ روز بود، در حالی که هنوز از جت‌لگ درنیامده بودم.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">چرا ۱۴ روز؟</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">قانون سوئیس مقرر می‌کند که هر کس محل اقامتش را تغییر می‌دهد — چه ورود از خارج، چه جابجایی داخلی — باید ظرف <strong>۱۴ روز</strong> آن را به دفتر ثبت ساکنین (<em>Einwohnerkontrolle</em> یا <em>Einwohnerdienste</em>) اطلاع دهد. این فرمالیته نیست — پایه تمام اقدامات بعدی است:</p>
<ul style="line-height:2;font-family:Vazirmatn,sans-serif;">
  <li>بدون ثبت‌نام، اجازه اقامت صادر نمی‌شود</li>
  <li>بدون اجازه اقامت، حساب بانکی باز نمی‌شود</li>
  <li>بدون حساب بانکی، بیمه درمانی نمی‌توانید پرداخت کنید</li>
  <li>و همین‌طور الی‌آخر</li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">مدارک لازم</h2>
<ul style="line-height:2.2;font-family:Vazirmatn,sans-serif;">
  <li>✅ <strong>پاسپورت معتبر</strong> — اصل، نه کپی</li>
  <li>✅ <strong>ویزای ورودی</strong> یا مجوز اقامت اولیه‌تان</li>
  <li>✅ <strong>قرارداد اجاره</strong> (Mietvertrag) — یا نامه تأیید آدرس از صاحب‌خانه</li>
  <li>✅ <strong>قرارداد کاری یا نامه پذیرش دانشگاه</strong> — بسته به دلیل اقامتتان</li>
  <li>✅ <strong>عکس پاسپورتی</strong> — بعضی دفاتر لازم دارند</li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">فرآیند گام به گام</h2>
<ol style="line-height:2.2;font-family:Vazirmatn,sans-serif;">
  <li>وب‌سایت شهرداری (Gemeinde) محل اقامتتان را پیدا کنید — مثلاً برای زوریخ: <a href="https://www.stadt-zuerich.ch" target="_blank" style="color:#1B3A6B;">stadt-zuerich.ch</a></li>
  <li>وقت آنلاین (Termin) بگیرید — در شهرهای بزرگ ضروری است</li>
  <li>با مدارک کامل مراجعه کنید</li>
  <li>فرم ثبت‌نام را تکمیل کنید — معمولاً به آلمانی اما کارمندان معمولاً انگلیسی هم می‌دانند</li>
  <li>هزینه اداری پرداخت کنید — حدود ۲۰ تا ۵۰ فرانک</li>
</ol>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">بعد از ثبت‌نام چه می‌شود؟</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">شهرداری اطلاعات شما را به <em>Migrationsamt</em> (اداره مهاجرت کانتون) ارسال می‌کند. آن‌ها اجازه اقامت شما را پردازش می‌کنند. کارت اقامت معمولاً <strong>۴ تا ۸ هفته بعد</strong> از طریق پست یا حضوری دریافت می‌شود.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">تغییر آدرس بعداً</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">هر بار که در سوئیس نقل مکان می‌کنید — حتی به خیابان بغلی — باید آدرس جدید را اعلام کنید. در اکثر شهرهای بزرگ این کار آنلاین قابل انجام است. به کانتون قبلی هم باید اطلاع دهید که دارید می‌روید (Abmeldung).</p>

<blockquote style="border-right:4px solid #C9A84C;padding-right:1.2rem;color:#6b7280;font-style:italic;margin:1.5rem 0;text-align:right;font-family:Vazirmatn,sans-serif;">
  «در سوئیس، ادارات همدیگر را می‌شناسند و اطلاعات رد و بدل می‌کنند. کاغذبازی‌هایی که در ابتدا خسته‌کننده به نظر می‌رسند، بعداً زندگی را بسیار ساده‌تر می‌کنند.»
</blockquote>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">منابع</h2>
<ul style="line-height:2;font-family:Vazirmatn,sans-serif;">
  <li><a href="https://www.ch.ch/en/registration-move/" target="_blank" style="color:#1B3A6B;">ch.ch — ثبت‌نام و تغییر آدرس</a></li>
</ul>',
];

// ── POST 10 — Transport (EN) ──────────────────────────────────────────────────
$posts[] = [
    'title'       => 'Mastering Swiss Public Transport: GA, Halbtax, and the SBB App',
    'author_id'   => $authorIds['Reza Ahmadi'],
    'language'    => 'en',
    'tags'        => 'survival guides',
    'city'        => null,
    'date'        => '2025-03-28 10:00:00',
    'cover_image' => 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=900&q=80',
    'content'     => '<p style="font-size:1.1rem;color:#374151;line-height:1.9;">The first time a Swiss train was 3 minutes late, the man next to me looked genuinely distressed. That\'s Switzerland\'s public transport system in a nutshell: it runs with a precision that recalibrates your expectations permanently. Once you understand how to use it well, you\'ll wonder why anywhere else even tries.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">The Two Passes That Matter</h2>

<h3 style="color:#374151;">🎫 Halbtax — The Obvious First Purchase</h3>
<p>The <strong>Halbtax</strong> (half-fare card) costs CHF 185/year and gives you 50% off nearly all public transport in Switzerland: trains, trams, buses, boats, even many cable cars. The math is simple: if you spend more than CHF 370/year on transport (roughly 2 trips from Zurich to Geneva), it pays for itself. Buy it on your first week. <a href="https://www.sbb.ch/en/travelcards-and-tickets/railpasses/half-fare-travelcard.html" target="_blank" style="color:#1B3A6B;">Get it at SBB.ch</a></p>

<h3 style="color:#374151;">🎟️ GA (General Abonnement) — Unlimited Everything</h3>
<p>The <strong>GA</strong> gives you unlimited travel on virtually all public transport in Switzerland — trains, trams, buses, most boats. 2nd class costs CHF 3,860/year (2024). Monthly payment option available. If you commute daily between cities or travel frequently on weekends, the GA pays off and transforms how freely you move. <a href="https://www.sbb.ch/en/travelcards-and-tickets/railpasses/general-travelcard.html" target="_blank" style="color:#1B3A6B;">GA details</a></p>

<h2 style="color:#1B3A6B;margin-top:2rem;">The SBB App — Install Before Anything Else</h2>
<p>The <a href="https://www.sbb.ch/en/buying-options/apps/sbb-mobile.html" target="_blank" style="color:#1B3A6B;"><strong>SBB Mobile app</strong></a> is the backbone of transport life in Switzerland. It does everything:</p>
<ul style="line-height:2.2;">
  <li>Real-time timetables with connections and platform changes</li>
  <li>Buy tickets (including day passes and city subscriptions)</li>
  <li>Store your Halbtax or GA digitally</li>
  <li>Receive delay notifications proactively</li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;">City Transport Zones</h2>
<p>Cities use zone-based pricing. In Zurich, the network is run by <a href="https://www.zvv.ch/en" target="_blank" style="color:#1B3A6B;"><strong>ZVV</strong></a>. A single tram or bus trip within the city centre (zone 110) costs CHF 2.70 (short) or CHF 4.40 (full zone). Always validate before boarding — inspectors work plainclothes and the fine is CHF 100, no exceptions.</p>

<p>ZVV monthly subscriptions are worthwhile if you use trams/buses daily without a GA. Check the <a href="https://www.zvv.ch" target="_blank" style="color:#1B3A6B;">ZVV website</a> for current zone pass prices.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">Useful Details Nobody Tells You</h2>
<ul style="line-height:2.2;">
  <li><strong>Trains almost never stop for more than 2 minutes</strong> at any station. Board quickly. The door-close signal is a firm commitment.</li>
  <li><strong>Bikes need their own ticket</strong> on trains, but are free on most trams and buses. Check the SBB app for bike-friendly connections.</li>
  <li><strong>Night transport</strong>: in Zurich, the S-Bahn and trams run until midnight, then night buses (Nachtbus) take over on Friday and Saturday nights.</li>
  <li><strong>TWINT</strong> works at many ticket machines and is the fastest way to buy a quick ticket if you don\'t have the app open.</li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;">Official Resources</h2>
<ul style="line-height:2;">
  <li><a href="https://www.sbb.ch/en" target="_blank" style="color:#1B3A6B;">SBB — Swiss Federal Railways</a></li>
  <li><a href="https://www.zvv.ch/en" target="_blank" style="color:#1B3A6B;">ZVV — Zurich transport authority</a></li>
  <li><a href="https://www.tpg.ch" target="_blank" style="color:#1B3A6B;">TPG — Geneva public transport</a></li>
</ul>',
];

// ── POST 11 — Taxes (FA) ──────────────────────────────────────────────────────
$posts[] = [
    'title'       => 'مالیات در سوئیس: راهنمای صادقانه برای کسی که تازه وارد شده',
    'author_id'   => $authorIds['Arash Shirazi'],
    'language'    => 'fa',
    'tags'        => 'legal',
    'city'        => null,
    'date'        => '2025-04-05 09:00:00',
    'cover_image' => 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80',
    'content'     => '<p style="font-size:1.1rem;color:#374151;line-height:2;font-family:Vazirmatn,sans-serif;">اولین فیش حقوقی‌ام را که دیدم، فکر کردم اشتباهی رخ داده. رقمی که قرار بود دریافت کنم با آنچه کارفرما وعده داده بود تفاوت داشت. بعد فهمیدم — مالیات کسر از منبع. در سوئیس، حقوق ناخالص (gross) با خالص (net) فاصله معناداری دارند. بیایید این فاصله را با هم درک کنیم.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">سه لایه مالیات</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">سوئیس سه سطح مالیات دارد که روی هم جمع می‌شوند:</p>
<ul style="line-height:2.2;font-family:Vazirmatn,sans-serif;">
  <li><strong>مالیات فدرال</strong> — نرخ پایین، برای همه یکسان</li>
  <li><strong>مالیات کانتونی</strong> — اینجاست که تفاوت‌های بزرگ وجود دارد</li>
  <li><strong>مالیات شهرداری</strong> — درصدی از مالیات کانتونی</li>
</ul>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">به همین دلیل، دو نفر با درآمد یکسان که در کانتون‌های متفاوت زندگی می‌کنند، مالیات بسیار متفاوتی می‌پردازند. کانتون زوگ (Zug) یکی از پایین‌ترین نرخ‌های مالیاتی اروپا را دارد؛ کانتون ژنو یکی از بالاترین‌ها.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">مالیات کسر از منبع (Quellensteuer)</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">اگر دارنده اجازه اقامت B یا L هستید، مالیات مستقیماً از حقوق شما کسر می‌شود — مثل بسیاری از کشورها. نرخ بسته به درآمد، وضعیت خانوادگی، کانتون و شهرتان متفاوت است و کارفرما آن را محاسبه و به دولت واریز می‌کند. شما <strong>نیازی به تقدیم اظهارنامه مستقل ندارید</strong> — مگر اینکه:</p>
<ul style="line-height:2;font-family:Vazirmatn,sans-serif;">
  <li>درآمد فرعی دارید (freelance، اجاره ملک، و غیره)</li>
  <li>می‌خواهید کسورات اضافی مثل هزینه رفت‌وآمد یا آموزش را کسر کنید</li>
  <li>کارفرمایتان نرخ اشتباهی اعمال کرده و می‌خواهید اصلاح کنید</li>
</ul>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">اظهارنامه مالیاتی (Steuererklärung)</h2>
<p style="line-height:2;font-family:Vazirmatn,sans-serif;">دارندگان اجازه C و شهروندان سوئیسی <strong>موظف به تقدیم اظهارنامه سالانه</strong> هستند. اظهارنامه معمولاً تا اواخر مارس یا اوایل آوریل سال بعد باید تقدیم شود. در اکثر کانتون‌ها آنلاین انجام می‌شود.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">کسورات مالیاتی که نباید از دست بدهید</h2>
<ul style="line-height:2.2;font-family:Vazirmatn,sans-serif;">
  <li>🚆 <strong>هزینه رفت‌وآمد</strong> — بلیط حمل‌ونقل عمومی یا هزینه استفاده از خودرو شخصی (تا سقف مشخص)</li>
  <li>📚 <strong>هزینه‌های آموزشی حرفه‌ای</strong> — دوره‌ها، کتاب‌ها، کنفرانس‌ها</li>
  <li>🏥 <strong>هزینه درمانی پرداختی از جیب</strong> — بالاتر از سقف معین</li>
  <li>💰 <strong>صندوق بازنشستگی Pillar 3a</strong> — تا <strong>۷,۰۵۶ فرانک در سال</strong> (۲۰۲۴) از درآمد مشمول مالیات کسر می‌شود. این یکی از بهترین ابزارهای کاهش مالیات قانونی است.</li>
  <li>👶 <strong>هزینه مراقبت از فرزند</strong> — اگر کودک زیر ۱۴ سال دارید</li>
</ul>

<blockquote style="border-right:4px solid #C9A84C;padding-right:1.2rem;color:#6b7280;font-style:italic;margin:1.5rem 0;text-align:right;font-family:Vazirmatn,sans-serif;">
  «در سوئیس، مالیات بخشی طبیعی از زندگی است — نه دشمن. با یاد گرفتن کسورات قانونی، می‌توانید مالیات کمتری بپردازید بدون اینکه یک قانون را زیر پا بگذارید.»
</blockquote>

<h2 style="color:#1B3A6B;margin-top:2rem;font-family:Vazirmatn,sans-serif;">منابع رسمی</h2>
<ul style="line-height:2;font-family:Vazirmatn,sans-serif;">
  <li><a href="https://swisstaxcalculator.estv.admin.ch" target="_blank" style="color:#1B3A6B;">ماشین‌حساب مالیاتی رسمی فدرال</a></li>
  <li><a href="https://www.estv.admin.ch" target="_blank" style="color:#1B3A6B;">اداره فدرال مالیات (ESTV)</a></li>
  <li><a href="https://www.ch.ch/en/taxes/" target="_blank" style="color:#1B3A6B;">ch.ch — مالیات در سوئیس</a></li>
</ul>
<p style="font-size:0.85rem;color:#9ca3af;margin-top:1rem;">⚠️ این مقاله اطلاعات عمومی است. برای مشاوره مالیاتی شخصی، با یک حسابدار رسمی سوئیس مشورت کنید.</p>',
];

// ── POST 12 — Driving Licence (EN) ────────────────────────────────────────────
$posts[] = [
    'title'       => 'Converting Your Iranian Driving Licence in Switzerland: The Full Process',
    'author_id'   => $authorIds['Neda Moradi'],
    'language'    => 'en',
    'tags'        => 'legal',
    'city'        => null,
    'date'        => '2025-04-15 10:00:00',
    'cover_image' => 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=900&q=80',
    'content'     => '<p style="font-size:1.1rem;color:#374151;line-height:1.9;">I drove for twelve years in Iran before moving to Switzerland. I arrived confident. Within eight months, I was sitting in a driving school for the first time since I was nineteen, clutching a Swiss theory test booklet. The process humbled me — and ultimately made me a better driver. Here\'s everything you need to know before you start.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">The First 12 Months: Grace Period</h2>
<p>Swiss law allows you to drive on your valid foreign licence for <strong>12 months from the date of registration</strong> as a Swiss resident. After that, you must have a Swiss licence. Driving on a foreign licence beyond this window is a legal violation — treated like driving without a licence.</p>
<p><strong>Practical tip:</strong> start the conversion process at month 6, not month 11. The process takes time.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">Why You Can\'t Simply Exchange It</h2>
<p>Switzerland has bilateral agreements with many countries allowing direct exchange without testing — EU member states, the US, Canada, Australia, Japan, among others. <strong>Iran is not on this list.</strong> This means Iranian licence holders must go through the full Swiss licencing process. The upside: your years of driving experience are genuinely recognised — most driving schools significantly reduce the required number of lessons for experienced foreign drivers.</p>

<h2 style="color:#1B3A6B;margin-top:2rem;">The Full Process, Step by Step</h2>

<h3 style="color:#374151;">Step 1: Apply for a Learner\'s Licence (Lernfahrausweis)</h3>
<p>Visit your cantonal road traffic office (<em>Strassenverkehrsamt</em> or <em>SVA</em>) with your passport, residence permit, and current foreign licence. They issue a learner\'s permit that allows you to practise with a qualified instructor or a licensed adult. <strong>Cost: ~CHF 40–60</strong></p>

<h3 style="color:#374151;">Step 2: First Aid Course (Nothelferkurs)</h3>
<p>A mandatory 10-hour first aid course, offered by the Red Cross and many other organisations. Not optional. <strong>Cost: ~CHF 120–180.</strong> Book early — courses fill up.</p>

<h3 style="color:#374151;">Step 3: Theory Test (Theorieprüfung)</h3>
<p>A 45-question multiple-choice test on Swiss road rules, signs, and driving behaviour. You can take it at the <em>Strassenverkehrsamt</em> or at authorised test centres. Study material (available in English, German, French, Italian) at <a href="https://www.theorie24.ch" target="_blank" style="color:#1B3A6B;">theorie24.ch</a>. The test is harder than it sounds — road signs and right-of-way rules in Switzerland have specific nuances. <strong>Cost: ~CHF 50</strong></p>

<h3 style="color:#374151;">Step 4: Driving Lessons</h3>
<p>Take lessons with a certified Swiss driving instructor. Tell them upfront that you have extensive driving experience — they should assess you honestly and recommend a realistic number of lessons rather than selling you a package. Most experienced foreign drivers need 5–12 lessons. <strong>Cost per lesson: ~CHF 100–130</strong></p>

<h3 style="color:#374151;">Step 5: WAB Practical Safety Lesson</h3>
<p>A mandatory 2x2 hour group lesson covering motorway driving, night driving, and driving in poor conditions. Required before the practical test. <strong>Cost: ~CHF 220–350</strong></p>

<h3 style="color:#374151;">Step 6: Practical Driving Test (Fahrprüfung)</h3>
<p>45 minutes with an examiner. They assess safety, precision, and situational awareness. Switzerland\'s standard is genuinely high — examiners expect smooth, anticipatory driving. <strong>Cost: ~CHF 180–220</strong></p>

<h2 style="color:#1B3A6B;margin-top:2rem;">The Probation Period</h2>
<p>New Swiss licences come with a <strong>3-year probation period</strong>, regardless of your prior experience. During this time, two serious violations can result in licence withdrawal and an obligation to repeat the entire process. Drive carefully — Swiss enforcement is systematic and consistent.</p>

<blockquote style="border-left:4px solid #C9A84C;padding-left:1.2rem;color:#6b7280;font-style:italic;margin:1.5rem 0;">
  "Swiss roads are orderly because Swiss drivers expect them to be. Once you drive here long enough, the standards become second nature — and driving elsewhere starts to feel chaotic."
</blockquote>

<h2 style="color:#1B3A6B;margin-top:2rem;">Official Resources</h2>
<ul style="line-height:2;">
  <li><a href="https://www.ch.ch/en/driving-licence/" target="_blank" style="color:#1B3A6B;">ch.ch — Driving licences in Switzerland</a></li>
  <li><a href="https://www.asa.ch/en" target="_blank" style="color:#1B3A6B;">ASA — Association of cantonal road traffic offices</a></li>
  <li><a href="https://www.theorie24.ch" target="_blank" style="color:#1B3A6B;">Theorie24.ch — Theory test preparation</a></li>
</ul>',
];

echo "<h2>Blog Seeder Running...</h2>";
foreach ($posts as $p) {
    insertPost($pdo, $p);
}
echo "<br><strong style='color:green;'>✓ Done.</strong> Please delete this file now: <code>api/seeder_blog.php</code>";
