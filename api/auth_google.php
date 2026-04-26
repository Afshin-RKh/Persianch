<?php
$clientId    = defined('GOOGLE_CLIENT_ID') ? GOOGLE_CLIENT_ID : '';
$redirectUri = defined('GOOGLE_REDIRECT_URI') ? GOOGLE_REDIRECT_URI : 'https://birunimap.com/api/auth_google_callback.php';

if (!$clientId) {
    http_response_code(500);
    echo json_encode(['error' => 'Google OAuth not configured']);
    exit();
}

$state = bin2hex(random_bytes(16));
setcookie('oauth_state', $state, time() + 300, '/', '', true, true);

$params = http_build_query([
    'client_id'     => $clientId,
    'redirect_uri'  => $redirectUri,
    'response_type' => 'code',
    'scope'         => 'openid email profile',
    'state'         => $state,
    'prompt'        => 'select_account',
]);

header('Location: https://accounts.google.com/o/oauth2/v2/auth?' . $params);
exit();
