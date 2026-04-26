<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

// Helper: check if an admin is allowed to manage a given country+city
function admin_can_manage(PDO $pdo, int $userId, string $country, string $city): bool {
    $stmt = $pdo->prepare("SELECT 1 FROM admin_locations WHERE user_id = :uid AND country = :country AND city = :city LIMIT 1");
    $stmt->execute([':uid' => $userId, ':country' => $country, ':city' => $city]);
    return (bool)$stmt->fetch();
}

// Helper: write to activity_log
function log_activity(PDO $pdo, int $userId, string $action, string $entityType, int $entityId, ?string $entityName): void {
    try {
        $pdo->prepare("INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_name) VALUES (:uid, :action, :type, :eid, :name)")
            ->execute([':uid' => $userId, ':action' => $action, ':type' => $entityType, ':eid' => $entityId, ':name' => $entityName]);
    } catch (PDOException $e) { /* non-fatal */ }
}

if ($method === 'GET') {
    // Admins can see unapproved businesses
    require_once 'jwt.php';
    $token     = bearer_token();
    $authUser  = $token ? jwt_verify($token) : null;
    $isAdmin   = $authUser && in_array($authUser['role'] ?? '', ['admin', 'superadmin']);

    if ($isAdmin) {
        header("Cache-Control: no-store");
    } else {
        header("Cache-Control: public, max-age=300");
    }

    $where = $isAdmin ? [] : ['b.is_approved = 1'];
    $params = [];

    if (!empty($_GET['category'])) {
        $where[] = 'b.category = :category';
        $params[':category'] = $_GET['category'];
    }

    if (!empty($_GET['country'])) {
        $where[] = 'b.country = :country';
        $params[':country'] = $_GET['country'];
    }

    if (!empty($_GET['canton'])) {
        $where[] = 'b.canton = :canton';
        $params[':canton'] = $_GET['canton'];
    }

    if (!empty($_GET['search'])) {
        $where[] = '(b.name LIKE :search OR b.description LIKE :search OR b.name_fa LIKE :search)';
        $params[':search'] = '%' . $_GET['search'] . '%';
    }

    if (!empty($_GET['featured'])) {
        $where[] = 'b.is_featured = 1';
    }

    if (!empty($_GET['id'])) {
        $where[] = 'b.id = :id';
        $params[':id'] = $_GET['id'];
    }

    $whereClause = count($where) ? 'WHERE ' . implode(' AND ', $where) : '';
    $sql = "SELECT b.*, u.name AS owner_name, u.email AS owner_email
            FROM businesses b
            LEFT JOIN users u ON u.id = b.owner_user_id
            $whereClause ORDER BY b.is_featured DESC, b.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $businesses = $stmt->fetchAll();

    foreach ($businesses as &$b) {
        $b['is_featured'] = (bool)$b['is_featured'];
        $b['is_verified'] = (bool)$b['is_verified'];
        $b['is_approved'] = (bool)$b['is_approved'];
        $b['lat'] = $b['lat'] ? (float)$b['lat'] : null;
        $b['lng'] = $b['lng'] ? (float)$b['lng'] : null;
    }

    if (!empty($_GET['id'])) {
        echo json_encode($businesses[0] ?? null);
    } else {
        echo json_encode($businesses);
    }
}

