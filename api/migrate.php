<?php
require_once 'config.php';

$results = [];

// 1. Check if city column exists — if so, rename to canton
try {
    $cols = $pdo->query("SHOW COLUMNS FROM businesses LIKE 'city'")->fetchAll();
    if (count($cols) > 0) {
        $pdo->exec("ALTER TABLE businesses CHANGE COLUMN city canton VARCHAR(100) DEFAULT NULL");
        $results[] = "Renamed city column to canton";
    } else {
        $results[] = "city column: already renamed or never existed";
    }
} catch (PDOException $e) {
    $results[] = "city rename error: " . $e->getMessage();
}

// 2. Convert entire table to utf8mb4 so Persian/Arabic text stores correctly
try {
    $pdo->exec("ALTER TABLE businesses CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $results[] = "Converted table to utf8mb4";
} catch (PDOException $e) {
    $results[] = "utf8mb4 conversion error: " . $e->getMessage();
}

echo json_encode(['done' => true, 'results' => $results]);
