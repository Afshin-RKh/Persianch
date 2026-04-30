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

// ── Users ─────────────────────────────────────────────────────────────────────
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
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (:name, :email, :hash, :role, 1)");
        $stmt->execute([':name' => $u['name'], ':email' => $u['email'], ':hash' => $hash, ':role' => $u['role']]);
        $authorIds[$u['name']] = (int)$pdo->lastInsertId();
    }
}

// ── Helper ────────────────────────────────────────────────────────────────────
function insertPost(PDO $pdo, array $p): void {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $p['title'])));
    $ex = $pdo->prepare("SELECT id FROM blog_posts WHERE slug = :slug");
    $ex->execute([':slug' => $slug]);
    if ($ex->fetch()) { echo "SKIP (exists): $slug<br>"; return; }

    $pdo->prepare(
        "INSERT INTO blog_posts (title, slug, content, author_id, status, published, tags, country, city, language, created_at)
         VALUES (:title, :slug, :content, :author_id, 'approved', 1, :tags, :country, :city, :language, :created_at)"
    )->execute([
        ':title'      => $p['title'],
        ':slug'       => $slug,
        ':content'    => $p['content'],
        ':author_id'  => $p['author_id'],
        ':tags'       => $p['tags'] ?? null,
        ':country'    => 'Switzerland',
        ':city'       => $p['city'] ?? null,
        ':language'   => $p['language'],
        ':created_at' => $p['date'],
    ]);
    echo "CREATED: $slug<br>";
}

// ── Posts ─────────────────────────────────────────────────────────────────────
$posts = [];

