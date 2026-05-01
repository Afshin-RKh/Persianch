<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

function sq_auth(): ?array {
    $token = bearer_token();
    return $token ? jwt_verify($token) : null;
}

function sq_require_superadmin(): array {
    $u = sq_auth();
    if (!$u || $u['role'] !== 'superadmin') {
        http_response_code(403); echo json_encode(['error' => 'Superadmin only']); exit();
    }
    return $u;
}

// ── GET — public listing with links ──────────────────────────────────────────
if ($method === 'GET') {
    header("Cache-Control: public, max-age=600");
    $where  = ['s.is_active = 1'];
    $params = [];

    if (!empty($_GET['city'])) {
        $where[]        = 's.city = :city';
        $params[':city'] = $_GET['city'];
    }
    if (!empty($_GET['country'])) {
        $where[]           = 's.country = :country';
        $params[':country'] = $_GET['country'];
    }
    if (!empty($_GET['id'])) {
        $where[]      = 's.id = :id';
        $params[':id'] = (int)$_GET['id'];
    }

    $sql  = "SELECT s.* FROM city_squares s WHERE " . implode(' AND ', $where) . " ORDER BY s.city";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $squares = $stmt->fetchAll();

    // Attach links to each square
    $ids = array_column($squares, 'id');
    if ($ids) {
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $lStmt = $pdo->prepare("SELECT * FROM square_links WHERE square_id IN ($placeholders) ORDER BY square_id, sort_order, id");
        $lStmt->execute($ids);
        $links = $lStmt->fetchAll();

        $linkMap = [];
        foreach ($links as $l) $linkMap[$l['square_id']][] = $l;
        foreach ($squares as &$s) {
            $s['lat'] = (float)$s['lat'];
            $s['lng'] = (float)$s['lng'];
            $s['is_active'] = (bool)$s['is_active'];
            $s['links'] = $linkMap[$s['id']] ?? [];
        }
    }

    if (!empty($_GET['id'])) {
        echo json_encode($squares[0] ?? null);
    } else {
        echo json_encode($squares);
    }
    exit();
}

// ── POST — create square + links (superadmin) ─────────────────────────────────
if ($method === 'POST') {
    sq_require_superadmin();
    $data = json_decode(file_get_contents('php://input'), true);

    $nameEn = trim($data['name_en'] ?? '');
    $nameFa = trim($data['name_fa'] ?? '');
    $city   = trim($data['city'] ?? '');
    $country = trim($data['country'] ?? '');
    $lat    = $data['lat'] ?? null;
    $lng    = $data['lng'] ?? null;

    if (!$nameEn || !$city || !$country || !$lat || !$lng) {
        http_response_code(400); echo json_encode(['error' => 'name_en, city, country, lat, lng are required']); exit();
    }

    $pdo->prepare("INSERT INTO city_squares (name_en, name_fa, city, country, lat, lng, description_en, description_fa, is_active) VALUES (:ne, :nf, :city, :country, :lat, :lng, :de, :df, :active)")
        ->execute([
            ':ne' => $nameEn, ':nf' => $nameFa ?: $nameEn,
            ':city' => $city, ':country' => $country,
            ':lat' => $lat, ':lng' => $lng,
            ':de' => $data['description_en'] ?? null,
            ':df' => $data['description_fa'] ?? null,
            ':active' => isset($data['is_active']) ? (int)(bool)$data['is_active'] : 1,
        ]);
    $squareId = (int)$pdo->lastInsertId();

    if (!empty($data['links']) && is_array($data['links'])) {
        $ins = $pdo->prepare("INSERT INTO square_links (square_id, title_en, title_fa, url, category, sort_order) VALUES (:sid, :te, :tf, :url, :cat, :ord)");
        foreach ($data['links'] as $i => $l) {
            if (empty(trim($l['title_en'] ?? '')) || empty(trim($l['url'] ?? ''))) continue;
            $ins->execute([':sid' => $squareId, ':te' => $l['title_en'], ':tf' => $l['title_fa'] ?? null, ':url' => $l['url'], ':cat' => $l['category'] ?? 'other', ':ord' => $i]);
        }
    }

    echo json_encode(['success' => true, 'id' => $squareId]);
    exit();
}

// ── PATCH — update square and/or links (superadmin) ───────────────────────────
if ($method === 'PATCH') {
    sq_require_superadmin();
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = (int)($data['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    $fields = []; $params = [':id' => $id];
    $allowed = ['name_en', 'name_fa', 'city', 'country', 'lat', 'lng', 'description_en', 'description_fa', 'is_active'];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $data)) { $fields[] = "$f = :$f"; $params[":$f"] = $data[$f]; }
    }
    if ($fields) {
        $pdo->prepare("UPDATE city_squares SET " . implode(', ', $fields) . " WHERE id = :id")->execute($params);
    }

    // Replace all links if provided
    if (array_key_exists('links', $data) && is_array($data['links'])) {
        $pdo->prepare("DELETE FROM square_links WHERE square_id = :sid")->execute([':sid' => $id]);
        $ins = $pdo->prepare("INSERT INTO square_links (square_id, title_en, title_fa, url, category, sort_order) VALUES (:sid, :te, :tf, :url, :cat, :ord)");
        foreach ($data['links'] as $i => $l) {
            if (empty(trim($l['title_en'] ?? '')) || empty(trim($l['url'] ?? ''))) continue;
            $ins->execute([':sid' => $id, ':te' => $l['title_en'], ':tf' => $l['title_fa'] ?? null, ':url' => $l['url'], ':cat' => $l['category'] ?? 'other', ':ord' => $i]);
        }
    }

    echo json_encode(['success' => true]);
    exit();
}

// ── DELETE — remove square + links (superadmin) ───────────────────────────────
if ($method === 'DELETE') {
    sq_require_superadmin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    $pdo->prepare("DELETE FROM city_squares WHERE id = :id")->execute([':id' => $id]);
    echo json_encode(['success' => true]);
    exit();
}
