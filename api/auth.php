<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user = auth_required('user');
    $stmt = $pdo->prepare("SELECT id, name, email, role, avatar, created_at FROM users WHERE id = :id");
    $stmt->execute([':id' => $user['sub']]);
    $row = $stmt->fetch();
    echo json_encode($row ?: null);
    exit();
}

if ($method === 'POST') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';

    if ($action === 'register') {
        $name  = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $pass  = $data['password'] ?? '';

        if (!$name || !$email || !$pass) {
            http_response_code(400);
            echo json_encode(['error' => 'Name, email and password are required']);
            exit();
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email']);
            exit();
        }
        if (strlen($pass) < 8) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 8 characters']);
            exit();
        }

        $check = $pdo->prepare("SELECT id FROM users WHERE email = :email");
        $check->execute([':email' => $email]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already registered']);
            exit();
        }

        $hash = password_hash($pass, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :hash)");
        $stmt->execute([':name' => $name, ':email' => $email, ':hash' => $hash]);
        $id = $pdo->lastInsertId();

        $token = jwt_sign(['sub' => (int)$id, 'role' => 'user', 'name' => $name, 'exp' => time() + JWT_TTL]);
        echo json_encode(['token' => $token, 'user' => ['id' => (int)$id, 'name' => $name, 'email' => $email, 'role' => 'user']]);
        exit();
    }

    if ($action === 'login') {
        $email = strtolower(trim($data['email'] ?? ''));
        $pass  = $data['password'] ?? '';

        if (!$email || !$pass) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT id, name, email, role, password_hash, avatar FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $row = $stmt->fetch();

        if (!$row || !$row['password_hash'] || !password_verify($pass, $row['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            exit();
        }

        $token = jwt_sign(['sub' => (int)$row['id'], 'role' => $row['role'], 'name' => $row['name'], 'exp' => time() + JWT_TTL]);
        unset($row['password_hash']);
        echo json_encode(['token' => $token, 'user' => $row]);
        exit();
    }

    http_response_code(400);
    echo json_encode(['error' => 'Unknown action']);
}
