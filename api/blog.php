<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

// Auto-migrate
try { $pdo->exec("ALTER TABLE blog_posts ADD COLUMN language VARCHAR(32) DEFAULT NULL"); } catch (PDOException $e) {}
try { $pdo->exec("ALTER TABLE blog_posts ADD COLUMN deleted_at DATETIME DEFAULT NULL"); } catch (PDOException $e) {}
try { $pdo->exec("ALTER TABLE blog_posts ADD COLUMN deleted_by INT DEFAULT NULL"); } catch (PDOException $e) {}

function optional_auth(): ?array {
    $token = bearer_token();
    return $token ? jwt_verify($token) : null;
}

function blog_admin_can_manage(PDO $pdo, int $userId, ?string $country, ?string $city): bool {
    if (!$country && !$city) return true; // unlocated post: any admin can touch it
    if (!$country) return true;
    if (!$city) {
        // country-only post: allow if admin manages any city in that country
        $stmt = $pdo->prepare("SELECT 1 FROM admin_locations WHERE user_id = :uid AND country = :country LIMIT 1");
        $stmt->execute([':uid' => $userId, ':country' => $country]);
        return (bool)$stmt->fetch();
    }
    $stmt = $pdo->prepare("SELECT 1 FROM admin_locations WHERE user_id = :uid AND country = :country AND city = :city LIMIT 1");
    $stmt->execute([':uid' => $userId, ':country' => $country, ':city' => $city]);
    return (bool)$stmt->fetch();
}

function log_blog_activity(PDO $pdo, int $userId, string $action, int $postId, ?string $postTitle, ?string $details = null): void {
    try {
        $pdo->prepare("INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_name, details) VALUES (:uid, :action, 'blog', :eid, :name, :details)")
            ->execute([':uid' => $userId, ':action' => $action, ':eid' => $postId, ':name' => $postTitle, ':details' => $details]);
    } catch (PDOException $e) { /* non-fatal */ }
}

if ($method === 'GET') {
    $viewer  = optional_auth();
    $isAdmin = in_array($viewer['role'] ?? '', ['admin', 'superadmin']);

    if (!empty($_GET['id'])) {
        if (!$isAdmin) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit(); }
        $stmt = $pdo->prepare("SELECT p.*, u.name as author_name FROM blog_posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.id = :id");
        $stmt->execute([':id' => (int)$_GET['id']]);
        echo json_encode($stmt->fetch() ?: null);
        exit();
    }

    if (!empty($_GET['slug'])) {
        $stmt = $pdo->prepare("SELECT p.*, u.name as author_name FROM blog_posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.slug = :slug AND p.status = 'approved' AND p.deleted_at IS NULL");
        $stmt->execute([':slug' => $_GET['slug']]);
        echo json_encode($stmt->fetch() ?: null);
        exit();
    }

    // Trash listing (admin only)
    if (!empty($_GET['trash']) && $isAdmin) {
        $stmt = $pdo->query("SELECT p.*, u.name as author_name, d.name as deleted_by_name FROM blog_posts p LEFT JOIN users u ON p.author_id = u.id LEFT JOIN users d ON p.deleted_by = d.id WHERE p.deleted_at IS NOT NULL ORDER BY p.deleted_at DESC");
        echo json_encode($stmt->fetchAll());
        exit();
    }

    if (!empty($_GET['pending']) && $isAdmin) {
        $stmt = $pdo->query("SELECT p.*, u.name as author_name FROM blog_posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.status = 'pending' AND p.deleted_at IS NULL ORDER BY p.created_at DESC");
        echo json_encode($stmt->fetchAll());
        exit();
    }

    // Public listing with optional tag / country / city filter
    $where  = ["p.status = 'approved'", "p.deleted_at IS NULL"];
    $params = [];

    if (!empty($_GET['tag'])) {
        $where[]        = "FIND_IN_SET(:tag, p.tags)";
        $params[':tag'] = $_GET['tag'];
    }
    if (!empty($_GET['country'])) {
        $where[]           = "p.country = :country";
        $params[':country'] = $_GET['country'];
    }
    if (!empty($_GET['city'])) {
        $where[]        = "p.city LIKE :city";
        $params[':city'] = '%' . $_GET['city'] . '%';
    }
    if (!empty($_GET['language'])) {
        $where[]            = "p.language = :language";
        $params[':language'] = $_GET['language'];
    }

    $sql  = "SELECT p.id, p.title, p.slug, p.cover_image, p.created_at, p.tags, p.country, p.city, p.language, u.name as author_name
             FROM blog_posts p LEFT JOIN users u ON p.author_id = u.id
             WHERE " . implode(' AND ', $where) . "
             ORDER BY p.created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
    exit();
}

