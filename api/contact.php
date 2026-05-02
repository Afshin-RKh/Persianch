<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mailer.php';

$pdo->exec("CREATE TABLE IF NOT EXISTS contact_messages (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(128) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    message    TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

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
