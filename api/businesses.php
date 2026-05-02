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
function log_activity(PDO $pdo, int $userId, string $action, string $entityType, int $entityId, ?string $entityName, ?string $details = null): void {
    try {
        $pdo->prepare("INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_name, details) VALUES (:uid, :action, :type, :eid, :name, :details)")
            ->execute([':uid' => $userId, ':action' => $action, ':type' => $entityType, ':eid' => $entityId, ':name' => $entityName, ':details' => $details]);
    } catch (PDOException $e) { /* non-fatal */ }
}

if ($method === 'GET') {
    require_once 'jwt.php';
    $token     = bearer_token();
    $authUser  = $token ? jwt_verify($token) : null;
    $isAdmin   = $authUser && in_array($authUser['role'] ?? '', ['admin', 'superadmin']);

    if ($isAdmin) {
        header("Cache-Control: no-store");
    } else {
        header("Cache-Control: public, max-age=300");
    }

    // Add deleted_at column if missing
    try { $pdo->exec("ALTER TABLE businesses ADD COLUMN deleted_at DATETIME DEFAULT NULL"); } catch (PDOException $e) {}

    if (!empty($_GET['trash']) && $isAdmin) {
        $rows = $pdo->query("SELECT id, name, category, country, canton, deleted_at FROM businesses WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC")->fetchAll();
        echo json_encode($rows); exit();
    }

    $pendingOnly = $isAdmin && !empty($_GET['pending']);
    $where = $isAdmin ? ($pendingOnly ? ['b.is_approved = 0', 'b.deleted_at IS NULL'] : ['b.deleted_at IS NULL']) : ['b.is_approved = 1', 'b.deleted_at IS NULL'];
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

    if (isset($_GET['lat_min'], $_GET['lat_max'], $_GET['lng_min'], $_GET['lng_max'])) {
        $where[] = 'b.lat IS NOT NULL AND b.lng IS NOT NULL';
        $where[] = 'b.lat BETWEEN :lat_min AND :lat_max';
        $where[] = 'b.lng BETWEEN :lng_min AND :lng_max';
        $params[':lat_min'] = (float)$_GET['lat_min'];
        $params[':lat_max'] = (float)$_GET['lat_max'];
        $params[':lng_min'] = (float)$_GET['lng_min'];
        $params[':lng_max'] = (float)$_GET['lng_max'];
    }

    if (!empty($_GET['id'])) {
        $where[] = 'b.id = :id';
        $params[':id'] = $_GET['id'];
    }

    $whereClause = count($where) ? 'WHERE ' . implode(' AND ', $where) : '';
    $isBoundsQuery = isset($_GET['lat_min']);
    $isListQuery   = $isAdmin && !empty($_GET['list']);

    // File-based cache for public bounds queries (5-minute TTL, same as HTTP header)
    $cacheKey  = null;
    $cachePath = null;
    $cacheTTL  = 300;
    if (!$isAdmin && $isBoundsQuery && empty($_GET['id'])) {
        $cacheDir = sys_get_temp_dir() . '/biz_cache';
        if (!is_dir($cacheDir)) @mkdir($cacheDir, 0700, true);
        $cacheKey  = md5(serialize($_GET));
        $cachePath = $cacheDir . '/' . $cacheKey . '.json';
        if (file_exists($cachePath) && (time() - filemtime($cachePath)) < $cacheTTL) {
            echo file_get_contents($cachePath);
            exit();
        }
    }

    if ($isAdmin && !$isListQuery) {
        $sql = "SELECT b.*, u.name AS owner_name, u.email AS owner_email
                FROM businesses b
                LEFT JOIN users u ON u.id = b.owner_user_id
                $whereClause ORDER BY b.is_featured DESC, b.created_at DESC LIMIT 1000";
    } elseif ($isListQuery) {
        $sql = "SELECT b.id, b.name, b.name_fa, b.category, b.canton, b.country,
                       b.is_approved, b.is_featured, b.is_verified, b.owner_user_id,
                       u.name AS owner_name
                FROM businesses b
                LEFT JOIN users u ON u.id = b.owner_user_id
                $whereClause ORDER BY b.is_featured DESC, b.created_at DESC";
    } elseif ($isBoundsQuery) {
        $sql = "SELECT b.id, b.name, b.category, b.lat, b.lng, b.is_featured, b.is_approved
                FROM businesses b
                $whereClause ORDER BY b.is_featured DESC LIMIT 500";
    } else {
        $sql = "SELECT b.* FROM businesses b
                $whereClause ORDER BY b.is_featured DESC, b.created_at DESC LIMIT 1000";
    }

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

    $output = !empty($_GET['id']) ? json_encode($businesses[0] ?? null) : json_encode($businesses);

    if ($cachePath) {
        file_put_contents($cachePath, $output, LOCK_EX);
    }

    echo $output;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty(trim($data['name'] ?? ''))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'name is required']);
        exit();
    }

    $token    = bearer_token();
    $authUser = $token ? jwt_verify($token) : null;
    $isAdmin  = $authUser && in_array($authUser['role'] ?? '', ['admin', 'superadmin']);
    sanitize_urls_in_array($data, ['website', 'google_maps_url', 'image_url', 'logo_url']);

    // Public submissions: always unapproved, no auth required
    $isPublicSubmission = !$isAdmin;

    if (!$isPublicSubmission) {
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
    }

    // Determine owner_user_id: authenticated user claiming ownership
    $ownerUserId = null;
    if ($authUser && !empty($data['is_owner'])) {
        $ownerUserId = (int)$authUser['sub'];
    }

    $sql = "INSERT INTO businesses (name, name_fa, category, country, canton, address, phone, website, email, instagram, description, description_fa, google_maps_url, lat, lng, is_featured, is_verified, is_approved, owner_user_id)
            VALUES (:name, :name_fa, :category, :country, :canton, :address, :phone, :website, :email, :instagram, :description, :description_fa, :google_maps_url, :lat, :lng, :is_featured, :is_verified, :is_approved, :owner_user_id)";

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
        ':is_featured'    => 0,
        ':is_verified'    => 0,
        ':is_approved'    => $isPublicSubmission ? 0 : ($data['is_approved'] ? 1 : 0),
        ':owner_user_id'  => $ownerUserId,
    ]);

    $newId = (int)$pdo->lastInsertId();

    // Promote user to business_owner role if they claimed ownership
    if ($ownerUserId && !in_array($authUser['role'] ?? '', ['admin', 'superadmin'])) {
        $pdo->prepare("UPDATE users SET role = 'business_owner' WHERE id = :uid AND role = 'user'")
            ->execute([':uid' => $ownerUserId]);
    }

    if ($isAdmin) {
        $adminName = $authUser['name'] ?? 'Admin';
        $loc = trim(($data['canton'] ?? '') . ', ' . ($data['country'] ?? ''), ', ');
        log_activity($pdo, (int)$authUser['sub'], 'create', 'business', $newId, $data['name'],
            "$adminName created business \"{$data['name']}\" in $loc");
    }
    echo json_encode(['success' => true, 'id' => $newId]);
}

