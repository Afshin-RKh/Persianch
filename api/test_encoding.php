<?php
header('Content-Type: text/plain; charset=utf-8');

// --- PHP encoding diagnostics ---
echo "=== PHP Encoding ===\n";
echo "mb_internal_encoding: " . mb_internal_encoding() . "\n";
echo "default_charset (ini): " . ini_get('default_charset') . "\n";
echo "mbstring.internal_encoding: " . ini_get('mbstring.internal_encoding') . "\n";

// --- Test string hardcoded in this PHP file ---
$hardcoded = "آزمایش فارسی";
echo "\n=== Hardcoded Persian string ===\n";
echo "Value: $hardcoded\n";
echo "strlen: " . strlen($hardcoded) . "\n";
echo "mb_strlen: " . mb_strlen($hardcoded, 'UTF-8') . "\n";
echo "mb_detect_encoding: " . mb_detect_encoding($hardcoded, ['UTF-8','ISO-8859-1','Windows-1252'], true) . "\n";
echo "hex: " . bin2hex($hardcoded) . "\n";

// --- DB connection with explicit SET NAMES ---
$envFile = '/home/afshxhoj/repositories/Persianch1/.env.php';
if (file_exists($envFile)) require_once $envFile;

$db   = defined('DB_NAME') ? DB_NAME : 'afshxhoj_persianhub';
$user = defined('DB_USER') ? DB_USER : 'afshxhoj_afshin';
$pass = defined('DB_PASS') ? DB_PASS : '';

try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Explicit SET NAMES
    $pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("SET character_set_client = utf8mb4");
    $pdo->exec("SET character_set_connection = utf8mb4");
    $pdo->exec("SET character_set_results = utf8mb4");

    echo "\n=== DB charset vars after explicit SET ===\n";
    $vars = $pdo->query("SHOW VARIABLES LIKE 'character_set%'")->fetchAll(PDO::FETCH_KEY_PAIR);
    foreach ($vars as $k => $v) echo "$k = $v\n";

    // Insert test row with hardcoded Persian
    $pdo->exec("DELETE FROM businesses WHERE name = '__encoding_test__'");
    $stmt = $pdo->prepare("INSERT INTO businesses (name, name_fa, category, is_approved) VALUES ('__encoding_test__', :nfa, 'other', 0)");
    $stmt->execute([':nfa' => $hardcoded]);
    $id = $pdo->lastInsertId();

    // Read back
    $row = $pdo->query("SELECT name_fa, HEX(name_fa) as hex_val FROM businesses WHERE id = $id")->fetch();
    echo "\n=== Insert/read back test ===\n";
    echo "Inserted: $hardcoded\n";
    echo "Read back: " . $row['name_fa'] . "\n";
    echo "HEX in DB: " . $row['hex_val'] . "\n";
    echo "Match: " . ($row['name_fa'] === $hardcoded ? "YES" : "NO") . "\n";

    // Cleanup
    $pdo->exec("DELETE FROM businesses WHERE name = '__encoding_test__'");

} catch (PDOException $e) {
    echo "DB ERROR: " . $e->getMessage() . "\n";
}

// --- If POST data provided, test that too ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    echo "\n=== POST input ===\n";
    echo "Raw bytes (hex): " . bin2hex($raw) . "\n";
    $data = json_decode($raw, true);
    if (isset($data['name_fa'])) {
        echo "name_fa value: " . $data['name_fa'] . "\n";
        echo "name_fa hex: " . bin2hex($data['name_fa']) . "\n";
        echo "name_fa mb_detect: " . mb_detect_encoding($data['name_fa'], ['UTF-8','ISO-8859-1','Windows-1252'], true) . "\n";
    }
}