if ($method === 'POST') {
    $token    = bearer_token();
    $authUser = $token ? jwt_verify($token) : null;
    if (!$authUser || !in_array($authUser['role'] ?? '', ['admin', 'superadmin'])) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);

    // Reject if name is missing or empty
    if (empty(trim($data['name'] ?? ''))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'name is required']);
        exit();
    }

    // Non-superadmin admins must manage within their assigned locations
    if ($authUser['role'] === 'admin') {
        $country = $data['country'] ?? 'Switzerland';
        $city    = $data['canton'] ?? ($data['city'] ?? '');
        if (!admin_can_manage($pdo, (int)$authUser['sub'], $country, $city)) {
            http_response_code(403);
            echo json_encode(['error' => 'Not allowed to manage businesses in this location']);
            exit();
        }
    }

    $sql = "INSERT INTO businesses (name, name_fa, category, country, canton, address, phone, website, email, instagram, description, description_fa, google_maps_url, lat, lng, is_featured, is_verified, is_approved)
            VALUES (:name, :name_fa, :category, :country, :canton, :address, :phone, :website, :email, :instagram, :description, :description_fa, :google_maps_url, :lat, :lng, :is_featured, :is_verified, :is_approved)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name'           => $data['name'] ?? '',
        ':name_fa'        => $data['name_fa'] ?? null,
        ':category'       => $data['category'] ?? 'other',
        ':country'        => $data['country'] ?? 'Switzerland',
        ':canton'         => $data['canton'] ?? ($data['city'] ?? null),
        ':address'        => $data['address'] ?? null,
        ':phone'          => $data['phone'] ?? null,
        ':website'        => $data['website'] ?? null,
        ':email'          => $data['email'] ?? null,
        ':instagram'      => $data['instagram'] ?? null,
        ':description'    => $data['description'] ?? null,
        ':description_fa' => $data['description_fa'] ?? null,
        ':google_maps_url'=> $data['google_maps_url'] ?? null,
        ':lat'            => $data['lat'] ?? null,
        ':lng'            => $data['lng'] ?? null,
        ':is_featured'    => $data['is_featured'] ? 1 : 0,
        ':is_verified'    => $data['is_verified'] ? 1 : 0,
        ':is_approved'    => $data['is_approved'] ? 1 : 0,
    ]);

    $newId = (int)$pdo->lastInsertId();
    log_activity($pdo, (int)$authUser['sub'], 'create', 'business', $newId, $data['name']);
    echo json_encode(['success' => true, 'id' => $newId]);
}