if ($method === 'PATCH') {
    $token    = bearer_token();
    $authUser = $token ? jwt_verify($token) : null;
    if (!$authUser) { http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit(); }

    $data   = json_decode(file_get_contents('php://input'), true);
    sanitize_urls_in_array($data, ['website', 'google_maps_url', 'image_url', 'logo_url']);
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
        log_activity($pdo, $userId, 'update', 'business', $id, $ownedBiz['name'],
            "Business owner updated their own business \"{$ownedBiz['name']}\"");
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

    $adminName = $authUser['name'] ?? 'Admin';

    // If assigning an owner, promote that user to business_owner role
    $assignedOwnerName = null;
    if (array_key_exists('owner_user_id', $data) && $data['owner_user_id']) {
        $pdo->prepare("UPDATE users SET role = 'business_owner' WHERE id = :uid AND role = 'user'")
            ->execute([':uid' => (int)$data['owner_user_id']]);
        $ownerRow = $pdo->prepare("SELECT name FROM users WHERE id = :uid");
        $ownerRow->execute([':uid' => (int)$data['owner_user_id']]);
        $assignedOwnerName = $ownerRow->fetchColumn() ?: null;
    }
    // If removing owner, demote user back to 'user' only if they own no other businesses
    $removedOwnerName = null;
    if (array_key_exists('owner_user_id', $data) && !$data['owner_user_id']) {
        $prev = $pdo->prepare("SELECT owner_user_id FROM businesses WHERE id = :id");
        $prev->execute([':id' => $id]);
        $prevOwner = (int)$prev->fetchColumn();
        if ($prevOwner) {
            $otherBiz = $pdo->prepare("SELECT COUNT(*) FROM businesses WHERE owner_user_id = :uid AND id != :id");
            $otherBiz->execute([':uid' => $prevOwner, ':id' => $id]);
            if ((int)$otherBiz->fetchColumn() === 0) {
                $pdo->prepare("UPDATE users SET role = 'user' WHERE id = :uid AND role = 'business_owner'")
                    ->execute([':uid' => $prevOwner]);
            }
            $prevRow = $pdo->prepare("SELECT name FROM users WHERE id = :uid");
            $prevRow->execute([':uid' => $prevOwner]);
            $removedOwnerName = $prevRow->fetchColumn() ?: null;
        }
    }

    $pdo->prepare("UPDATE businesses SET " . implode(', ', $fields) . " WHERE id = :id")->execute($params);

    $bizNameRow = $pdo->prepare("SELECT name FROM businesses WHERE id = :id");
    $bizNameRow->execute([':id' => $id]);
    $bizName = $bizNameRow->fetchColumn() ?: null;

    // Build a meaningful details string
    if ($assignedOwnerName) {
        $action  = 'assign';
        $details = "$adminName assigned \"$assignedOwnerName\" as owner of \"$bizName\"";
    } elseif ($removedOwnerName) {
        $action  = 'update';
        $details = "$adminName removed \"$removedOwnerName\" as owner of \"$bizName\"";
    } elseif (array_key_exists('is_approved', $data)) {
        $action  = $data['is_approved'] ? 'approve' : 'reject';
        $verb    = $data['is_approved'] ? 'approved' : 'rejected';
        $details = "$adminName $verb business \"$bizName\"";
    } else {
        $action  = 'update';
        $details = "$adminName edited business \"$bizName\"";
    }
    log_activity($pdo, $userId, $action, 'business', $id, $bizName, $details);

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

    $adminName = $authUser['name'] ?? 'Admin';

    // Permanent delete
    if (!empty($data['permanent'])) {
        log_activity($pdo, (int)$authUser['sub'], 'delete_permanent', 'business', $id, $existing['name'], "$adminName permanently deleted \"{$existing['name']}\"");
        $pdo->prepare("DELETE FROM businesses WHERE id = :id")->execute([':id' => $id]);
        echo json_encode(['success' => true, 'deleted' => $id]); exit();
    }

    // Restore from trash
    if (!empty($data['restore'])) {
        $pdo->prepare("UPDATE businesses SET deleted_at = NULL WHERE id = :id")->execute([':id' => $id]);
        echo json_encode(['success' => true, 'restored' => $id]); exit();
    }

    // Soft delete
    log_activity($pdo, (int)$authUser['sub'], 'delete', 'business', $id, $existing['name'],
        "$adminName deleted business \"{$existing['name']}\" ({$existing['country']})");
    $pdo->prepare("UPDATE businesses SET deleted_at = NOW() WHERE id = :id")->execute([':id' => $id]);
    echo json_encode(['success' => true, 'deleted' => $id]);
}
