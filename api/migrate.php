<?php
require_once 'config.php';

$results = [];

// 1. Drop legacy city column if it still exists (canton is the correct column)
try {
    $cols = $pdo->query("SHOW COLUMNS FROM businesses LIKE 'city'")->fetchAll();
    if (count($cols) > 0) {
        $pdo->exec("ALTER TABLE businesses DROP COLUMN city");
        $results[] = "Dropped legacy city column";
    } else {
        $results[] = "city column: already removed";
    }
} catch (PDOException $e) {
    $results[] = "city column error: " . $e->getMessage();
}

// 2. Convert businesses table to utf8mb4
try {
    $pdo->exec("ALTER TABLE businesses CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $results[] = "Converted businesses table to utf8mb4";
} catch (PDOException $e) {
    $results[] = "businesses utf8mb4 error: " . $e->getMessage();
}

// 3. Convert blog_posts table to utf8mb4
try {
    $pdo->exec("ALTER TABLE blog_posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $results[] = "Converted blog_posts table to utf8mb4";
} catch (PDOException $e) {
    $results[] = "blog_posts utf8mb4 error: " . $e->getMessage();
}

echo json_encode(['done' => true, 'results' => $results]);
