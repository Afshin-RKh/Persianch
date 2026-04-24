<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Admins can see unapproved businesses
    require_once 'jwt.php';
    $token     = bearer_token();
    $authUser  = $token ? jwt_verify($token) : null;
    $isAdmin   = $authUser && in_array($authUser['role'] ?? '', ['admin', 'superadmin']);

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
    $sql = "SELECT * FROM businesses b $whereClause ORDER BY b.is_featured DESC, b.created_at DESC";

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
    $data = json_decode(file_get_contents('php://input'), true);

    // Reject if name is missing or empty
    if (empty(trim($data['name'] ?? ''))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'name is required']);
        exit();
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

    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
}

if ($method === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    $fields = [];
    $params = [':id' => $id];
    $allowed = ['name','name_fa','lat','lng','image_url','country','canton','address','phone','website','email','instagram','description','description_fa','google_maps_url','is_featured','is_verified','is_approved'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $data)) {
            $fields[] = "$f = :$f";
            $params[":$f"] = $data[$f];
        }
    }
    if (empty($fields)) { echo json_encode(['success' => false]); exit(); }

    $stmt = $pdo->prepare("UPDATE businesses SET " . implode(', ', $fields) . " WHERE id = :id");
    $stmt->execute($params);
    echo json_encode(['success' => true]);
}

if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    $stmt = $pdo->prepare("DELETE FROM businesses WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['success' => true, 'deleted' => $id]);
}
