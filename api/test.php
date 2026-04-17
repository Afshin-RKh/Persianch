<?php
header('Content-Type: text/plain');

// Check if .env.php exists
$envFile = __DIR__ . '/.env.php';
echo "1. .env.php exists: " . (file_exists($envFile) ? "YES" : "NO") . "\n";

if (file_exists($envFile)) {
    require_once $envFile;
    echo "2. DB_HOST defined: " . (defined('DB_HOST') ? DB_HOST : "NOT SET") . "\n";
    echo "3. DB_NAME defined: " . (defined('DB_NAME') ? DB_NAME : "NOT SET") . "\n";
    echo "4. DB_USER defined: " . (defined('DB_USER') ? DB_USER : "NOT SET") . "\n";
    echo "5. DB_PASS defined: " . (defined('DB_PASS') ? (strlen(DB_PASS) > 0 ? "SET (length=".strlen(DB_PASS).")" : "EMPTY") : "NOT SET") . "\n";
} else {
    echo "2. .env.php NOT FOUND - credentials not deployed\n";
}

// Try connecting
echo "\n--- Connection attempts ---\n";

$hosts = ['127.0.0.1', 'localhost', '::1'];
$db   = defined('DB_NAME') ? DB_NAME : 'afshxhoj_persianhub';
$user = defined('DB_USER') ? DB_USER : 'afshxhoj_afshin';
$pass = defined('DB_PASS') ? DB_PASS : '';

foreach ($hosts as $host) {
    try {
        $pdo = new PDO("mysql:host=$host;port=3306;dbname=$db;charset=utf8mb4", $user, $pass, [
            PDO::ATTR_TIMEOUT => 3,
        ]);
        echo "CONNECTED via $host ✓\n";
        $stmt = $pdo->query("SELECT COUNT(*) as n FROM businesses");
        echo "Businesses in DB: " . $stmt->fetch()['n'] . "\n";
        break;
    } catch (PDOException $e) {
        echo "FAILED via $host: " . $e->getMessage() . "\n";
    }
}
