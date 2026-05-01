<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

function auth_user(): ?array {
    $token = bearer_token();
    return $token ? jwt_verify($token) : null;
}
function is_admin(?array $u): bool {
    return $u && in_array($u['role'] ?? '', ['admin', 'superadmin']);
}

// Ensure table exists
$pdo->exec("CREATE TABLE IF NOT EXISTS business_claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT NOT NULL,
    user_id INT,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    is_owner TINYINT(1) NOT NULL DEFAULT 0,
    message TEXT,
    status ENUM('pending','resolved') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)");
// Ensure user_email column exists (migration for tables created before this column was added)
try { $pdo->exec("ALTER TABLE business_claims ADD COLUMN user_email VARCHAR(255) AFTER user_name"); } catch (\Exception $e) {}

if ($method === 'GET') {
    $user = auth_user();
    if (!is_admin($user)) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit(); }

    $status = $_GET['status'] ?? 'pending';
    $stmt = $pdo->prepare("
        SELECT bc.*, b.name AS business_name, b.category, b.country, b.canton
        FROM business_claims bc
        LEFT JOIN businesses b ON b.id = bc.business_id
        WHERE bc.status = :status
        ORDER BY bc.created_at DESC
    ");
    $stmt->execute([':status' => $status]);
    echo json_encode($stmt->fetchAll());
    exit();
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $user = auth_user();

    $business_id = (int)($body['business_id'] ?? 0);
    if (!$business_id) { http_response_code(400); echo json_encode(['error' => 'Missing business_id']); exit(); }

    $is_owner = !empty($body['is_owner']) ? 1 : 0;
    $message  = trim($body['message'] ?? '');

    if (!$is_owner && !$message) {
        http_response_code(400);
        echo json_encode(['error' => 'Please check the ownership box or provide a message']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO business_claims (business_id, user_id, user_name, user_email, is_owner, message) VALUES (:bid, :uid, :uname, :uemail, :is_owner, :message)");
    $stmt->execute([
        ':bid'      => $business_id,
        ':uid'      => $user ? $user['id'] : null,
        ':uname'    => $user ? $user['name'] : ($body['name'] ?? null),
        ':uemail'   => $user ? $user['email'] : ($body['email'] ?? null),
        ':is_owner' => $is_owner,
        ':message'  => $message ?: null,
    ]);

    echo json_encode(['success' => true]);
    exit();
}

if ($method === 'PATCH') {
    $user = auth_user();
    if (!is_admin($user)) { http_response_code(403); exit(); }
    $body = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE business_claims SET status = :status WHERE id = :id");
    $stmt->execute([':status' => $body['status'], ':id' => (int)$body['id']]);
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(405);
