<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: fetch locations for current user (or specific user for superadmin) ──
if ($method === 'GET') {
    $token    = bearer_token();
    $authUser = $token ? jwt_verify($token) : null;
    if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit(); }

    $targetId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : (int)$authUser['sub'];

    // Only superadmin can query other users' locations
    if ($targetId !== (int)$authUser['sub'] && ($authUser['role'] ?? '') !== 'superadmin') {
        http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit();
    }

    $userLocs = $pdo->prepare("SELECT country, city FROM user_locations WHERE user_id = :uid ORDER BY country, city");
    $userLocs->execute([':uid' => $targetId]);

    $adminLocs = $pdo->prepare("SELECT country, city FROM admin_locations WHERE user_id = :uid ORDER BY country, city");
    $adminLocs->execute([':uid' => $targetId]);

    echo json_encode([
        'user_locations'  => $userLocs->fetchAll(PDO::FETCH_ASSOC),
        'admin_locations' => $adminLocs->fetchAll(PDO::FETCH_ASSOC),
    ]);
    exit();
}

// ── PUT: user updates their own interest locations ────────────────────────────
if ($method === 'PUT') {
    $token    = bearer_token();
    $authUser = $token ? jwt_verify($token) : null;
    if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit(); }

    $data      = json_decode(file_get_contents('php://input'), true);
    $locations = $data['locations'] ?? []; // array of {country, city}
    $userId    = (int)$authUser['sub'];

    // Delete existing and replace
    $pdo->prepare("DELETE FROM user_locations WHERE user_id = :uid")->execute([':uid' => $userId]);

    $ins = $pdo->prepare("INSERT IGNORE INTO user_locations (user_id, country, city) VALUES (:uid, :country, :city)");
    foreach ($locations as $loc) {
        if (!empty($loc['country']) && !empty($loc['city'])) {
            $ins->execute([':uid' => $userId, ':country' => $loc['country'], ':city' => $loc['city']]);
        }
    }

    echo json_encode(['success' => true]);
    exit();
}

// ── PATCH: superadmin sets admin_locations for another user ──────────────────
if ($method === 'PATCH') {
    $token    = bearer_token();
    $authUser = $token ? jwt_verify($token) : null;
    if (!$authUser || ($authUser['role'] ?? '') !== 'superadmin') {
        http_response_code(403); echo json_encode(['error' => 'Superadmin only']); exit();
    }

    $data      = json_decode(file_get_contents('php://input'), true);
    $targetId  = (int)($data['user_id'] ?? 0);
    $locations = $data['locations'] ?? []; // array of {country, city}

    if (!$targetId) { http_response_code(400); echo json_encode(['error' => 'user_id required']); exit(); }

    $pdo->prepare("DELETE FROM admin_locations WHERE user_id = :uid")->execute([':uid' => $targetId]);

    $ins = $pdo->prepare("INSERT IGNORE INTO admin_locations (user_id, country, city) VALUES (:uid, :country, :city)");
    foreach ($locations as $loc) {
        if (!empty($loc['country']) && !empty($loc['city'])) {
            $ins->execute([':uid' => $targetId, ':country' => $loc['country'], ':city' => $loc['city']]);
        }
    }

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