if ($method === 'PATCH') {
    $token    = bearer_token();
    $authUser = $token ? jwt_verify($token) : null;
    if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit(); }

    $data   = json_decode(file_get_contents('php://input'), true);
    $id     = (int)($data['id'] ?? 0);
    $role   = $authUser['role'] ?? '';
    $userId = (int)$authUser['sub'];

    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    // Fetch actual role from DB (JWT role may be stale after promotion)
    $dbUser = $pdo->prepare("SELECT role FROM users WHERE id = :id");
    $dbUser->execute([':id' => $userId]);
    $dbRole = $dbUser->fetchColumn() ?: $role;

    // Business owner (by DB role OR by ownership): edit their own business (limited fields)
    $bizOwnerCheck = $pdo->prepare("SELECT id, name FROM businesses WHERE id = :id AND owner_user_id = :uid");
    $bizOwnerCheck->execute([':id' => $id, ':uid' => $userId]);
    $ownedBiz = $bizOwnerCheck->fetch(PDO::FETCH_ASSOC);

    if ($dbRole === 'business_owner' || $ownedBiz) {
        if (!$ownedBiz) { http_response_code(403); echo json_encode(['error' => 'Not your business']); exit(); }

        $ownerAllowed = ['name','name_fa','description','description_fa','phone','website','email','instagram','address','google_maps_url','image_url','logo_url'];
        $fields = []; $params = [':id' => $id];
        foreach ($ownerAllowed as $f) {
            if (array_key_exists($f, $data)) { $fields[] = "$f = :$f"; $params[":$f"] = $data[$f]; }
        }
        if (empty($fields)) { echo json_encode(['success' => false]); exit(); }
        $pdo->prepare("UPDATE businesses SET " . implode(', ', $fields) . " WHERE id = :id")->execute($params);
        log_activity($pdo, $userId, 'update', 'business', $id, $ownedBiz['name']);
        echo json_encode(['success' => true]);
        exit();
    }

    if (!in_array($dbRole, ['admin', 'superadmin'])) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit();
    }

    // Non-superadmin: check location
    if ($role === 'admin') {
        $biz = $pdo->prepare("SELECT country, canton FROM businesses WHERE id = :id");
        $biz->execute([':id' => $id]);
        $existing = $biz->fetch(PDO::FETCH_ASSOC);
        if (!$existing) { http_response_code(404); echo json_encode(['error' => 'Not found']); exit(); }
        $checkCountry = $data['country'] ?? $existing['country'];
        $checkCity    = $data['canton']  ?? $existing['canton'];
        if (!admin_can_manage($pdo, $userId, $checkCountry, $checkCity)) {
            http_response_code(403); echo json_encode(['error' => 'Not allowed to manage businesses in this location']); exit();
        }
    }

    $fields = []; $params = [':id' => $id];
    $allowed = ['name','name_fa','category','lat','lng','image_url','logo_url','country','canton','address','phone','website','email','instagram','description','description_fa','google_maps_url','is_featured','is_verified','is_approved','owner_user_id'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $data)) { $fields[] = "$f = :$f"; $params[":$f"] = $data[$f]; }
    }
    if (empty($fields)) { echo json_encode(['success' => false]); exit(); }

    // If assigning an owner, promote that user to business_owner role
    if (array_key_exists('owner_user_id', $data) && $data['owner_user_id']) {
        $pdo->prepare("UPDATE users SET role = 'business_owner' WHERE id = :uid AND role = 'user'")
            ->execute([':uid' => (int)$data['owner_user_id']]);
    }
    // If removing owner, demote user back to 'user'
    if (array_key_exists('owner_user_id', $data) && !$data['owner_user_id']) {
        $prev = $pdo->prepare("SELECT owner_user_id FROM businesses WHERE id = :id");
        $prev->execute([':id' => $id]);
        $prevOwner = (int)$prev->fetchColumn();
        if ($prevOwner) {
            $pdo->prepare("UPDATE users SET role = 'user' WHERE id = :uid AND role = 'business_owner'")
                ->execute([':uid' => $prevOwner]);
        }
    }

    $pdo->prepare("UPDATE businesses SET " . implode(', ', $fields) . " WHERE id = :id")->execute($params);

    $bizName = $pdo->prepare("SELECT name FROM businesses WHERE id = :id");
    $bizName->execute([':id' => $id]);
    log_activity($pdo, $userId, 'update', 'business', $id, $bizName->fetchColumn() ?: null);

    echo json_encode(['success' => true]);
}

if ($method === 'DELETE') {
    $token    = bearer_token();
    $authUser = $token ? jwt_verify($token) : null;
    if (!$authUser || !in_array($authUser['role'] ?? '', ['admin', 'superadmin'])) {
        http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $id   = (int)($data['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    $biz = $pdo->prepare("SELECT country, canton, name, owner_user_id FROM businesses WHERE id = :id");
    $biz->execute([':id' => $id]);
    $existing = $biz->fetch(PDO::FETCH_ASSOC);
    if (!$existing) { http_response_code(404); echo json_encode(['error' => 'Not found']); exit(); }

    if ($authUser['role'] === 'admin') {
        if (!admin_can_manage($pdo, (int)$authUser['sub'], $existing['country'], $existing['canton'])) {
            http_response_code(403); echo json_encode(['error' => 'Not allowed to manage businesses in this location']); exit();
        }
    }

    // Demote business_owner if one is assigned
    if ($existing['owner_user_id']) {
        $pdo->prepare("UPDATE users SET role = 'user' WHERE id = :uid AND role = 'business_owner'")
            ->execute([':uid' => (int)$existing['owner_user_id']]);
    }

    log_activity($pdo, (int)$authUser['sub'], 'delete', 'business', $id, $existing['name']);
    $pdo->prepare("DELETE FROM businesses WHERE id = :id")->execute([':id' => $id]);
    echo json_encode(['success' => true, 'deleted' => $id]);
}