if ($method === 'POST') {
    $authUser = auth_required('user');
    $data     = json_decode(file_get_contents('php://input'), true);

    $title = trim($data['title'] ?? '');
    if (!$title) { http_response_code(400); echo json_encode(['error' => 'Title required']); exit(); }

    // Strip any tags not produced by the TipTap editor to prevent stored XSS
    $allowedTags = '<p><br><b><strong><i><em><u><s><ul><ol><li><h1><h2><h3><h4><h5><h6><blockquote><pre><code><a><img><figure><figcaption><mark><span><div><hr><table><thead><tbody><tr><th><td>';
    $data['content']    = $data['content']    ? strip_tags($data['content'],    $allowedTags) : '';
    $data['content_fa'] = $data['content_fa'] ? strip_tags($data['content_fa'], $allowedTags) : null;

    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
    $existing = $pdo->prepare("SELECT id FROM blog_posts WHERE slug = :slug");
    $existing->execute([':slug' => $slug]);
    if ($existing->fetch()) $slug .= '-' . time();

    $isAdmin = in_array($authUser['role'], ['admin', 'superadmin']);
    $status  = $isAdmin ? 'approved' : 'pending';

    // Normalize tags
    $tags = $data['tags'] ?? null;
    if (is_array($tags)) $tags = implode(',', array_filter(array_map('trim', $tags)));

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO blog_posts (title, title_fa, slug, content, content_fa, cover_image, author_id, status, published, tags, country, city, language)
             VALUES (:title, :title_fa, :slug, :content, :content_fa, :cover_image, :author_id, :status, :published, :tags, :country, :city, :language)"
        );
        $stmt->execute([
            ':title'       => $title,
            ':title_fa'    => $data['title_fa'] ?? null,
            ':slug'        => $slug,
            ':content'     => $data['content'] ?? '',
            ':content_fa'  => $data['content_fa'] ?? null,
            ':cover_image' => $data['cover_image'] ?? null,
            ':author_id'   => $authUser['sub'],
            ':status'      => $status,
            ':published'   => $isAdmin ? 1 : 0,
            ':tags'        => $tags ?: null,
            ':country'     => $data['country'] ?? null,
            ':city'        => $data['city'] ?? null,
            ':language'    => $data['language'] ?? null,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save post']);
        exit();
    }

    $newId = (int)$pdo->lastInsertId();
    if ($isAdmin) {
        $adminName = $authUser['name'] ?? 'Admin';
        log_blog_activity($pdo, (int)$authUser['sub'], 'create', $newId, $title,
            "$adminName published post \"$title\"");
    }

    echo json_encode(['success' => true, 'slug' => $slug, 'status' => $status]);
    exit();
}

