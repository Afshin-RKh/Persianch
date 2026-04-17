<?php
require_once 'config.php';

$results = [];

// Check if city column exists — if so, rename to canton
try {
    $cols = $pdo->query("SHOW COLUMNS FROM businesses LIKE 'city'")->fetchAll();
    if (count($cols) > 0) {
        $pdo->exec("ALTER TABLE businesses CHANGE COLUMN city canton VARCHAR(100) DEFAULT NULL");
        $results[] = "Renamed city column to canton";
    } else {
        $results[] = "city column not found — already renamed or never existed";
    }
} catch (PDOException $e) {
    $results[] = "Migration error: " . $e->getMessage();
}

echo json_encode(['done' => true, 'results' => $results]);
