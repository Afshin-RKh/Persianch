<?php
require_once 'config.php';
require_once 'jwt.php';
require_once 'mailer.php';

$method = $_SERVER['REQUEST_METHOD'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generate_otp(): string {
    return str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}

function save_otp(PDO $pdo, int $userId, string $code, string $type = 'email'): void {
    // Invalidate any existing unused codes for this user+type
    $pdo->prepare("UPDATE verification_codes SET used_at = NOW() WHERE user_id = :uid AND type = :type AND used_at IS NULL")
        ->execute([':uid' => $userId, ':type' => $type]);
    $pdo->prepare("INSERT INTO verification_codes (user_id, code, type, expires_at) VALUES (:uid, :code, :type, DATE_ADD(NOW(), INTERVAL 15 MINUTE))")
        ->execute([':uid' => $userId, ':code' => $code, ':type' => $type]);
}

function send_verification_email(string $toEmail, string $toName, string $code): bool {
    $subject = "Your BiruniMap verification code: $code";
    $body    = "Hi $toName,\n\nYour BiruniMap verification code is:\n\n    $code\n\nThis code expires in 15 minutes.\n\nIf you did not request this, ignore this email.\n\n— BiruniMap Team";
    return send_email($toEmail, $toName, $subject, $body);
}

// ---------------------------------------------------------------------------
// GET — fetch own profile
// ---------------------------------------------------------------------------

if ($method === 'GET') {
    $user = auth_required('user');
    $stmt = $pdo->prepare("SELECT id, name, email, phone, role, avatar, created_at FROM users WHERE id = :id");
    $stmt->execute([':id' => $user['sub']]);
    $row = $stmt->fetch();
    echo json_encode($row ?: null);
    exit();
}

// ---------------------------------------------------------------------------
// POST — register / login / verify_otp / resend_otp
// ---------------------------------------------------------------------------

if ($method === 'POST') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';

    // -----------------------------------------------------------------------
    // REGISTER
    // -----------------------------------------------------------------------
    if ($action === 'register') {
        $name  = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $phone = trim($data['phone'] ?? '');
        $pass  = $data['password'] ?? '';

        if (!$name) {
            http_response_code(400);
            echo json_encode(['error' => 'Name is required']);
            exit();
        }
        if (!$email && !$phone) {
            http_response_code(400);
            echo json_encode(['error' => 'Email or phone is required']);
            exit();
        }
        if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email address']);
            exit();
        }
        if (!$pass || strlen($pass) < 8) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 8 characters']);
            exit();
        }

        // Check duplicate email
        if ($email) {
            $check = $pdo->prepare("SELECT id FROM users WHERE email = :email");
            $check->execute([':email' => $email]);
            if ($check->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Email already registered']);
                exit();
            }
        }
        // Check duplicate phone
        if ($phone) {
            $checkP = $pdo->prepare("SELECT id FROM users WHERE phone = :phone");
            $checkP->execute([':phone' => $phone]);
            if ($checkP->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Phone number already registered']);
                exit();
            }
        }

        $hash = password_hash($pass, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare(
            "INSERT INTO users (name, email, phone, password_hash, is_verified) VALUES (:name, :email, :phone, :hash, 0)"
        );
        $stmt->execute([
            ':name'  => $name,
            ':email' => $email ?: null,
            ':phone' => $phone ?: null,
            ':hash'  => $hash,
        ]);
        $id = (int)$pdo->lastInsertId();

        // Save interest locations if provided
        $locations = $data['locations'] ?? [];
        if (is_array($locations) && count($locations) > 0) {
            $ins = $pdo->prepare("INSERT IGNORE INTO user_locations (user_id, country, city) VALUES (:uid, :country, :city)");
            foreach ($locations as $loc) {
                if (!empty($loc['country']) && !empty($loc['city'])) {
                    $ins->execute([':uid' => $id, ':country' => $loc['country'], ':city' => $loc['city']]);
                }
            }
        }

        // Generate & send OTP
        $otp = generate_otp();
        save_otp($pdo, $id, $otp, 'email');
        $emailSent = false;
        if ($email) {
            $emailSent = send_verification_email($email, $name, $otp);
            if (!$emailSent) {
                // Log OTP to file so admin can retrieve it during debugging
                error_log("[BiruniMap OTP] user_id=$id email=$email code=$otp");
            }
        }

        echo json_encode([
            'pending'      => true,
            'user_id'      => $id,
            'email_sent'   => $emailSent,
            'message'      => $emailSent
                ? "We sent a 6-digit code to $email. Enter it below to verify your account."
                : "We could not send the email. Please contact support or try again.",
        ]);
        exit();
    }

    // -----------------------------------------------------------------------
    // VERIFY OTP
    // -----------------------------------------------------------------------
    if ($action === 'verify_otp') {
        $userId = (int)($data['user_id'] ?? 0);
        $code   = trim($data['code'] ?? '');

        if (!$userId || !$code) {
            http_response_code(400);
            echo json_encode(['error' => 'user_id and code are required']);
            exit();
        }

        $stmt = $pdo->prepare(
            "SELECT id FROM verification_codes
             WHERE user_id = :uid AND code = :code AND used_at IS NULL AND expires_at > NOW()
             ORDER BY id DESC LIMIT 1"
        );
        $stmt->execute([':uid' => $userId, ':code' => $code]);
        $row = $stmt->fetch();

        if (!$row) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or expired code. Please request a new one.']);
            exit();
        }

        // Mark code used, verify user
        $pdo->prepare("UPDATE verification_codes SET used_at = NOW() WHERE id = :id")
            ->execute([':id' => $row['id']]);
        $pdo->prepare("UPDATE users SET is_verified = 1 WHERE id = :id")
            ->execute([':id' => $userId]);

        $u = $pdo->prepare("SELECT id, name, email, phone, role, avatar FROM users WHERE id = :id");
        $u->execute([':id' => $userId]);
        $user = $u->fetch();

        $token = jwt_sign(['sub' => $user['id'], 'role' => $user['role'], 'name' => $user['name'], 'exp' => time() + JWT_TTL]);
        echo json_encode(['token' => $token, 'user' => $user]);
        exit();
    }

    // -----------------------------------------------------------------------
    // RESEND OTP
    // -----------------------------------------------------------------------
    if ($action === 'resend_otp') {
        $userId = (int)($data['user_id'] ?? 0);
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'user_id is required']);
            exit();
        }

        $u = $pdo->prepare("SELECT id, name, email, is_verified FROM users WHERE id = :id");
        $u->execute([':id' => $userId]);
        $user = $u->fetch();

        if (!$user) { http_response_code(404); echo json_encode(['error' => 'User not found']); exit(); }
        if ($user['is_verified']) { echo json_encode(['message' => 'Already verified']); exit(); }

        $otp = generate_otp();
        save_otp($pdo, $userId, $otp, 'email');
        if ($user['email']) {
            send_verification_email($user['email'], $user['name'], $otp);
        }
        echo json_encode(['message' => 'Code resent']);
        exit();
    }

    // -----------------------------------------------------------------------
    // LOGIN
    // -----------------------------------------------------------------------
    if ($action === 'login') {
        $email = strtolower(trim($data['email'] ?? ''));
        $phone = trim($data['phone'] ?? '');
        $pass  = $data['password'] ?? '';

        if ((!$email && !$phone) || !$pass) {
            http_response_code(400);
            echo json_encode(['error' => 'Email/phone and password are required']);
            exit();
        }

        if ($email) {
            $stmt = $pdo->prepare("SELECT id, name, email, phone, role, password_hash, avatar, is_verified FROM users WHERE email = :email");
            $stmt->execute([':email' => $email]);
        } else {
            $stmt = $pdo->prepare("SELECT id, name, email, phone, role, password_hash, avatar, is_verified FROM users WHERE phone = :phone");
            $stmt->execute([':phone' => $phone]);
        }
        $row = $stmt->fetch();

        if (!$row || !$row['password_hash'] || !password_verify($pass, $row['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            exit();
        }

        if (!$row['is_verified']) {
            // Resend OTP so they can verify
            $otp = generate_otp();
            save_otp($pdo, (int)$row['id'], $otp, 'email');
            if ($row['email']) send_verification_email($row['email'], $row['name'], $otp);

            http_response_code(403);
            echo json_encode([
                'error'            => 'Please verify your email first.',
                'needs_verification' => true,
                'user_id'          => (int)$row['id'],
            ]);
            exit();
        }

        $token = jwt_sign(['sub' => (int)$row['id'], 'role' => $row['role'], 'name' => $row['name'], 'exp' => time() + JWT_TTL]);
        unset($row['password_hash'], $row['is_verified']);
        echo json_encode(['token' => $token, 'user' => $row]);
        exit();
    }

    http_response_code(400);
    echo json_encode(['error' => 'Unknown action']);
}
