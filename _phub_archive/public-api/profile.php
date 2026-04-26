<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $token    = bearer_token();
    $authUser = $token ? jwt_verify($token) : null;
    if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit(); }

    $userId = (int)$authUser['sub'];

    $stmt = $pdo->prepare("SELECT id, name, email, role, avatar, created_at FROM users WHERE id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();
    if (!$user) { http_response_code(404); echo json_encode(['error' => 'Not found']); exit(); }

    // Interest locations
    $s = $pdo->prepare("SELECT country, city FROM user_locations WHERE user_id = :uid ORDER BY country, city");
    $s->execute([':uid' => $userId]);
    $user['interest_locations'] = $s->fetchAll();

    // Blog posts
    $s = $pdo->prepare("SELECT id, title, slug, status, created_at FROM blog_posts WHERE author_id = :uid ORDER BY created_at DESC");
    $s->execute([':uid' => $userId]);
    $user['blog_posts'] = $s->fetchAll();

    // Comments
    $s = $pdo->prepare("SELECT id, content, entity_type, entity_id, created_at FROM comments WHERE user_id = :uid ORDER BY created_at DESC LIMIT 20");
    $s->execute([':uid' => $userId]);
    $user['comments'] = $s->fetchAll();

    // Admin: admin_locations + activity log
    if (in_array($authUser['role'], ['admin', 'superadmin'])) {
        $s = $pdo->prepare("SELECT country, city FROM admin_locations WHERE user_id = :uid ORDER BY country, city");
        $s->execute([':uid' => $userId]);
        $user['admin_locations'] = $s->fetchAll();

        $s = $pdo->prepare("SELECT action, entity_type, entity_id, entity_name, created_at FROM activity_log WHERE user_id = :uid ORDER BY created_at DESC LIMIT 50");
        $s->execute([':uid' => $userId]);
        $user['activity_log'] = $s->fetchAll();
    }

    // Business owner: their assigned business
    if ($authUser['role'] === 'business_owner') {
        $s = $pdo->prepare("SELECT id, name, name_fa, category, country, canton, address, phone, website, email, instagram, description, description_fa, google_maps_url, image_url, logo_url, is_approved FROM businesses WHERE owner_user_id = :uid LIMIT 1");
        $s->execute([':uid' => $userId]);
        $user['owned_business'] = $s->fetch() ?: null;
    }

    echo json_encode($user);
    exit();
}

if ($method === 'PATCH') {
    $token    = bearer_token();
    $authUser = $token ? jwt_verify($token) : null;
    if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit(); }

    $data   = json_decode(file_get_contents('php://input'), true);
    $userId = (int)$authUser['sub'];

    $fields = [];
    $params = [':id' => $userId];

    if (!empty($data['name'])) {
        $fields[] = "name = :name";
        $params[':name'] = trim($data['name']);
    }
    if (!empty($data['password'])) {
        if (strlen($data['password']) < 8) {
            http_response_code(400); echo json_encode(['error' => 'Password must be at least 8 characters']); exit();
        }
        $fields[] = "password_hash = :password_hash";
        $params[':password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
    }
    if (array_key_exists('avatar', $data)) {
        $fields[] = "avatar = :avatar";
        $params[':avatar'] = $data['avatar'] ?: null;
    }

    if (!empty($fields)) {
        $pdo->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id")->execute($params);
    }

    // Update interest locations
    if (isset($data['locations']) && is_array($data['locations'])) {
        $pdo->prepare("DELETE FROM user_locations WHERE user_id = :uid")->execute([':uid' => $userId]);
        $ins = $pdo->prepare("INSERT IGNORE INTO user_locations (user_id, country, city) VALUES (:uid, :country, :city)");
        foreach ($data['locations'] as $loc) {
            if (!empty($loc['country']) && !empty($loc['city'])) {
                $ins->execute([':uid' => $userId, ':country' => $loc['country'], ':city' => $loc['city']]);
            }
        }
    }

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
