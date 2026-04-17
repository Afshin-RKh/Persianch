<?php
require_once 'config.php';

$results = [];

// Add canton column if it doesn't exist
try {
    $pdo->exec("ALTER TABLE businesses ADD COLUMN canton VARCHAR(100) DEFAULT NULL AFTER city");
    $results[] = "Added canton column";
} catch (PDOException $e) {
    $results[] = "canton column already exists (skipped)";
}

echo json_encode(['done' => true, 'results' => $results]);
