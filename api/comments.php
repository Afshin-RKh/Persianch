<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $type = $_GET['entity_type'] ?? '';
    $eid  = (int)($_GET['entity_id'] ?? 0);
    if (!in_array($type, ['blog', 'business']) || !$eid) {
        http_response_code(400);
        echo json_encode(['error' => 'entity_type and entity_id required']);
        exit();
    }
    $stmt = $pdo->prepare(
        "SELECT c.id, c.content, c.created_at, u.id as user_id, u.name as user_name, u.avatar
         FROM comments c JOIN users u ON c.user_id = u.id
         WHERE c.entity_type = :type AND c.entity_id = :eid
         ORDER BY c.created_at ASC"
    );
    $stmt->execute([':type' => $type, ':eid' => $eid]);
    echo json_encode($stmt->fetchAll());
    exit();
}

if ($method === 'POST') {
    $authUser = auth_required_db($pdo, 'user');
    $data     = json_decode(file_get_contents('php://input'), true);
    $type     = $data['entity_type'] ?? '';
    $eid      = (int)($data['entity_id'] ?? 0);
    $content  = trim($data['content'] ?? '');

    if (!in_array($type, ['blog', 'business']) || !$eid || !$content) {
        http_response_code(400);
        echo json_encode(['error' => 'entity_type, entity_id and content required']);
        exit();
    }
    if (mb_strlen($content) > 2000) {
        http_response_code(400);
        echo json_encode(['error' => 'Comment too long (max 2000 characters)']);
        exit();
    }

    $stmt = $pdo->prepare(
        "INSERT INTO comments (user_id, entity_type, entity_id, content) VALUES (:uid, :type, :eid, :content)"
    );
    $stmt->execute([':uid' => $authUser['sub'], ':type' => $type, ':eid' => $eid, ':content' => $content]);
    $id = $pdo->lastInsertId();

    $row = $pdo->prepare("SELECT c.id, c.content, c.created_at, u.id as user_id, u.name as user_name, u.avatar FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = :id");
    $row->execute([':id' => $id]);
    echo json_encode($row->fetch());
    exit();
}

if ($method === 'DELETE') {
    $authUser = auth_required_db($pdo, 'user');
    $id       = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    $stmt = $pdo->prepare("SELECT user_id FROM comments WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $comment = $stmt->fetch();
    if (!$comment) { http_response_code(404); echo json_encode(['error' => 'Not found']); exit(); }

    $hierarchy = ['user' => 0, 'admin' => 1, 'superadmin' => 2];
    $isAdmin   = ($hierarchy[$authUser['role']] ?? 0) >= 1;
    if ($comment['user_id'] !== $authUser['sub'] && !$isAdmin) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit();
    }

    $pdo->prepare("DELETE FROM comments WHERE id = :id")->execute([':id' => $id]);
    echo json_encode(['success' => true]);
    exit();
}
