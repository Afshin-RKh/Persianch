<?php
require_once 'config.php';

$results = [];

// 0. Add country column if it doesn't exist
try {
    $cols = $pdo->query("SHOW COLUMNS FROM businesses LIKE 'country'")->fetchAll();
    if (count($cols) === 0) {
        $pdo->exec("ALTER TABLE businesses ADD COLUMN country VARCHAR(100) DEFAULT 'Switzerland' AFTER canton");
        $pdo->exec("UPDATE businesses SET country = 'Switzerland' WHERE country IS NULL");
        $results[] = "Added country column, set all existing to Switzerland";
    } else {
        $results[] = "country column: already exists";
    }
} catch (PDOException $e) {
    $results[] = "country column error: " . $e->getMessage();
}

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

// 4. Create users table
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        name         VARCHAR(255) NOT NULL,
        email        VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role         ENUM('user','admin','superadmin') DEFAULT 'user',
        google_id    VARCHAR(255) UNIQUE,
        avatar       VARCHAR(500),
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $results[] = "users table: ready";
} catch (PDOException $e) {
    $results[] = "users table error: " . $e->getMessage();
}

// 5. Create comments table
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS comments (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        entity_type ENUM('blog','business') NOT NULL,
        entity_id   INT NOT NULL,
        content     TEXT NOT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $results[] = "comments table: ready";
} catch (PDOException $e) {
    $results[] = "comments table error: " . $e->getMessage();
}

// 6. Add author_id and status to blog_posts
try {
    $cols = $pdo->query("SHOW COLUMNS FROM blog_posts LIKE 'author_id'")->fetchAll();
    if (count($cols) === 0) {
        $pdo->exec("ALTER TABLE blog_posts
            ADD COLUMN author_id INT,
            ADD COLUMN status ENUM('pending','approved','rejected') DEFAULT 'pending'");
        $pdo->exec("UPDATE blog_posts SET status = IF(published=1,'approved','pending')");
        $results[] = "blog_posts: added author_id and status";
    } else {
        $results[] = "blog_posts author_id/status: already exists";
    }
} catch (PDOException $e) {
    $results[] = "blog_posts alter error: " . $e->getMessage();
}

// 7. Add tags, country, city to blog_posts — check each column separately
foreach (['tags' => 'VARCHAR(500)', 'country' => 'VARCHAR(100)', 'city' => 'VARCHAR(100)'] as $col => $def) {
    try {
        $exists = $pdo->query("SHOW COLUMNS FROM blog_posts LIKE '$col'")->fetchAll();
        if (count($exists) === 0) {
            $pdo->exec("ALTER TABLE blog_posts ADD COLUMN $col $def");
            $results[] = "blog_posts: added column $col";
        } else {
            $results[] = "blog_posts.$col: already exists";
        }
    } catch (PDOException $e) {
        $results[] = "blog_posts.$col error: " . $e->getMessage();
    }
}

// 8. Create user_locations table (user's interest areas — user-editable)
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_locations (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT NOT NULL,
        country    VARCHAR(100) NOT NULL,
        city       VARCHAR(100) NOT NULL,
        UNIQUE KEY uq_user_location (user_id, country, city),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $results[] = "user_locations table: ready";
} catch (PDOException $e) {
    $results[] = "user_locations table error: " . $e->getMessage();
}

// 9. Create admin_locations table (admin's allowed management areas — superadmin-set)
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS admin_locations (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT NOT NULL,
        country    VARCHAR(100) NOT NULL,
        city       VARCHAR(100) NOT NULL,
        UNIQUE KEY uq_admin_location (user_id, country, city),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $results[] = "admin_locations table: ready";
} catch (PDOException $e) {
    $results[] = "admin_locations table error: " . $e->getMessage();
}

echo json_encode(['done' => true, 'results' => $results]);
