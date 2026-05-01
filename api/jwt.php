<?php
if (!defined('JWT_SECRET')) {
    $jwtKey = defined('JWT_SECRET_KEY') ? JWT_SECRET_KEY : '';
    if (!$jwtKey || $jwtKey === 'replace-in-env' || strlen($jwtKey) < 32) {
        http_response_code(500);
        echo json_encode(['error' => 'Server misconfiguration']);
        exit();
    }
    define('JWT_SECRET', $jwtKey);
}
define('JWT_TTL', 7 * 24 * 3600);

function _b64u_encode(string $s): string {
    return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}
function _b64u_decode(string $s): string {
    return base64_decode(strtr($s, '-_', '+/'));
}

function jwt_sign(array $payload): string {
    $header  = _b64u_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = _b64u_encode(json_encode($payload));
    $sig     = _b64u_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$sig";
}

function jwt_verify(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $payload, $sig] = $parts;
    $expected = _b64u_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $data = json_decode(_b64u_decode($payload), true);
    if (!$data || ($data['exp'] ?? 0) < time()) return null;
    return $data;
}

function bearer_token(): ?string {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    return (substr($h, 0, 7) === 'Bearer ') ? substr($h, 7) : null;
}

function auth_required(string $min_role = 'user'): array {
    $token = bearer_token();
    $user  = $token ? jwt_verify($token) : null;
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    $hierarchy = ['user' => 0, 'admin' => 1, 'superadmin' => 2];
    $required  = $hierarchy[$min_role] ?? 0;
    $actual    = $hierarchy[$user['role']] ?? 0;
    if ($actual < $required) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit();
    }
    return $user;
}
