<?php
require_once 'config.php';
require_once 'jwt.php';

// Exchange the HttpOnly oauth_token cookie for a JSON response, then clear it.
// Called by the frontend /auth/callback page immediately on load.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit();
}

$token = $_COOKIE['oauth_token'] ?? '';
if (!$token) {
    http_response_code(404);
    echo json_encode(['error' => 'No pending OAuth token']);
    exit();
}

// Validate it is a real JWT before handing it out
$payload = jwt_verify($token);
if (!$payload) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid token']);
    exit();
}

// Clear the cookie
setcookie('oauth_token', '', [
    'expires'  => time() - 3600,
    'path'     => '/',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);

// Fetch full user profile
$stmt = $pdo->prepare("SELECT id, name, email, phone, role, avatar FROM users WHERE id = :id");
$stmt->execute([':id' => (int)$payload['sub']]);
$user = $stmt->fetch();

echo json_encode(['token' => $token, 'user' => $user ?: null]);
