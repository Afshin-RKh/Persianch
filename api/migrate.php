<?php
require_once 'config.php';

$results = [];

// Rename city column to canton if city still exists
try {
    $pdo->exec("ALTER TABLE businesses CHANGE COLUMN city canton VARCHAR(100) DEFAULT NULL");
    $results[] = "Renamed city column to canton";
} catch (PDOException $e) {
    $results[] = "city rename skipped: " . $e->getMessage();
}

// Add canton column if it doesn't exist (in case city was already renamed or column was added separately)
try {
    $pdo->exec("ALTER TABLE businesses ADD COLUMN canton VARCHAR(100) DEFAULT NULL AFTER city");
    $results[] = "Added canton column";
} catch (PDOException $e) {
    $results[] = "canton column already exists (skipped)";
}

echo json_encode(['done' => true, 'results' => $results]);
