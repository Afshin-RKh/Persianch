<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $authUser = auth_required('admin');

    $users = $pdo->query(
        "SELECT u.id, u.name, u.email, u.role, u.avatar, u.created_at,
                COUNT(DISTINCT b.id) as blog_count,
                COUNT(DISTINCT c.id) as comment_count
         FROM users u
         LEFT JOIN blog_posts b ON b.author_id = u.id
         LEFT JOIN comments c ON c.user_id = u.id
         GROUP BY u.id
         ORDER BY u.created_at DESC"
    )->fetchAll();

    echo json_encode($users);
    exit();
}

if ($method === 'PATCH') {
    $authUser = auth_required('superadmin');
    $data     = json_decode(file_get_contents('php://input'), true);
    $id       = (int)($data['id'] ?? 0);
    $role     = $data['role'] ?? '';

    if (!$id || !in_array($role, ['user', 'admin', 'superadmin'])) {
        http_response_code(400);
        echo json_encode(['error' => 'id and valid role required']);
        exit();
    }
    if ($id === $authUser['sub']) {
        http_response_code(400);
        echo json_encode(['error' => 'Cannot change your own role']);
        exit();
    }

    $pdo->prepare("UPDATE users SET role = :role WHERE id = :id")->execute([':role' => $role, ':id' => $id]);
    echo json_encode(['success' => true]);
    exit();
}

if ($method === 'DELETE') {
    $authUser = auth_required('superadmin');
    $id       = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }
    if ($id === $authUser['sub']) { http_response_code(400); echo json_encode(['error' => 'Cannot delete yourself']); exit(); }

    $pdo->prepare("DELETE FROM users WHERE id = :id")->execute([':id' => $id]);
    echo json_encode(['success' => true]);
    exit();
}