if ($method === 'PATCH') {
    $authUser  = auth_required('admin');
    $data      = json_decode(file_get_contents('php://input'), true);
    $id        = (int)($data['id'] ?? 0);
    $adminRole = $authUser['role'] ?? '';
    $adminId   = (int)$authUser['sub'];
    $adminName = $authUser['name'] ?? 'Admin';

    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    // Fetch post to check its location (handle restore action on trashed posts too)
    $isRestore = ($data['action'] ?? '') === 'restore';
    $trashFilter = $isRestore ? "p.deleted_at IS NOT NULL" : "p.deleted_at IS NULL";
    $postRow = $pdo->prepare("SELECT p.title, p.country, p.city, p.status FROM blog_posts p WHERE p.id = :id AND $trashFilter");
    $postRow->execute([':id' => $id]);
    $post = $postRow->fetch(PDO::FETCH_ASSOC);
    if (!$post) { http_response_code(404); echo json_encode(['error' => 'Post not found']); exit(); }

    // Restore from trash
    if ($isRestore) {
        $pdo->prepare("UPDATE blog_posts SET deleted_at = NULL, deleted_by = NULL WHERE id = :id")->execute([':id' => $id]);
        log_blog_activity($pdo, $adminId, 'restore', $id, $post['title'], "$adminName restored blog post \"{$post['title']}\"");
        echo json_encode(['success' => true]);
        exit();
    }

    // Location enforcement for non-superadmin
    if ($adminRole === 'admin') {
        $checkCountry = $data['country'] ?? $post['country'];
        $checkCity    = $data['city']    ?? $post['city'];
        if (!blog_admin_can_manage($pdo, $adminId, $checkCountry, $checkCity)) {
            http_response_code(403); echo json_encode(['error' => 'Not allowed to manage posts in this location']); exit();
        }
    }

    $allowedTags = '<p><br><b><strong><i><em><u><s><ul><ol><li><h1><h2><h3><h4><h5><h6><blockquote><pre><code><a><img><figure><figcaption><mark><span><div><hr><table><thead><tbody><tr><th><td>';
    if (isset($data['content']))    $data['content']    = strip_tags($data['content'],    $allowedTags);
    if (isset($data['content_fa'])) $data['content_fa'] = strip_tags($data['content_fa'], $allowedTags);

    $allowed = ['title', 'title_fa', 'content', 'content_fa', 'cover_image', 'status', 'country', 'city', 'language'];
    $sets    = [];
    $params  = [':id' => $id];

    foreach ($allowed as $col) {
        if (array_key_exists($col, $data)) {
            $sets[]          = "$col = :$col";
            $params[":$col"] = $data[$col];
        }
    }

    // Tags
    if (array_key_exists('tags', $data)) {
        $tags = $data['tags'];
        if (is_array($tags)) $tags = implode(',', array_filter(array_map('trim', $tags)));
        $sets[]          = "tags = :tags";
        $params[':tags'] = $tags ?: null;
    }

    if (empty($sets)) { http_response_code(400); echo json_encode(['error' => 'Nothing to update']); exit(); }

    if (isset($data['status'])) {
        $sets[]              = "published = :published";
        $params[':published'] = $data['status'] === 'approved' ? 1 : 0;
    }

    try {
        $pdo->prepare("UPDATE blog_posts SET " . implode(', ', $sets) . " WHERE id = :id")->execute($params);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update post']);
        exit();
    }

    $postTitle = $data['title'] ?? $post['title'];
    if (isset($data['status'])) {
        $action  = $data['status'] === 'approved' ? 'approve' : 'reject';
        $verb    = $data['status'] === 'approved' ? 'approved' : 'rejected';
        $details = "$adminName $verb blog post \"$postTitle\"";
    } else {
        $action  = 'update';
        $details = "$adminName edited blog post \"$postTitle\"";
    }
    log_blog_activity($pdo, $adminId, $action, $id, $postTitle, $details);

    echo json_encode(['success' => true]);
    exit();
}

if ($method === 'DELETE') {
    $authUser  = auth_required('admin');
    $id        = (int)($_GET['id'] ?? 0);
    $adminRole = $authUser['role'] ?? '';
    $adminId   = (int)$authUser['sub'];
    $adminName = $authUser['name'] ?? 'Admin';

    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    $isPermanent = !empty($_GET['permanent']);

    // For permanent delete, post may already be soft-deleted — fetch without filter
    $postRow = $pdo->prepare("SELECT title, country, city FROM blog_posts WHERE id = :id");
    $postRow->execute([':id' => $id]);
    $post = $postRow->fetch(PDO::FETCH_ASSOC);
    if (!$post) { http_response_code(404); echo json_encode(['error' => 'Post not found']); exit(); }

    // Location enforcement for non-superadmin
    if ($adminRole === 'admin') {
        if (!blog_admin_can_manage($pdo, $adminId, $post['country'], $post['city'])) {
            http_response_code(403); echo json_encode(['error' => 'Not allowed to manage posts in this location']); exit();
        }
    }

    if ($isPermanent) {
        log_blog_activity($pdo, $adminId, 'delete_permanent', $id, $post['title'],
            "$adminName permanently deleted blog post \"{$post['title']}\"");
        $pdo->prepare("DELETE FROM blog_posts WHERE id = :id")->execute([':id' => $id]);
    } else {
        log_blog_activity($pdo, $adminId, 'delete', $id, $post['title'],
            "$adminName moved blog post \"{$post['title']}\" to trash");
        $pdo->prepare("UPDATE blog_posts SET deleted_at = NOW(), deleted_by = :uid WHERE id = :id")
            ->execute([':uid' => $adminId, ':id' => $id]);
    }

    echo json_encode(['success' => true]);
    exit();
}
