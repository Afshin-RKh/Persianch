<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

function optional_auth(): ?array {
    $token = bearer_token();
    return $token ? jwt_verify($token) : null;
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
        $stmt = $pdo->prepare("SELECT p.*, u.name as author_name FROM blog_posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.slug = :slug AND p.status = 'approved'");
        $stmt->execute([':slug' => $_GET['slug']]);
        echo json_encode($stmt->fetch() ?: null);
        exit();
    }

    if (!empty($_GET['pending']) && $isAdmin) {
        $stmt = $pdo->query("SELECT p.*, u.name as author_name FROM blog_posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.status = 'pending' ORDER BY p.created_at DESC");
        echo json_encode($stmt->fetchAll());
        exit();
    }

    // Public listing with optional tag / country / city filter
    $where  = ["p.status = 'approved'"];
    $params = [];

    if (!empty($_GET['tag'])) {
        $where[]          = "FIND_IN_SET(:tag, p.tags)";
        $params[':tag']   = $_GET['tag'];
    }
    if (!empty($_GET['country'])) {
        $where[]             = "p.country = :country";
        $params[':country']  = $_GET['country'];
    }
    if (!empty($_GET['city'])) {
        $where[]          = "p.city LIKE :city";
        $params[':city']  = '%' . $_GET['city'] . '%';
    }

    $sql  = "SELECT p.id, p.title, p.slug, p.cover_image, p.created_at, p.tags, p.country, p.city, u.name as author_name
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

    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
    $existing = $pdo->prepare("SELECT id FROM blog_posts WHERE slug = :slug");
    $existing->execute([':slug' => $slug]);
    if ($existing->fetch()) $slug .= '-' . time();

    $isAdmin = in_array($authUser['role'], ['admin', 'superadmin']);
    $status  = $isAdmin ? 'approved' : 'pending';

    // Normalize tags: array or comma string → clean comma string
    $tags = $data['tags'] ?? null;
    if (is_array($tags)) $tags = implode(',', array_filter(array_map('trim', $tags)));

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO blog_posts (title, title_fa, slug, content, content_fa, cover_image, author_id, status, published, tags, country, city)
             VALUES (:title, :title_fa, :slug, :content, :content_fa, :cover_image, :author_id, :status, :published, :tags, :country, :city)"
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
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save post: ' . $e->getMessage()]);
        exit();
    }

    echo json_encode(['success' => true, 'slug' => $slug, 'status' => $status]);
    exit();
}

if ($method === 'PATCH') {
    $authUser = auth_required('admin');
    $data     = json_decode(file_get_contents('php://input'), true);
    $id       = (int)($data['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    $allowed = ['title', 'title_fa', 'content', 'content_fa', 'cover_image', 'status', 'country', 'city'];
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
        $sets[]         = "tags = :tags";
        $params[':tags'] = $tags ?: null;
    }

    if (empty($sets)) { http_response_code(400); echo json_encode(['error' => 'Nothing to update']); exit(); }

    if (isset($data['status'])) {
        $sets[]               = "published = :published";
        $params[':published']  = $data['status'] === 'approved' ? 1 : 0;
    }

    try {
        $pdo->prepare("UPDATE blog_posts SET " . implode(', ', $sets) . " WHERE id = :id")->execute($params);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update post: ' . $e->getMessage()]);
        exit();
    }
    echo json_encode(['success' => true]);
    exit();
}

if ($method === 'DELETE') {
    $authUser = auth_required('admin');
    $id       = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    $pdo->prepare("DELETE FROM blog_posts WHERE id = :id")->execute([':id' => $id]);
    echo json_encode(['success' => true]);
    exit();
}
