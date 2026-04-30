<?php
require_once 'config.php';
require_once 'jwt.php';

// Auto-create table
$pdo->exec("CREATE TABLE IF NOT EXISTS site_content (
  `key` VARCHAR(128) PRIMARY KEY,
  `value` MEDIUMTEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

$method = $_SERVER['REQUEST_METHOD'];

// Default content — returned when no DB row exists yet
$DEFAULTS = [
  'about_biruni_en'   => "<p>Abu Rayhan al-Biruni (973–1048 CE) was one of history's greatest minds — a Persian scholar who mastered astronomy, mathematics, geography and anthropology at a time when the world was still largely unmapped. He travelled far, learned languages, and dedicated his life to understanding and documenting the diversity of human civilisation.</p><p>His curiosity, his respect for every culture he encountered, and his belief that knowledge belongs to everyone — these are the values that inspired us to build BiruniMap: a living, growing map of the Iranian diaspora, connecting people, businesses and communities across the globe.</p>",
  'about_biruni_fa'   => "<p>ابوریحان بیرونی (۳۵۰–۴۲۷ هجری شمسی) یکی از بزرگ‌ترین اندیشمندان تاریخ بود — دانشمند ایرانی‌ای که در ستاره‌شناسی، ریاضیات، جغرافیا و مردم‌شناسی سرآمد روزگار خود بود.</p><p>کنجکاوی او، احترامش به هر فرهنگی که با آن روبرو می‌شد، و ایمانش به اینکه دانش متعلق به همه است — این ارزش‌ها ما را برانگیخت تا بیرونی‌مپ را بسازیم.</p>",
  'about_story_en'    => "<p>BiruniMap began in Zurich, Switzerland — born out of a small group of Iranian students who were trying to help each other settle into life abroad. Finding a store that sold saffron and dried limes, a doctor who spoke Farsi, a lawyer who understood where you came from — things that sound simple, but make an enormous difference when you are far from home.</p><p>That need became a mission. We started mapping Iranian-owned businesses across Switzerland, then expanded to Europe, and we will keep growing — city by city, country by country — until every Iranian living abroad can find their community, no matter where in the world they are.</p>",
  'about_story_fa'    => "<p>بیرونی‌مپ در زوریخ سوئیس متولد شد — از دل یک گروه کوچک از دانشجویان ایرانی که سعی می‌کردند به یکدیگر در سازگاری با زندگی در خارج کمک کنند.</p><p>آن نیاز به یک مأموریت تبدیل شد. ما شروع به نقشه‌برداری از کسب‌وکارهای ایرانی در سراسر سوئیس کردیم، سپس به اروپا گسترش یافتیم.</p>",
  'about_vision_en'   => "<p>A world where every Iranian abroad feels seen, connected and supported — and where Iranian culture, entrepreneurship and talent thrive in every corner of the globe.</p>",
  'about_vision_fa'   => "<p>دنیایی که در آن هر ایرانی مقیم خارج احساس کند دیده می‌شود، در ارتباط است و پشتیبانی دارد.</p>",
  'about_mission_en'  => "<ul><li>Make Iranian businesses visible — so they can be found, supported and celebrated by the global Iranian community.</li><li>Bring the community to life through events — encouraging Iranians to meet, celebrate and stay connected wherever they live.</li><li>Help newcomers land on their feet — by gathering local knowledge, useful services and community information in one place.</li></ul>",
  'about_mission_fa'  => "<ul><li>دیده‌شدن کسب‌وکارهای ایرانی — تا جامعه جهانی ایرانیان بتواند آن‌ها را پیدا، حمایت و تحسین کند.</li><li>زنده نگه داشتن جامعه از طریق رویدادها.</li><li>کمک به تازه‌واردها برای شروعی آسان‌تر.</li></ul>",
  'about_founder_quote_en' => "I started this platform with love for Iran and for every Iranian who carries that same love with them — wherever life has taken them.",
  'about_founder_quote_fa' => "این پلتفرم را با عشق به ایران ساختم — و برای هر ایرانی که همین عشق را با خود حمل می‌کند، هر کجا که زندگی او را برده باشد.",
  'about_founder_name'     => "Afshin Khosroshahi",
  'about_founder_name_fa'  => "افشین خسروشاهی",
];

if ($method === 'GET') {
  $keys = array_keys($DEFAULTS);
  $placeholders = implode(',', array_map(fn($k) => ':k'.md5($k), $keys));
  $stmt = $pdo->prepare("SELECT `key`, `value` FROM site_content WHERE `key` IN (" . implode(',', array_fill(0, count($keys), '?')) . ")");
  $stmt->execute($keys);
  $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

  $result = [];
  foreach ($DEFAULTS as $key => $default) {
    $result[$key] = $rows[$key] ?? $default;
  }
  header('Content-Type: application/json');
  echo json_encode($result);
  exit;
}

if ($method === 'PATCH') {
  $token = bearer_token();
  $user  = $token ? jwt_verify($token) : null;
  if (!$user || $user['role'] !== 'superadmin') {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Superadmin only']);
    exit;
  }

  $body = json_decode(file_get_contents('php://input'), true) ?? [];
  $allowed = array_keys($DEFAULTS);

  foreach ($body as $key => $value) {
    if (!in_array($key, $allowed)) continue;
    $pdo->prepare("INSERT INTO site_content (`key`, `value`) VALUES (:k, :v) ON DUPLICATE KEY UPDATE `value` = :v2")
        ->execute([':k' => $key, ':v' => $value, ':v2' => $value]);
  }

  header('Content-Type: application/json');
  echo json_encode(['ok' => true]);
  exit;
}

http_response_code(405);
header('Content-Type: application/json');
echo json_encode(['error' => 'Method not allowed']);
