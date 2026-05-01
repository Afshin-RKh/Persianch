<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $authUser    = auth_required_db($pdo, 'admin');
    $isSuperAdmin = $authUser['role'] === 'superadmin';

    // Superadmin fetching a single user's full profile
    if ($isSuperAdmin && isset($_GET['user_id'])) {
        $uid = (int)$_GET['user_id'];
        $stmt = $pdo->prepare("SELECT id, name, email, role, avatar, created_at FROM users WHERE id = :id");
        $stmt->execute([':id' => $uid]);
        $u = $stmt->fetch();
        if (!$u) { http_response_code(404); echo json_encode(['error' => 'Not found']); exit(); }

        $s = $pdo->prepare("SELECT country, city FROM user_locations WHERE user_id = :uid ORDER BY country, city");
        $s->execute([':uid' => $uid]);
        $u['interest_locations'] = $s->fetchAll();

        $s = $pdo->prepare("SELECT id, title, slug, status, created_at FROM blog_posts WHERE author_id = :uid ORDER BY created_at DESC");
        $s->execute([':uid' => $uid]);
        $u['blog_posts'] = $s->fetchAll();

        $s = $pdo->prepare("SELECT id, content, entity_type, entity_id, created_at FROM comments WHERE user_id = :uid ORDER BY created_at DESC LIMIT 20");
        $s->execute([':uid' => $uid]);
        $u['comments'] = $s->fetchAll();

        if (in_array($u['role'], ['admin', 'superadmin'])) {
            $s = $pdo->prepare("SELECT country, city FROM admin_locations WHERE user_id = :uid ORDER BY country, city");
            $s->execute([':uid' => $uid]);
            $u['admin_locations'] = $s->fetchAll();

            $s = $pdo->prepare("SELECT action, entity_type, entity_id, entity_name, details, created_at FROM activity_log WHERE user_id = :uid ORDER BY created_at DESC LIMIT 50");
            $s->execute([':uid' => $uid]);
            $u['activity_log'] = $s->fetchAll();
        }

        if ($u['role'] === 'business_owner') {
            $s = $pdo->prepare("SELECT id, name, category, country, canton, is_approved FROM businesses WHERE owner_user_id = :uid ORDER BY name");
            $s->execute([':uid' => $uid]);
            $u['owned_businesses'] = $s->fetchAll();
        }

        echo json_encode($u);
        exit();
    }

    // List users — superadmin sees all, admins see only user/business_owner
    if ($isSuperAdmin) {
        $roleFilter = "";
    } else {
        $roleFilter = "WHERE u.role IN ('user','business_owner')";
    }

    $stmt = $pdo->query(
        "SELECT u.id, u.name, u.email, u.role, u.avatar, u.created_at,
                COUNT(DISTINCT bp.id) as blog_count,
                COUNT(DISTINCT c.id)  as comment_count,
                (SELECT COUNT(*) FROM businesses WHERE owner_user_id = u.id) AS owned_businesses_count,
                (SELECT GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') FROM businesses WHERE owner_user_id = u.id) AS owned_businesses_names
         FROM users u
         LEFT JOIN blog_posts bp ON bp.author_id = u.id
         LEFT JOIN comments c    ON c.user_id    = u.id
         $roleFilter
         GROUP BY u.id
         ORDER BY u.created_at DESC"
    );
    echo json_encode($stmt->fetchAll());
    exit();
}

if ($method === 'PATCH') {
    $authUser = auth_required_db($pdo, 'superadmin');
    $data     = json_decode(file_get_contents('php://input'), true);
    $id       = (int)($data['id'] ?? 0);
    $role     = $data['role'] ?? '';

    if (!$id || !in_array($role, ['user', 'business_owner', 'admin'])) {
        http_response_code(400); echo json_encode(['error' => 'id and valid role required']); exit();
    }
    if ($id === (int)$authUser['sub']) {
        http_response_code(400); echo json_encode(['error' => 'Cannot change your own role']); exit();
    }

    $pdo->prepare("UPDATE users SET role = :role WHERE id = :id")->execute([':role' => $role, ':id' => $id]);

    if (isset($data['admin_locations']) && is_array($data['admin_locations'])) {
        $pdo->prepare("DELETE FROM admin_locations WHERE user_id = :uid")->execute([':uid' => $id]);
        $ins = $pdo->prepare("INSERT IGNORE INTO admin_locations (user_id, country, city) VALUES (:uid, :country, :city)");
        foreach ($data['admin_locations'] as $loc) {
            if (!empty($loc['country']) && !empty($loc['city'])) {
                $ins->execute([':uid' => $id, ':country' => $loc['country'], ':city' => $loc['city']]);
            }
        }
    }

    echo json_encode(['success' => true]);
    exit();
}

if ($method === 'DELETE') {
    $authUser = auth_required_db($pdo, 'superadmin');
    $id       = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }
    if ($id === (int)$authUser['sub']) { http_response_code(400); echo json_encode(['error' => 'Cannot delete yourself']); exit(); }

    // Explicitly remove all user-owned data (GDPR compliance / no orphaned rows)
    $pdo->prepare("DELETE FROM comments        WHERE user_id   = :id")->execute([':id' => $id]);
    $pdo->prepare("DELETE FROM business_claims WHERE user_id   = :id")->execute([':id' => $id]);
    $pdo->prepare("DELETE FROM user_locations  WHERE user_id   = :id")->execute([':id' => $id]);
    $pdo->prepare("DELETE FROM admin_locations WHERE user_id   = :id")->execute([':id' => $id]);
    $pdo->prepare("DELETE FROM activity_log    WHERE user_id   = :id")->execute([':id' => $id]);
    $pdo->prepare("DELETE FROM rate_limit      WHERE ip IN (SELECT ip FROM security_log WHERE detail IN (SELECT email FROM users WHERE id = :id2))")->execute([':id2' => $id]);
    // Soft-orphan blog posts and businesses (preserve content, remove authorship link)
    $pdo->prepare("UPDATE blog_posts  SET author_id      = NULL WHERE author_id      = :id")->execute([':id' => $id]);
    $pdo->prepare("UPDATE businesses  SET owner_user_id  = NULL WHERE owner_user_id  = :id")->execute([':id' => $id]);
    $pdo->prepare("DELETE FROM users WHERE id = :id")->execute([':id' => $id]);
    echo json_encode(['success' => true]);
    exit();
}