// ── POST 1 ────────────────────────────────────────────────────────────────────
$posts[] = [
    'title'     => 'Residence Permits in Switzerland: A Complete Guide for Iranians',
    'author_id' => $authorIds['Reza Ahmadi'],
    'language'  => 'en',
    'tags'      => 'legal',
    'city'      => null,
    'date'      => '2025-01-10 09:00:00',
    'content'   => '<h2>Understanding Swiss Residence Permits</h2>
<p>If you are an Iranian national moving to Switzerland, one of your first priorities will be understanding the residence permit system. Switzerland has several permit categories, and the one you receive depends on your reason for staying and the length of your stay.</p>

<h3>The Main Permit Types</h3>
<ul>
  <li><strong>L Permit (Short-term residence)</strong> – Valid for stays under one year, typically tied to a fixed-term work contract or language course. Not automatically renewable.</li>
  <li><strong>B Permit (Annual residence)</strong> – The most common permit for newly arrived foreigners with a job offer, family reunification, or study. Renewed annually, then every two years once established.</li>
  <li><strong>C Permit (Settlement permit)</strong> – Permanent residence. Granted after 5 years of uninterrupted residence for EU/EFTA nationals, and after 10 years for others including Iranians. Requires integration criteria to be met.</li>
  <li><strong>G Permit (Cross-border commuter)</strong> – For people who live in a neighbouring country (France, Germany, Austria, Italy) and work in Switzerland, returning home at least once a week.</li>
</ul>

<h3>How to Apply</h3>
<p>Once you arrive in Switzerland with a valid entry visa, you must register at your local <em>Einwohnerkontrolle</em> (residents\' registration office) within 14 days. Bring your passport, rental contract, and visa. They will issue your residence permit or hand you instructions to collect it.</p>
<p>The permit application itself is handled by the cantonal migration office (<em>Migrationsamt</em>). Your employer or university often assists with this process. Required documents typically include:</p>
<ul>
  <li>Valid passport</li>
  <li>Employment contract or university admission letter</li>
  <li>Proof of accommodation (rental contract)</li>
  <li>Biometric photos</li>
  <li>Application form (provided by the cantonal office)</li>
</ul>

<h3>Switching Permit Categories</h3>
<p>You can switch from a student B permit to a work B permit after graduating, provided you find employment within six months of graduation. This is a significant advantage of studying in Switzerland.</p>

<h3>Important Notes</h3>
<p>Permits are <strong>cantonal</strong>, meaning they are tied to the canton where you registered. If you move to another canton, you must re-register within 14 days and your permit will be transferred.</p>
<p>⚠️ <em>This article provides general guidance only. Permit rules can change and vary by canton. Always verify with the official Swiss State Secretariat for Migration.</em></p>

<h3>Official Resources</h3>
<ul>
  <li><a href="https://www.sem.admin.ch/sem/en/home/themen/aufenthalt/nicht-eu_efta/ausweis_b_jahresaufenthalt.html" target="_blank">SEM – B Permit (Annual residence)</a></li>
  <li><a href="https://www.sem.admin.ch/sem/en/home/themen/aufenthalt/nicht-eu_efta/ausweis_c_niederlassungsbewilligung.html" target="_blank">SEM – C Permit (Settlement)</a></li>
  <li><a href="https://www.ch.ch/en/foreign-nationals-in-switzerland/residence-permits/" target="_blank">ch.ch – Residence permits overview</a></li>
</ul>',
];

// ── POST 2 ────────────────────────────────────────────────────────────────────
$posts[] = [
    'title'     => 'بیمه درمانی اجباری در سوئیس: راهنمای کامل برای تازه‌واردان',
    'author_id' => $authorIds['Zahra Hosseini'],
    'language'  => 'fa',
    'tags'      => 'legal,survival guides',
    'city'      => null,
    'date'      => '2025-01-18 10:00:00',
    'content'   => '<h2>بیمه درمانی در سوئیس</h2>
<p>یکی از اولین و مهم‌ترین کارهایی که باید بعد از ورود به سوئیس انجام دهید، تهیه بیمه درمانی پایه (Grundversicherung / LAMal) است. این بیمه در سوئیس <strong>اجباری</strong> است و باید ظرف سه ماه از تاریخ ورود یا دریافت اجازه اقامت آن را تهیه کنید.</p>

<h3>بیمه پایه (KVG / LAMal)</h3>
<p>بیمه پایه توسط قانون فدرال تنظیم می‌شود و تمام شرکت‌های بیمه موظفند بدون توجه به وضعیت سلامتی شما آن را ارائه دهند. خدمات پوشش‌دهنده در تمام شرکت‌ها یکسان است اما حق بیمه (Prämie) بسته به شرکت، کانتون و مدل انتخابی متفاوت است.</p>

<h3>مدل‌های مختلف بیمه</h3>
<ul>
  <li><strong>Standard (آزاد)</strong> – می‌توانید مستقیماً به هر پزشکی مراجعه کنید. گران‌ترین مدل.</li>
  <li><strong>HMO</strong> – باید همیشه ابتدا به یک مرکز بهداشتی خاص مراجعه کنید. ارزان‌تر.</li>
  <li><strong>Telmed</strong> – قبل از مراجعه به پزشک، باید با یک خط تلفنی مشورت کنید. معمولاً ارزان‌ترین گزینه.</li>
  <li><strong>Hausarzt (پزشک خانوادگی)</strong> – باید یک پزشک خانوادگی ثابت داشته باشید و ابتدا با او مشورت کنید.</li>
</ul>

<h3>فرانشیز (Franchise)</h3>
<p>فرانشیز مقداری است که سالانه از جیب خودتان می‌پردازید قبل از اینکه بیمه شروع به پرداخت کند. فرانشیز برای بزرگسالان بین <strong>۳۰۰ تا ۲۵۰۰ فرانک</strong> است. هرچه فرانشیز بیشتر باشد، حق بیمه ماهانه کمتر است. اگر سالم هستید و کمتر به پزشک مراجعه می‌کنید، فرانشیز بالاتر ممکن است مقرون‌به‌صرفه‌تر باشد.</p>

<h3>مقایسه و انتخاب</h3>
<p>از سایت <a href="https://www.comparis.ch/krankenkassen" target="_blank">Comparis.ch</a> یا <a href="https://www.priminfo.admin.ch" target="_blank">Priminfo (سایت رسمی دولت)</a> می‌توانید حق بیمه شرکت‌های مختلف را با هم مقایسه کنید.</p>

<h3>کمک هزینه دولتی (Prämienverbilligung)</h3>
<p>اگر درآمد شما پایین است، ممکن است واجد شرایط دریافت کمک هزینه دولتی برای بیمه درمانی باشید. این درخواست از طریق کانتون محل اقامت شما انجام می‌شود.</p>

<h3>منابع رسمی</h3>
<ul>
  <li><a href="https://www.bag.admin.ch/bag/en/home/versicherungen/krankenversicherung.html" target="_blank">اداره فدرال بهداشت عمومی (BAG) – بیمه درمانی</a></li>
  <li><a href="https://www.comparis.ch/krankenkassen" target="_blank">Comparis – مقایسه بیمه‌ها</a></li>
  <li><a href="https://www.ch.ch/en/health-insurance/" target="_blank">ch.ch – راهنمای بیمه درمانی</a></li>
</ul>',
];

// ── POST 3 ────────────────────────────────────────────────────────────────────
$posts[] = [
    'title'     => 'How to Find Affordable Housing in Switzerland',
    'author_id' => $authorIds['Helma Karimi'],
    'language'  => 'en',
    'tags'      => 'survival guides',
    'city'      => null,
    'date'      => '2025-01-25 11:00:00',
    'content'   => '<h2>Finding Housing in Switzerland as a Newcomer</h2>
<p>Switzerland has one of the most competitive rental markets in Europe, particularly in cities like Zurich, Geneva, and Basel. Vacancy rates in Zurich regularly fall below 1%. This guide covers where to look, what to expect, and how to maximise your chances.</p>

<h3>Where to Search</h3>
<ul>
  <li><a href="https://www.homegate.ch" target="_blank">Homegate.ch</a> – Switzerland\'s largest real estate platform</li>
  <li><a href="https://www.immoscout24.ch" target="_blank">ImmoScout24.ch</a> – Another major listing site</li>
  <li><a href="https://www.anibis.ch" target="_blank">Anibis.ch</a> – Classifieds including private rentals</li>
  <li><a href="https://www.wgzimmer.ch" target="_blank">WGZimmer.ch</a> – Shared apartments (WG / colocation)</li>
  <li><a href="https://www.ronorp.net" target="_blank">Ronorp.net</a> – Zurich community board, often has unadvertised rooms</li>
  <li>Facebook groups – Search "Wohnung Zürich", "Logement Genève", etc.</li>
</ul>

<h3>What to Expect to Pay</h3>
<p>As a rough guide (2024 figures):</p>
<ul>
  <li><strong>Zurich</strong>: 1-room apartment CHF 1,600–2,400/month; 2-room CHF 2,200–3,500</li>
  <li><strong>Geneva</strong>: Similar to Zurich, often slightly higher in central areas</li>
  <li><strong>Basel / Bern</strong>: Somewhat more affordable, 1-room from CHF 1,200</li>
  <li><strong>Smaller towns</strong>: Significantly cheaper, commuter belt around Zurich (Winterthur, Baden) can save 20–40%</li>
</ul>

<h3>Cooperative Housing (Genossenschaft)</h3>
<p>Non-profit housing cooperatives (Genossenschaften) offer significantly below-market rents. The largest in Zurich is <a href="https://www.abz.ch" target="_blank">ABZ</a> and <a href="https://www.gbz.ch" target="_blank">GBZ</a>. Wait lists can be long (2–5+ years) but it is worth registering immediately after arrival. Many cooperatives require a small share purchase (CHF 1,000–5,000) to join the waitlist.</p>

<h3>Tips for Your Application (Dossier)</h3>
<p>Swiss landlords are rigorous. A strong dossier includes:</p>
<ul>
  <li>A debt enforcement extract (<em>Betreibungsauszug</em>) showing no outstanding debts — obtain from your local debt enforcement office (<em>Betreibungsamt</em>)</li>
  <li>Last three payslips or proof of income / scholarship letter</li>
  <li>Copy of your residence permit</li>
  <li>A short, polite cover letter introducing yourself</li>
  <li>References from previous landlords if available</li>
</ul>
<p>As a newcomer without a Swiss credit history, you may be asked for a higher deposit (up to 3 months\' rent) or a guarantor.</p>

<h3>Student Housing</h3>
<p>If you are a student, check your university\'s housing office first. ETH Zurich and University of Zurich have dedicated student housing through <a href="https://www.woko.ch" target="_blank">WOKO</a>. EPFL students can find housing through <a href="https://logement.epfl.ch" target="_blank">EPFL\'s housing service</a>.</p>

<h3>Official Resources</h3>
<ul>
  <li><a href="https://www.ch.ch/en/housing/" target="_blank">ch.ch – Housing in Switzerland</a></li>
  <li><a href="https://www.hev-schweiz.ch" target="_blank">HEV – Swiss homeowners association (tenant rights info)</a></li>
  <li><a href="https://www.mieterverband.ch" target="_blank">Mieterverband – Swiss tenants association</a></li>
</ul>',
];

// ── POST 4 ────────────────────────────────────────────────────────────────────
$posts[] = [
    'title'     => 'Applying to Swiss Universities: ETH, EPFL and Beyond',
    'author_id' => $authorIds['Hamid Taheri'],
    'language'  => 'en',
    'tags'      => 'survival guides',
    'city'      => null,
    'date'      => '2025-02-03 10:00:00',
    'content'   => '<h2>Getting into Swiss Universities as an International Student</h2>
<p>Switzerland is home to some of the world\'s top universities, including ETH Zurich and EPFL, which consistently rank in the global top 10 for engineering and natural sciences. Here is what you need to know about the admission process as an Iranian applicant.</p>

<h3>University Types</h3>
<ul>
  <li><strong>Federal institutes of technology</strong>: ETH Zurich and EPFL (Lausanne) — the most prestigious, with a strong international reputation</li>
  <li><strong>Cantonal universities</strong>: University of Zurich, University of Geneva, University of Bern, University of Basel, etc.</li>
  <li><strong>Universities of Applied Sciences (Fachhochschulen)</strong>: More practice-oriented, often require relevant work experience</li>
</ul>

<h3>Bachelor\'s Admission</h3>
<p>ETH Zurich and EPFL do not directly accept Iranian high school diplomas (Diplom Mutavaset) for bachelor\'s admission. You will typically need to either:</p>
<ul>
  <li>Pass the <strong>ETH/EPFL entrance examination</strong> (held in the spring), or</li>
  <li>Complete one year at a recognised university in Iran or elsewhere (with good grades) before applying for a transfer</li>
</ul>
<p>Cantonal universities have their own equivalency processes. The <a href="https://www.swissuniversities.ch/en/topics/studying/admission-to-swiss-universities/international-students" target="_blank">swissuniversities.ch guide for international students</a> is your starting point.</p>

<h3>Master\'s Admission</h3>
<p>Master\'s admission is more straightforward for Iranian applicants who hold a recognised bachelor\'s degree. Requirements typically include:</p>
<ul>
  <li>A bachelor\'s degree in a relevant field with strong grades (GPA equivalent to ~5.0/6.0 Swiss or 3.5/4.0 US)</li>
  <li>English proficiency: TOEFL iBT 100+ or IELTS 7.0+ (ETH/EPFL may require higher)</li>
  <li>Statement of purpose and CV</li>
  <li>Letters of recommendation (2–3)</li>
  <li>GRE is optional at most Swiss universities but can strengthen your application</li>
</ul>

<h3>Application Deadlines</h3>
<ul>
  <li><strong>ETH Zurich</strong>: Master\'s applications open in November, deadline typically December 15 for the following autumn semester. See <a href="https://www.ethz.ch/en/studies/master/application.html" target="_blank">ethz.ch</a></li>
  <li><strong>EPFL</strong>: Deadlines vary by programme, usually December–January. See <a href="https://www.epfl.ch/education/master/admission/" target="_blank">epfl.ch/education/master</a></li>
  <li><strong>University of Zurich</strong>: April 30 for autumn semester. See <a href="https://www.uzh.ch/en/studies/application.html" target="_blank">uzh.ch</a></li>
</ul>

<h3>Tuition Fees</h3>
<p>Swiss universities are remarkably affordable compared to the US or UK:</p>
<ul>
  <li>ETH Zurich: ~CHF 730/semester for all students</li>
  <li>EPFL: ~CHF 730/semester</li>
  <li>Cantonal universities: CHF 500–1,500/semester depending on the canton</li>
</ul>

<h3>Scholarships</h3>
<ul>
  <li><a href="https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html" target="_blank">Swiss Government Excellence Scholarships</a> – For postgraduate and research stays</li>
  <li><a href="https://ethz.ch/en/studies/financial/scholarships.html" target="_blank">ETH Excellence Scholarship</a> – For Master\'s students</li>
  <li><a href="https://www.epfl.ch/education/master/financing-your-studies/" target="_blank">EPFL Excellence Fellowships</a></li>
</ul>

<h3>Student Visa</h3>
<p>Iranian nationals need a student visa (national visa D) before arriving. Apply at the Swiss embassy in Tehran. You will need your admission letter, proof of financial means (usually CHF 21,000/year), accommodation proof, and health insurance. Processing can take 6–10 weeks, so apply early.</p>',
];

// ── POST 5 ────────────────────────────────────────────────────────────────────
$posts[] = [
    'title'     => 'جریمه در سوئیس: انواع، مراحل و حقوق شما',
    'author_id' => $authorIds['Neda Moradi'],
    'language'  => 'fa',
    'tags'      => 'legal',
    'city'      => null,
    'date'      => '2025-02-12 09:00:00',
    'content'   => '<h2>جریمه در سوئیس</h2>
<p>سوئیس یکی از کشورهایی است که قوانین آن به دقت اجرا می‌شود. آشنایی با انواع جریمه‌ها و فرآیند رسیدگی به آن‌ها برای هر تازه‌واردی ضروری است.</p>

<h3>جریمه‌های فوری (Ordnungsbusse)</h3>
<p>جریمه‌های فوری برای تخلفات سبک‌تر صادر می‌شوند و معمولاً در همان لحظه توسط افسر پلیس به شما داده می‌شوند. مبلغ این جریمه‌ها ثابت و معمولاً تا <strong>۳۰۰ فرانک</strong> است. پرداخت آن‌ها ساده است و می‌توانید با کارت یا نقد پرداخت کنید. پرداخت این جریمه‌ها به معنی قبول تخلف نیست؛ صرفاً یک پرداخت اداری است.</p>
<p>نمونه‌هایی از تخلفات رایج:</p>
<ul>
  <li>عبور از چراغ قرمز توسط عابر پیاده – ۲۰ فرانک</li>
  <li>پارک غیرمجاز – بین ۴۰ تا ۱۲۰ فرانک بسته به شهر</li>
  <li>سواری بدون بلیط در حمل‌ونقل عمومی – ۱۰۰ فرانک</li>
  <li>دور انداختن زباله در معابر عمومی – ۳۰۰ فرانک</li>
</ul>

<h3>جریمه رسمی (Busse / Strafbefehl)</h3>
<p>برای تخلفات جدی‌تر (مانند سرعت بیش از حد، رانندگی تحت تأثیر الکل، یا دیگر جرایم)، یک دستور جریمه رسمی (Strafbefehl) از طریق پست برای شما ارسال می‌شود. این سند شامل:</p>
<ul>
  <li>توضیح تخلف</li>
  <li>مبلغ جریمه</li>
  <li>حکم احتمالی تعلیق گواهینامه یا محرومیت از رانندگی</li>
</ul>
<p>شما <strong>۱۰ روز</strong> فرصت دارید تا به این حکم اعتراض کنید (Einsprache). اگر اعتراض نکنید، حکم قطعی می‌شود. اگر اعتراض کنید، پرونده به دادگاه می‌رود.</p>

<h3>جریمه‌های رانندگی و محدودیت سرعت</h3>
<p>سوئیس با تخلفات سرعت بسیار سخت‌گیرانه برخورد می‌کند:</p>
<ul>
  <li>بیش از ۲۵ کیلومتر در ساعت از حد مجاز در داخل شهر: حداقل یک ماه تعلیق گواهینامه</li>
  <li>بیش از ۴۰ کیلومتر در ساعت از حد مجاز در جاده: حداقل سه ماه تعلیق و جریمه نقدی</li>
  <li>تخلفات «Via Sicura» (بیش از ۵۰ کم‌ز در شهر): ضبط خودرو و پرونده جزایی</li>
</ul>

<h3>اگر توان پرداخت ندارید</h3>
<p>می‌توانید درخواست تقسیط یا بخشودگی کنید. با دفتر صادرکننده جریمه تماس بگیرید و وضعیت مالی خود را توضیح دهید.</p>

<h3>منابع رسمی</h3>
<ul>
  <li><a href="https://www.ch.ch/en/traffic-and-roads/fines-and-penalties/" target="_blank">ch.ch – جریمه‌های ترافیکی</a></li>
  <li><a href="https://www.astra.admin.ch" target="_blank">ASTRA – اداره فدرال راه‌های سوئیس</a></li>
</ul>',
];

// ── POST 6 ────────────────────────────────────────────────────────────────────
$posts[] = [
    'title'     => 'Job Hunting in Switzerland as a Non-EU Foreigner',
    'author_id' => $authorIds['Arash Shirazi'],
    'language'  => 'en',
    'tags'      => 'survival guides',
    'city'      => null,
    'date'      => '2025-02-20 10:00:00',
    'content'   => '<h2>Finding a Job in Switzerland as an Iranian National</h2>
<p>Switzerland has a highly skilled labour market and finding employment as a non-EU national comes with additional administrative hurdles, but it is absolutely achievable — especially in high-demand fields like technology, engineering, finance, and healthcare.</p>

<h3>The Work Permit Reality</h3>
<p>Swiss employers must demonstrate that no suitable candidate from Switzerland or the EU/EFTA could fill the role before hiring a non-EU national. This is called the <strong>priority check</strong>. This means:</p>
<ul>
  <li>Your best chances are in fields with a documented skills shortage: software engineering, data science, medicine, architecture, finance</li>
  <li>Swiss employers must advertise the position through the RAV (regional employment centre) first</li>
  <li>The employer submits the work permit application on your behalf — you do not apply directly</li>
</ul>
<p>However, if you already have a valid B or C permit (e.g., from a family reunification or student visa), you are generally free to work without additional permits.</p>

<h3>Where to Look</h3>
<ul>
  <li><a href="https://www.jobs.ch" target="_blank">Jobs.ch</a> – Switzerland\'s leading job board</li>
  <li><a href="https://www.jobup.ch" target="_blank">Jobup.ch</a> – Strong in French-speaking Switzerland</li>
  <li><a href="https://www.linkedin.com" target="_blank">LinkedIn</a> – Essential for professional networking in Switzerland</li>
  <li><a href="https://www.xing.com" target="_blank">Xing</a> – More popular in German-speaking regions</li>
  <li><a href="https://www.indeed.ch" target="_blank">Indeed.ch</a></li>
  <li>Company websites directly — many Swiss companies prefer direct applications</li>
</ul>

<h3>CV and Application Tips</h3>
<ul>
  <li>Swiss CVs are typically <strong>2 pages maximum</strong>, structured, and include a professional photo</li>
  <li>Include a cover letter (Motivationsschreiben / lettre de motivation) tailored to each role</li>
  <li>Swiss employers value precision, reliability, and cultural fit — reflect these qualities</li>
  <li>Language skills are crucial: German (in Zurich/Bern/Basel), French (Geneva/Lausanne), or English (tech sector, international organisations)</li>
</ul>

<h3>Networking</h3>
<p>Swiss hiring culture relies heavily on personal networks. Attending industry events, Swiss tech meetups, and connecting with Iranian professionals already working in Switzerland can open doors that job boards cannot. The <a href="https://www.linkedin.com/groups/Swiss-Iranian-professionals/" target="_blank">LinkedIn Swiss-Iranian professionals group</a> is a useful starting point.</p>

<h3>Salary Expectations</h3>
<p>Switzerland has some of the highest salaries in the world. As a rough guide for Zurich (2024):</p>
<ul>
  <li>Junior software engineer: CHF 90,000–110,000/year</li>
  <li>Senior software engineer: CHF 130,000–180,000+/year</li>
  <li>Finance / banking: CHF 100,000–200,000+ depending on role</li>
  <li>Note: Swiss salaries are gross — deduct ~20–25% for social security, pension, and taxes</li>
</ul>

<h3>Official Resources</h3>
<ul>
  <li><a href="https://www.sem.admin.ch/sem/en/home/themen/arbeit/nicht-eu_efta.html" target="_blank">SEM – Work permits for non-EU/EFTA nationals</a></li>
  <li><a href="https://www.arbeit.swiss" target="_blank">Arbeit.swiss – Federal Employment Agency</a></li>
  <li><a href="https://www.salarycomparison.ch" target="_blank">Lohnrechner – Swiss salary comparison tool</a></li>
</ul>',
];

// ── POST 7 ────────────────────────────────────────────────────────────────────
$posts[] = [
    'title'     => 'تمدید پاسپورت ایرانی در سوئیس',
    'author_id' => $authorIds['Zahra Hosseini'],
    'language'  => 'fa',
    'tags'      => 'legal',
    'city'      => 'Bern',
    'date'      => '2025-03-01 09:00:00',
    'content'   => '<h2>تمدید پاسپورت ایرانی در سوئیس</h2>
<p>برای تمدید پاسپورت یا دریافت پاسپورت جدید به عنوان شهروند ایرانی مقیم سوئیس، باید به <strong>سفارت جمهوری اسلامی ایران در برن</strong> مراجعه کنید.</p>

<h3>آدرس و اطلاعات تماس</h3>
<p>سفارت ایران در سوئیس در برن قرار دارد. توجه داشته باشید که اطلاعات تماس و ساعات کاری ممکن است تغییر کنند؛ همیشه قبل از مراجعه از وب‌سایت رسمی سفارت اطلاعات به‌روز را دریافت کنید.</p>
<ul>
  <li><a href="http://bern.mfa.ir" target="_blank">وب‌سایت رسمی سفارت ایران در برن: bern.mfa.ir</a></li>
</ul>

<h3>مدارک مورد نیاز برای تمدید پاسپورت</h3>
<p>معمولاً مدارک زیر لازم است (لیست دقیق را از سفارت تأیید کنید):</p>
<ul>
  <li>پاسپورت قدیمی</li>
  <li>کارت ملی ایرانی (در صورت داشتن)</li>
  <li>شناسنامه</li>
  <li>اقامت نامه سوئیسی (Aufenthaltsbewilligung / permis de séjour)</li>
  <li>عکس‌های پاسپورتی با مشخصات مقرر</li>
  <li>فرم تکمیل‌شده درخواست پاسپورت</li>
  <li>پرداخت هزینه (نقد یا به روش مشخص شده توسط سفارت)</li>
</ul>

<h3>سربازی</h3>
<p>برای آقایانی که وظیفه سربازی آن‌ها انجام نشده، ممکن است محدودیت‌هایی در صدور پاسپورت وجود داشته باشد. وضعیت خود را قبل از مراجعه با سفارت در میان بگذارید.</p>

<h3>وکالت‌نامه از طریق سفارت</h3>
<p>اگر نیاز به وکالت‌نامه برای امور ملکی یا حقوقی در ایران دارید، سفارت این خدمت را نیز ارائه می‌دهد. معمولاً وکالت‌نامه باید توسط یک دفتر اسناد رسمی محلی نیز تأیید و سپس تصدیق (آپوستیل) شود.</p>

<h3>نکات مهم</h3>
<ul>
  <li>وقت قبلی (Termin) بگیرید — سفارت معمولاً بدون وقت قبلی پذیرش ندارد</li>
  <li>پردازش پاسپورت جدید ممکن است چند هفته طول بکشد</li>
  <li>مطمئن شوید پاسپورت فعلی‌تان حداقل شش ماه اعتبار داشته باشد در صورت سفر به اروپا</li>
</ul>

<h3>منابع</h3>
<ul>
  <li><a href="http://bern.mfa.ir" target="_blank">سفارت ایران در برن – bern.mfa.ir</a></li>
</ul>',
];

// ── POST 8 ────────────────────────────────────────────────────────────────────
$posts[] = [
    'title'     => 'Opening a Bank Account in Switzerland: What You Need to Know',
    'author_id' => $authorIds['Hamid Taheri'],
    'language'  => 'en',
    'tags'      => 'survival guides',
    'city'      => null,
    'date'      => '2025-03-10 10:00:00',
    'content'   => '<h2>Opening a Swiss Bank Account as a Foreigner</h2>
<p>A Swiss bank account is essential for receiving your salary, paying rent, and managing daily expenses. Despite Switzerland\'s reputation for private banking, opening a standard current account as a resident is straightforward.</p>

<h3>What You Need</h3>
<ul>
  <li>Valid passport</li>
  <li>Swiss residence permit (Aufenthaltsbewilligung)</li>
  <li>Proof of address (rental contract or utility bill)</li>
  <li>Some banks may ask for proof of employment or admission letter</li>
</ul>
<p>Note: Banks are required by law to verify your identity and the source of funds for larger accounts. This is standard compliance, not discrimination.</p>

<h3>Which Bank to Choose</h3>
<p>The main options for newcomers:</p>
<ul>
  <li><strong>UBS / Credit Suisse (now merged into UBS)</strong> – Largest bank, good English support, branches everywhere. Monthly fees ~CHF 5–8.</li>
  <li><strong>PostFinance</strong> – Run by Swiss Post, very accessible, no minimum balance. Good for newcomers. <a href="https://www.postfinance.ch/en/private.html" target="_blank">postfinance.ch</a></li>
  <li><strong>Raiffeisen</strong> – Cooperative bank, strong regional presence, good service. <a href="https://www.raiffeisen.ch" target="_blank">raiffeisen.ch</a></li>
  <li><strong>Cantonal banks (Kantonalbank)</strong> – State-backed, very safe, each canton has one (e.g., ZKB in Zurich, BCG in Geneva)</li>
  <li><strong>Neon / Yuh / Revolut</strong> – Digital banks with lower or no fees. Good for everyday spending. Note that some landlords do not accept accounts from digital-only banks for rent payments.</li>
</ul>

<h3>IBAN and Payment Culture</h3>
<p>Switzerland uses IBAN for all transfers. Rent and bills are almost always paid by bank transfer, not cash or card. You will receive an orange payment slip (Einzahlungsschein) or a QR bill for invoices — these can be paid via e-banking or at a post office. Set up e-banking from day one.</p>

<h3>Sending Money to Iran</h3>
<p>Due to international sanctions, direct bank transfers to Iran are not possible through standard Swiss banks. Alternatives used by the community include licensed money transfer services, but always verify their regulatory status with FINMA, the Swiss financial regulator: <a href="https://www.finma.ch/en" target="_blank">finma.ch</a>. Never use unlicensed channels.</p>

<h3>Official Resources</h3>
<ul>
  <li><a href="https://www.postfinance.ch/en/private/products/accounts.html" target="_blank">PostFinance accounts</a></li>
  <li><a href="https://www.finma.ch/en/authorisation/search-for-authorised-institutions/" target="_blank">FINMA – Verify licensed financial service providers</a></li>
</ul>',
];

// ── POST 9 ────────────────────────────────────────────────────────────────────
$posts[] = [
    'title'     => 'راهنمای ثبت‌نام در شهرداری (Einwohnerkontrolle)',
    'author_id' => $authorIds['Helma Karimi'],
    'language'  => 'fa',
    'tags'      => 'legal,survival guides',
    'city'      => null,
    'date'      => '2025-03-18 09:00:00',
    'content'   => '<h2>ثبت‌نام در دفتر ساکنین — اولین قدم در سوئیس</h2>
<p>یکی از اولین و مهم‌ترین کارهایی که باید پس از ورود به سوئیس انجام دهید، ثبت‌نام در دفتر ثبت ساکنین (<em>Einwohnerkontrolle</em> به آلمانی، یا <em>Office du contrôle des habitants</em> به فرانسوی) است. این کار <strong>اجباری</strong> است و باید ظرف <strong>۱۴ روز</strong> از تاریخ ورود انجام شود.</p>

<h3>چرا ثبت‌نام مهم است؟</h3>
<p>بدون ثبت‌نام در شهرداری:</p>
<ul>
  <li>اجازه اقامت شما صادر نمی‌شود</li>
  <li>نمی‌توانید حساب بانکی باز کنید</li>
  <li>نمی‌توانید بیمه درمانی تهیه کنید</li>
  <li>ثبت‌نام در دانشگاه یا شروع کار ممکن است مشکل‌ساز شود</li>
</ul>

<h3>مدارک لازم</h3>
<ul>
  <li>گذرنامه معتبر</li>
  <li>ویزای ورودی یا اجازه اقامت اولیه</li>
  <li>قرارداد اجاره (Mietvertrag) یا تأیید آدرس از صاحب‌خانه</li>
  <li>در صورت وجود: قرارداد کاری یا نامه پذیرش دانشگاه</li>
  <li>در صورت همراه بودن خانواده: مدارک آن‌ها نیز لازم است</li>
</ul>

<h3>مراحل کار</h3>
<ol>
  <li>به وب‌سایت شهرداری (Gemeinde) محل اقامت خود مراجعه کنید</li>
  <li>وقت (Termin) آنلاین بگیرید یا در بعضی شهرهای کوچک‌تر مستقیم مراجعه کنید</li>
  <li>مدارک خود را به همراه بیاورید</li>
  <li>فرم ثبت‌نام را تکمیل کنید (معمولاً به آلمانی یا فرانسوی)</li>
  <li>هزینه اداری را بپردازید (معمولاً ۲۰ تا ۵۰ فرانک)</li>
</ol>

<h3>بعد از ثبت‌نام</h3>
<p>پس از ثبت‌نام، دفتر ساکنین اطلاعات شما را به اداره مهاجرت کانتون ارسال می‌کند و فرآیند صدور اجازه اقامت آغاز می‌شود. کارت اجازه اقامت معمولاً چند هفته بعد از طریق پست یا اعلام برای دریافت حضوری ارسال می‌شود.</p>

<h3>تغییر آدرس</h3>
<p>هر بار که نقل مکان می‌کنید، حتی در همان شهر، باید آدرس جدید را اعلام کنید (Adressänderung). این کار معمولاً آنلاین قابل انجام است.</p>

<h3>منابع</h3>
<ul>
  <li><a href="https://www.ch.ch/en/registration-move/" target="_blank">ch.ch – ثبت‌نام و تغییر آدرس</a></li>
</ul>',
];

// ── POST 10 ────────────────────────────────────────────────────────────────────
$posts[] = [
    'title'     => 'Swiss Public Transport: Getting Around with GA and Halbtax',
    'author_id' => $authorIds['Reza Ahmadi'],
    'language'  => 'en',
    'tags'      => 'survival guides',
    'city'      => null,
    'date'      => '2025-03-28 10:00:00',
    'content'   => '<h2>Switzerland\'s Public Transport System</h2>
<p>Switzerland has one of the best public transport networks in the world. Trains, trams, buses, and boats are coordinated under a single ticketing system, making getting around without a car entirely practical — and for many people in cities, preferable.</p>

<h3>The Key Passes</h3>
<ul>
  <li><strong>Halbtax (Half-fare card)</strong> – Costs CHF 185/year and gives you 50% off virtually all public transport across Switzerland. Essential for anyone who travels by train even occasionally. Available at <a href="https://www.sbb.ch/en/travelcards-and-tickets/railpasses/half-fare-travelcard.html" target="_blank">SBB.ch</a></li>
  <li><strong>GA (General Abonnement)</strong> – Unlimited travel on all Swiss public transport for CHF 3,860/year (2nd class adult, 2024 price). Makes sense if you commute daily or travel frequently. Monthly payment options available.</li>
  <li><strong>City day passes and zone subscriptions</strong> – Most cities also offer monthly or annual subscriptions for their local network (e.g., ZVV in Zurich, TPG in Geneva)</li>
</ul>

<h3>The SBB App</h3>
<p>Download the <a href="https://www.sbb.ch/en/buying-options/apps/sbb-mobile.html" target="_blank">SBB Mobile app</a> immediately. It is the official Swiss Federal Railways app, allows you to buy tickets, check timetables, and manage subscriptions. It accepts credit cards and TWINT (Swiss mobile payment).</p>

<h3>Fare Zones</h3>
<p>Urban areas use a zone-based fare system. A single trip in Zurich zone 110 costs CHF 2.70 (short) or CHF 4.40 (one zone). Always validate your ticket before boarding — inspectors check regularly and the fine for travelling without a valid ticket is CHF 100.</p>

<h3>Bikes and E-Bikes</h3>
<p>You can take bicycles on most trains (check the bike symbol in the SBB app). Many cities also have rental schemes: <a href="https://www.publibike.ch" target="_blank">PubliBike</a> is the main operator in Zurich, Bern, Lausanne, and other cities.</p>

<h3>Night Transport</h3>
<p>In Zurich, the S-Bahn and trams run until around midnight, with night trams and buses on weekends. The <em>Nightnetz</em> supplements this on Friday and Saturday nights.</p>

<h3>Official Resources</h3>
<ul>
  <li><a href="https://www.sbb.ch/en" target="_blank">SBB – Swiss Federal Railways</a></li>
  <li><a href="https://www.zvv.ch/en" target="_blank">ZVV – Zurich transport network</a></li>
  <li><a href="https://www.tpg.ch" target="_blank">TPG – Geneva public transport</a></li>
</ul>',
];

// ── POST 11 ────────────────────────────────────────────────────────────────────
$posts[] = [
    'title'     => 'مالیات در سوئیس: راهنمای اولیه برای تازه‌واردان',
    'author_id' => $authorIds['Arash Shirazi'],
    'language'  => 'fa',
    'tags'      => 'legal',
    'city'      => null,
    'date'      => '2025-04-05 09:00:00',
    'content'   => '<h2>سیستم مالیاتی سوئیس</h2>
<p>سیستم مالیاتی سوئیس در ابتدا ممکن است پیچیده به نظر برسد زیرا سه سطح مالیات وجود دارد: فدرال، کانتونی و شهرداری. این بدان معناست که مالیات شما بسته به محل زندگی‌تان می‌تواند بسیار متفاوت باشد.</p>

<h3>مالیات کسر از منبع (Quellensteuer)</h3>
<p>اگر اجازه اقامت شما B یا L باشد (یعنی هنوز به C نرسیده‌اید) و در سوئیس کار می‌کنید، مالیات مستقیماً از حقوق شما کسر می‌شود. کارفرمای شما این مبلغ را به دولت پرداخت می‌کند و شما معمولاً نیازی به تقدیم اظهارنامه مالیاتی جداگانه ندارید — مگر در شرایط خاص.</p>

<h3>اظهارنامه مالیاتی (Steuererklärung)</h3>
<p>اگر دارنده اجازه C یا شهروند سوئیسی هستید، باید هر سال اظهارنامه مالیاتی تقدیم کنید. اظهارنامه معمولاً در اواخر مارس یا اوایل آوریل سال بعد ارسال می‌شود. در اکثر کانتون‌ها می‌توانید این کار را به صورت آنلاین انجام دهید.</p>

<h3>نرخ مالیات</h3>
<p>نرخ مالیات بر اساس کانتون، شهر، درآمد و وضعیت خانوادگی شما متفاوت است. برخی کانتون‌ها مانند زوگ (Zug)، شوویتز (Schwyz) و نیدوالدن (Nidwalden) پایین‌ترین نرخ‌های مالیاتی را در اروپا دارند. برای مقایسه کانتون‌ها از <a href="https://swisstaxcalculator.estv.admin.ch" target="_blank">ماشین‌حساب مالیاتی رسمی دولت سوئیس</a> استفاده کنید.</p>

<h3>کسورات مالیاتی رایج</h3>
<ul>
  <li>هزینه رفت‌وآمد به محل کار (تا سقف مشخص)</li>
  <li>هزینه‌های مرتبط با کار (کامپیوتر، ادوات حرفه‌ای)</li>
  <li>حق بیمه درمانی پرداختی از جیب</li>
  <li>هزینه‌های آموزش و توسعه حرفه‌ای</li>
  <li>صندوق پس‌انداز بازنشستگی (Pillar 3a) — تا سقف ۷,۰۵۶ فرانک در سال (۲۰۲۴) از درآمد مشمول مالیات کسر می‌شود</li>
</ul>

<h3>⚠️ توجه</h3>
<p>این مقاله اطلاعات کلی ارائه می‌دهد. برای مشاوره مالیاتی دقیق با یک حسابدار یا مشاور مالیاتی سوئیسی مشورت کنید.</p>

<h3>منابع رسمی</h3>
<ul>
  <li><a href="https://swisstaxcalculator.estv.admin.ch" target="_blank">ماشین‌حساب مالیاتی فدرال</a></li>
  <li><a href="https://www.estv.admin.ch" target="_blank">اداره فدرال مالیات سوئیس (ESTV)</a></li>
  <li><a href="https://www.ch.ch/en/taxes/" target="_blank">ch.ch – مالیات در سوئیس</a></li>
</ul>',
];

// ── POST 12 ────────────────────────────────────────────────────────────────────
$posts[] = [
    'title'     => 'Converting Your Iranian Driving Licence in Switzerland',
    'author_id' => $authorIds['Neda Moradi'],
    'language'  => 'en',
    'tags'      => 'legal',
    'city'      => null,
    'date'      => '2025-04-15 10:00:00',
    'content'   => '<h2>Driving in Switzerland with an Iranian Licence</h2>
<p>If you hold an Iranian driving licence and move to Switzerland, there are specific rules about how long you can drive on it and what you need to do to get a Swiss licence.</p>

<h3>First 12 Months</h3>
<p>Swiss law allows you to drive on a valid foreign driving licence for <strong>12 months</strong> from the date you register as a resident. After that, you must obtain a Swiss licence. Driving on a foreign licence after the 12-month period is a legal violation.</p>

<h3>Can You Exchange Directly?</h3>
<p>Switzerland has direct exchange agreements with many countries (EU, US, Canada, Australia, etc.), meaning no driving test is required. <strong>Iran is not on this list.</strong> This means Iranian licence holders must:</p>
<ol>
  <li>Pass the Swiss theory test (Theorieprüfung)</li>
  <li>Complete a first-aid course (Nothelferkurs) — 10 hours</li>
  <li>Complete mandatory lessons on driving in practice (WAB — Weiterausbildung)</li>
  <li>Pass the practical driving test (Fahrprüfung)</li>
</ol>
<p>However, authorities recognise your driving experience. Some driving schools offer a shortened programme for experienced foreign drivers, which may mean fewer required lessons.</p>

<h3>Steps to Get Your Swiss Licence</h3>
<ol>
  <li>Apply for a learner\'s licence (Lernfahrausweis) at your cantonal road traffic office (Strassenverkehrsamt/SVA)</li>
  <li>Complete the first-aid course — offered by Red Cross and many other providers, search "Nothelferkurs" in your canton</li>
  <li>Pass the theory test — available online and in test centres, study material at <a href="https://www.theorie24.ch" target="_blank">theorie24.ch</a></li>
  <li>Take driving lessons with a licensed instructor</li>
  <li>Complete the 2x2-hour motorway lesson (WAB) if required</li>
  <li>Pass the practical test</li>
</ol>

<h3>Costs (approximate, Zurich 2024)</h3>
<ul>
  <li>Learner\'s permit application: ~CHF 50</li>
  <li>First-aid course: ~CHF 120–180</li>
  <li>Theory test: ~CHF 50</li>
  <li>Driving lessons: ~CHF 100–120/hour</li>
  <li>Practical test: ~CHF 200</li>
</ul>

<h3>Official Resources</h3>
<ul>
  <li><a href="https://www.asa.ch/en" target="_blank">ASA – Association of cantonal road traffic offices</a></li>
  <li><a href="https://www.zh.ch/en/mobility/driving-licence.html" target="_blank">Zurich canton – Driving licence information</a></li>
  <li><a href="https://www.ch.ch/en/driving-licence/" target="_blank">ch.ch – Driving licences</a></li>
</ul>',
];

// ── Run inserts ───────────────────────────────────────────────────────────────
echo "<h2>Blog Seeder</h2>";
foreach ($posts as $p) {
    insertPost($pdo, $p);
}
echo "<br><strong>Done.</strong> Delete this file now: <code>api/seeder_blog.php</code>";
