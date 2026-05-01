<?php
$allowedOrigins = ['https://birunimap.com', 'https://www.birunimap.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: https://birunimap.com');
}
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// .env.php sits at public_html/.env.php (one level up from public_html/api/)
$envFile = dirname(__DIR__) . '/.env.php';
if (file_exists($envFile)) {
    require_once $envFile;
}

$hostRaw = trim(defined('DB_HOST') ? DB_HOST : 'localhost');
$db      = defined('DB_NAME') ? DB_NAME : '';
$user    = defined('DB_USER') ? DB_USER : '';
$pass    = defined('DB_PASS') ? DB_PASS : '';

// Namecheap shared hosting requires 127.0.0.1 instead of localhost
if (strpos($hostRaw, ':') !== false) {
    [$host, $port] = explode(':', $hostRaw, 2);
} else {
    $host = $hostRaw;
    $port = '3306';
}
if ($host === 'localhost') $host = '127.0.0.1';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT            => 5,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

function sanitize_url(?string $url): ?string {
    if (!$url) return null;
    $url = trim($url);
    if (!preg_match('/^https?:\/\//i', $url)) return null;
    return filter_var($url, FILTER_VALIDATE_URL) ? $url : null;
}

function sanitize_urls_in_array(array &$data, array $fields): void {
    foreach ($fields as $field) {
        if (isset($data[$field]) && $data[$field] !== '') {
            $data[$field] = sanitize_url($data[$field]);
        }
    }
}
