<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

// Helper: get optional auth user without requiring it
function optional_auth(): ?array {
    $token = bearer_token();
    return $token ? jwt_verify($token) : null;
}

if ($method === 'GET') {
    $viewer = optional_auth();
    $isAdmin = in_array($viewer['role'] ?? '', ['admin', 'superadmin']);

    if (!empty($_GET['id'])) {
        // Single post by id (admin use)
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

    // Public listing — approved only
    $stmt = $pdo->query("SELECT p.id, p.title, p.slug, p.cover_image, p.created_at, p.status, u.name as author_name FROM blog_posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.status = 'approved' ORDER BY p.created_at DESC");
    echo json_encode($stmt->fetchAll());
    exit();
}

if ($method === 'POST') {
    $authUser = auth_required('user');
    $data     = json_decode(file_get_contents('php://input'), true);

    $title = trim($data['title'] ?? '');
    if (!$title) { http_response_code(400); echo json_encode(['error' => 'Title required']); exit(); }

    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
    // Make slug unique
    $existing = $pdo->prepare("SELECT id FROM blog_posts WHERE slug = :slug");
    $existing->execute([':slug' => $slug]);
    if ($existing->fetch()) $slug .= '-' . time();

    $isAdmin = in_array($authUser['role'], ['admin', 'superadmin']);
    $status  = $isAdmin ? 'approved' : 'pending';

    $stmt = $pdo->prepare(
        "INSERT INTO blog_posts (title, title_fa, slug, content, content_fa, cover_image, author_id, status, published)
         VALUES (:title, :title_fa, :slug, :content, :content_fa, :cover_image, :author_id, :status, :published)"
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
    ]);

    echo json_encode(['success' => true, 'slug' => $slug, 'status' => $status]);
    exit();
}

if ($method === 'PATCH') {
    $authUser = auth_required('admin');
    $data     = json_decode(file_get_contents('php://input'), true);
    $id       = (int)($data['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    $allowed = ['title', 'title_fa', 'content', 'content_fa', 'cover_image', 'status'];
    $sets    = [];
    $params  = [':id' => $id];
    foreach ($allowed as $col) {
        if (array_key_exists($col, $data)) {
            $sets[]         = "$col = :$col";
            $params[":$col"] = $data[$col];
        }
    }
    if (empty($sets)) { http_response_code(400); echo json_encode(['error' => 'Nothing to update']); exit(); }

    // Sync published flag with status
    if (isset($data['status'])) {
        $sets[]              = "published = :published";
        $params[':published'] = $data['status'] === 'approved' ? 1 : 0;
    }

    $pdo->prepare("UPDATE blog_posts SET " . implode(', ', $sets) . " WHERE id = :id")->execute($params);
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
