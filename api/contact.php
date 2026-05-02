<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mailer.php';

$pdo->exec("CREATE TABLE IF NOT EXISTS contact_messages (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(128) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    message    TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
// Add deleted_at if upgrading from old schema
try { $pdo->exec("ALTER TABLE contact_messages ADD COLUMN deleted_at DATETIME DEFAULT NULL"); } catch (PDOException $e) {}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    require_once __DIR__ . '/jwt.php';
    $token = bearer_token();
    $user  = $token ? jwt_verify($token) : null;
    if (!$user || !in_array($user['role'], ['admin', 'superadmin'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit();
    }
    $trash = isset($_GET['trash']);
    if ($trash) {
        $rows = $pdo->query("SELECT id, name, email, message, created_at, deleted_at FROM contact_messages WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC")->fetchAll();
    } else {
        $rows = $pdo->query("SELECT id, name, email, message, created_at FROM contact_messages WHERE deleted_at IS NULL ORDER BY created_at DESC")->fetchAll();
    }
    echo json_encode($rows);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    require_once __DIR__ . '/jwt.php';
    $token = bearer_token();
    $user  = $token ? jwt_verify($token) : null;
    if (!$user || !in_array($user['role'], ['admin', 'superadmin'])) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit();
    }
    $id      = (int)($_GET['id'] ?? 0);
    $perm    = isset($_GET['permanent']);
    if (!$id) { http_response_code(422); echo json_encode(['error' => 'Missing id']); exit(); }
    if ($perm) {
        $pdo->prepare("DELETE FROM contact_messages WHERE id = ?")->execute([$id]);
    } else {
        $pdo->prepare("UPDATE contact_messages SET deleted_at = NOW() WHERE id = ?")->execute([$id]);
    }
    echo json_encode(['ok' => true]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    require_once __DIR__ . '/jwt.php';
    $token = bearer_token();
    $user  = $token ? jwt_verify($token) : null;
    if (!$user || !in_array($user['role'], ['admin', 'superadmin'])) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit();
    }
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = (int)($body['id'] ?? 0);
    if (!$id) { http_response_code(422); echo json_encode(['error' => 'Missing id']); exit(); }
    $pdo->prepare("UPDATE contact_messages SET deleted_at = NULL WHERE id = ?")->execute([$id]);
    echo json_encode(['ok' => true]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$body = json_decode(file_get_contents('php://input'), true);
$name    = trim($body['name']    ?? '');
$email   = trim($body['email']   ?? '');
$message = trim($body['message'] ?? '');

if (!$name || !$email || !$message) {
    http_response_code(422);
    echo json_encode(['error' => 'All fields are required.']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['error' => 'Invalid email address.']);
    exit();
}

$name    = htmlspecialchars($name,    ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// Store in DB
$stmt = $pdo->prepare("
    INSERT INTO contact_messages (name, email, message, created_at)
    VALUES (:name, :email, :message, NOW())
");
$stmt->execute([':name' => $name, ':email' => $email, ':message' => $message]);

// Send confirmation email to the user
$confirmBody = <<<TEXT
Hi $name,

Thank you for reaching out to BiruniMap! We received your message and will get back to you soon.

While you wait, did you know you can personalise your BiruniMap experience?

By setting your interest locations on your profile, we'll notify you whenever a new business or event is added near you — so you never miss what's happening in your community.

👉 Sign up or log in at https://birunimap.com/auth/signup
   Then go to My Profile → My Locations to set your areas of interest.

Talk soon,
The BiruniMap Team
noreply@birunimap.com
TEXT;

send_email($email, $name, 'We received your message — BiruniMap', $confirmBody);

echo json_encode(['ok' => true]);
