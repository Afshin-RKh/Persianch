<?php
require_once 'jwt.php';
require_once __DIR__ . '/config.php';

$clientId     = defined('GOOGLE_CLIENT_ID') ? GOOGLE_CLIENT_ID : '';
$clientSecret = defined('GOOGLE_CLIENT_SECRET') ? GOOGLE_CLIENT_SECRET : '';
$redirectUri  = defined('GOOGLE_REDIRECT_URI') ? GOOGLE_REDIRECT_URI : 'https://birunimap.com/api/auth_google_callback.php';
$frontendUrl  = defined('FRONTEND_URL') ? FRONTEND_URL : 'https://birunimap.com';

function redirect_error(string $msg, string $frontendUrl): void {
    header('Location: ' . $frontendUrl . '/auth/signin?error=' . urlencode($msg));
    exit();
}

// Validate state
$cookieState = $_COOKIE['oauth_state'] ?? '';
$queryState  = $_GET['state'] ?? '';
if (!$cookieState || !hash_equals($cookieState, $queryState)) {
    redirect_error('Invalid OAuth state', $frontendUrl);
}
setcookie('oauth_state', '', time() - 3600, '/');

$code = $_GET['code'] ?? '';
if (!$code) redirect_error('No authorization code', $frontendUrl);

// Exchange code for token
$resp = file_get_contents('https://oauth2.googleapis.com/token', false, stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => 'Content-Type: application/x-www-form-urlencoded',
        'content' => http_build_query([
            'code'          => $code,
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri'  => $redirectUri,
            'grant_type'    => 'authorization_code',
        ]),
    ],
]));

if (!$resp) redirect_error('Token exchange failed', $frontendUrl);
$tokens = json_decode($resp, true);
if (empty($tokens['access_token'])) redirect_error('No access token', $frontendUrl);

// Get user info
$userInfo = file_get_contents('https://www.googleapis.com/oauth2/v2/userinfo', false, stream_context_create([
    'http' => ['header' => 'Authorization: Bearer ' . $tokens['access_token']],
]));
if (!$userInfo) redirect_error('Failed to get user info', $frontendUrl);
$gUser = json_decode($userInfo, true);

$googleId = $gUser['id'] ?? '';
$email    = strtolower(trim($gUser['email'] ?? ''));
$name     = $gUser['name'] ?? $email;
$avatar   = $gUser['picture'] ?? null;

if (!$googleId || !$email) redirect_error('Incomplete Google profile', $frontendUrl);

// Find or create user
$stmt = $pdo->prepare("SELECT id, name, role FROM users WHERE google_id = :gid OR email = :email LIMIT 1");
$stmt->execute([':gid' => $googleId, ':email' => $email]);
$user = $stmt->fetch();

if ($user) {
    // Update google_id and avatar if needed
    $pdo->prepare("UPDATE users SET google_id = :gid, avatar = :avatar WHERE id = :id")
        ->execute([':gid' => $googleId, ':avatar' => $avatar, ':id' => $user['id']]);
    $userId = $user['id'];
    $role   = $user['role'];
    $uname  = $user['name'];
} else {
    $ins = $pdo->prepare("INSERT INTO users (name, email, google_id, avatar) VALUES (:name, :email, :gid, :avatar)");
    $ins->execute([':name' => $name, ':email' => $email, ':gid' => $googleId, ':avatar' => $avatar]);
    $userId = $pdo->lastInsertId();
    $role   = 'user';
    $uname  = $name;
}

$token = jwt_sign(['sub' => (int)$userId, 'role' => $role, 'name' => $uname, 'exp' => time() + JWT_TTL]);

// Pass token via short-lived HttpOnly cookie (not URL) to keep it out of browser history/logs
setcookie('oauth_token', $token, [
    'expires'  => time() + 120,   // 2-minute window to consume
    'path'     => '/',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);
header('Location: ' . $frontendUrl . '/auth/callback');
exit();
