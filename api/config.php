<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Credentials live outside public_html for security
$envFile = '/home/afshxhoj/repositories/Persianch1/.env.php';
if (file_exists($envFile)) {
    require_once $envFile;
}

$hostRaw = trim(defined('DB_HOST') ? DB_HOST : 'localhost');
$db      = defined('DB_NAME') ? DB_NAME : 'afshxhoj_persianhub';
$user    = defined('DB_USER') ? DB_USER : 'afshxhoj_afshin';
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
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'detail' => $e->getMessage()]);
    exit();
}
