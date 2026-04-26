<?php
header('Content-Type: text/plain');

$envFile = '/home/afshxhoj/repositories/Persianch1/.env.php';
echo "1. .env.php exists at secure path: " . (file_exists($envFile) ? "YES" : "NO") . "\n";

if (file_exists($envFile)) {
    require_once $envFile;
    echo "2. DB_HOST: " . (defined('DB_HOST') ? DB_HOST : "NOT SET") . "\n";
    echo "3. DB_NAME: " . (defined('DB_NAME') ? DB_NAME : "NOT SET") . "\n";
    echo "4. DB_USER: " . (defined('DB_USER') ? DB_USER : "NOT SET") . "\n";
    echo "5. DB_PASS: " . (defined('DB_PASS') ? (strlen(DB_PASS) > 0 ? "SET (length=".strlen(DB_PASS).")" : "EMPTY") : "NOT SET") . "\n";
} else {
    echo "2. .env.php NOT FOUND at secure path\n";
}

echo "\n--- Connection attempts ---\n";
$db   = defined('DB_NAME') ? DB_NAME : 'afshxhoj_persianhub';
$user = defined('DB_USER') ? DB_USER : 'afshxhoj_afshin';
$pass = defined('DB_PASS') ? DB_PASS : '';

foreach (['127.0.0.1', 'localhost'] as $host) {
    try {
        $pdo = new PDO("mysql:host=$host;port=3306;dbname=$db;charset=utf8mb4", $user, $pass, [PDO::ATTR_TIMEOUT => 3]);
        echo "CONNECTED via $host\n";
        echo "Businesses in DB: " . $pdo->query("SELECT COUNT(*) FROM businesses")->fetchColumn() . "\n";
        // Check charset
        $vars = $pdo->query("SHOW VARIABLES LIKE 'character_set%'")->fetchAll(PDO::FETCH_KEY_PAIR);
        foreach ($vars as $k => $v) echo "$k = $v\n";
        $col = $pdo->query("SELECT CHARACTER_MAXIMUM_LENGTH, CHARACTER_SET_NAME, COLLATION_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME='businesses' AND COLUMN_NAME='name_fa' AND TABLE_SCHEMA=DATABASE()")->fetch();
        echo "name_fa column charset: " . ($col['CHARACTER_SET_NAME'] ?? 'unknown') . " / " . ($col['COLLATION_NAME'] ?? 'unknown') . "\n";
        break;
    } catch (PDOException $e) {
        echo "FAILED via $host: " . $e->getMessage() . "\n";
    }
}
