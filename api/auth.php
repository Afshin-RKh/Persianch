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

function send_verification_email(string $toEmail, string $toName, string $code): bool {
    $subject = "Your BiruniMap verification code: $code";
    $body    = "Hi $toName,\n\nYour BiruniMap verification code is:\n\n    $code\n\nThis code expires in 15 minutes.\n\nIf you did not request this, ignore this email.\n\n— BiruniMap Team";
    return send_email($toEmail, $toName, $subject, $body);
}

function send_reset_email(string $toEmail, string $toName, string $code): bool {
    $subject = "Reset your BiruniMap password";
    $body    = "Hi $toName,\n\nYour password reset code is:\n\n    $code\n\nThis code expires in 15 minutes.\n\nIf you did not request a password reset, ignore this email.\n\n— BiruniMap Team";
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
// POST
// ---------------------------------------------------------------------------

if ($method === 'POST') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';

    // Rate limiting: max 10 auth attempts per IP per 15 minutes
    $rateLimitedActions = ['login', 'register', 'verify_otp', 'forgot_password', 'reset_password'];
    if (in_array($action, $rateLimitedActions, true)) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $window = 15 * 60; // 15 minutes
        $maxAttempts = 10;
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS rate_limit (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ip VARCHAR(45) NOT NULL,
                action VARCHAR(50) NOT NULL,
                attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_ip_action (ip, action, attempted_at)
            )");
            // Clean old entries
            $pdo->prepare("DELETE FROM rate_limit WHERE attempted_at < DATE_SUB(NOW(), INTERVAL :w SECOND)")
                ->execute([':w' => $window]);
            // Count recent attempts
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM rate_limit WHERE ip = :ip AND action = :action");
            $stmt->execute([':ip' => $ip, ':action' => $action]);
            if ((int)$stmt->fetchColumn() >= $maxAttempts) {
                http_response_code(429);
                echo json_encode(['error' => 'Too many attempts. Please wait 15 minutes and try again.']);
                exit();
            }
            // Log this attempt
            $pdo->prepare("INSERT INTO rate_limit (ip, action) VALUES (:ip, :action)")
                ->execute([':ip' => $ip, ':action' => $action]);
        } catch (\Exception $e) { /* non-fatal: don't block on rate limit errors */ }
    }

    // -----------------------------------------------------------------------
    // REGISTER — store pending, send OTP (user NOT inserted yet)
    // -----------------------------------------------------------------------
    if ($action === 'register') {
        $name  = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $phone = trim($data['phone'] ?? '');
        $pass  = $data['password'] ?? '';

        if (!$name) { http_response_code(400); echo json_encode(['error' => 'Name is required']); exit(); }
        if (!$email && !$phone) { http_response_code(400); echo json_encode(['error' => 'Email or phone is required']); exit(); }
        if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(400); echo json_encode(['error' => 'Invalid email address']); exit(); }
        if (strlen($pass) < 8) { http_response_code(400); echo json_encode(['error' => 'Password must be at least 8 characters']); exit(); }

        // Check if already a verified user
        if ($email) {
            $check = $pdo->prepare("SELECT id FROM users WHERE email = :email");
            $check->execute([':email' => $email]);
            if ($check->fetch()) { http_response_code(409); echo json_encode(['error' => 'Email already registered']); exit(); }
        }
        if ($phone) {
            $check = $pdo->prepare("SELECT id FROM users WHERE phone = :phone");
            $check->execute([':phone' => $phone]);
            if ($check->fetch()) { http_response_code(409); echo json_encode(['error' => 'Phone already registered']); exit(); }
        }

        $otp  = generate_otp();
        $hash = password_hash($pass, PASSWORD_DEFAULT);

        // Remove any previous pending registration for this email/phone
        if ($email) $pdo->prepare("DELETE FROM pending_registrations WHERE email = :e")->execute([':e' => $email]);
        if ($phone) $pdo->prepare("DELETE FROM pending_registrations WHERE phone = :p")->execute([':p' => $phone]);

        $pdo->prepare("INSERT INTO pending_registrations (name, email, phone, pass_hash, otp, expires_at) VALUES (:name, :email, :phone, :hash, :otp, DATE_ADD(NOW(), INTERVAL 15 MINUTE))")
            ->execute([':name' => $name, ':email' => $email ?: null, ':phone' => $phone ?: null, ':hash' => $hash, ':otp' => $otp]);
        $pendingId = (int)$pdo->lastInsertId();

        $emailSent = $email ? send_verification_email($email, $name, $otp) : false;

        echo json_encode([
            'pending'    => true,
            'pending_id' => $pendingId,
            'email_sent' => $emailSent,
            'message'    => $emailSent
                ? "We sent a 6-digit code to $email. Enter it below to create your account."
                : "Could not send verification email. Please try again.",
        ]);
        exit();
    }

    // -----------------------------------------------------------------------
    // VERIFY OTP (registration) — NOW insert user
    // -----------------------------------------------------------------------
    if ($action === 'verify_otp') {
        $pendingId = (int)($data['pending_id'] ?? 0);
        $code      = trim($data['code'] ?? '');

        if (!$pendingId || !$code) { http_response_code(400); echo json_encode(['error' => 'pending_id and code are required']); exit(); }

        $stmt = $pdo->prepare("SELECT * FROM pending_registrations WHERE id = :id AND otp = :otp AND expires_at > NOW()");
        $stmt->execute([':id' => $pendingId, ':otp' => $code]);
        $pending = $stmt->fetch();

        if (!$pending) { http_response_code(400); echo json_encode(['error' => 'Invalid or expired code. Please request a new one.']); exit(); }

        // Double-check email not taken in the time since OTP was sent
        if ($pending['email']) {
            $check = $pdo->prepare("SELECT id FROM users WHERE email = :email");
            $check->execute([':email' => $pending['email']]);
            if ($check->fetch()) { http_response_code(409); echo json_encode(['error' => 'Email already registered']); exit(); }
        }

        // Insert verified user
        $pdo->prepare("INSERT INTO users (name, email, phone, password_hash, is_verified) VALUES (:name, :email, :phone, :hash, 1)")
            ->execute([':name' => $pending['name'], ':email' => $pending['email'], ':phone' => $pending['phone'], ':hash' => $pending['pass_hash']]);
        $userId = (int)$pdo->lastInsertId();

        // Clean up pending row
        $pdo->prepare("DELETE FROM pending_registrations WHERE id = :id")->execute([':id' => $pendingId]);

        $token = jwt_sign(['sub' => $userId, 'role' => 'user', 'name' => $pending['name'], 'exp' => time() + JWT_TTL]);
        echo json_encode(['token' => $token, 'user' => ['id' => $userId, 'name' => $pending['name'], 'email' => $pending['email'], 'phone' => $pending['phone'], 'role' => 'user']]);
        exit();
    }

    // -----------------------------------------------------------------------
    // RESEND OTP (registration)
    // -----------------------------------------------------------------------
    if ($action === 'resend_otp') {
        $pendingId = (int)($data['pending_id'] ?? 0);
        if (!$pendingId) { http_response_code(400); echo json_encode(['error' => 'pending_id is required']); exit(); }

        $stmt = $pdo->prepare("SELECT * FROM pending_registrations WHERE id = :id");
        $stmt->execute([':id' => $pendingId]);
        $pending = $stmt->fetch();
        if (!$pending) { http_response_code(404); echo json_encode(['error' => 'Registration not found']); exit(); }

        $otp = generate_otp();
        $pdo->prepare("UPDATE pending_registrations SET otp = :otp, expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = :id")
            ->execute([':otp' => $otp, ':id' => $pendingId]);

        if ($pending['email']) send_verification_email($pending['email'], $pending['name'], $otp);
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

        if ((!$email && !$phone) || !$pass) { http_response_code(400); echo json_encode(['error' => 'Email/phone and password are required']); exit(); }

        // Account lockout: block after 10 failed attempts on this identifier within 1 hour
        $lockIdentifier = $email ?: $phone;
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS security_log (id INT AUTO_INCREMENT PRIMARY KEY, ip VARCHAR(45), action VARCHAR(50), detail VARCHAR(255), created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
            $lockStmt = $pdo->prepare("SELECT COUNT(*) FROM security_log WHERE action = 'login_failed' AND detail = :id AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
            $lockStmt->execute([':id' => $lockIdentifier]);
            if ((int)$lockStmt->fetchColumn() >= 10) {
                http_response_code(429);
                echo json_encode(['error' => 'Account temporarily locked due to too many failed attempts. Try again in 1 hour.']);
                exit();
            }
        } catch (\Exception $e) {}

        if ($email) {
            $stmt = $pdo->prepare("SELECT id, name, email, phone, role, password_hash, avatar, is_verified FROM users WHERE email = :email");
            $stmt->execute([':email' => $email]);
        } else {
            $stmt = $pdo->prepare("SELECT id, name, email, phone, role, password_hash, avatar, is_verified FROM users WHERE phone = :phone");
            $stmt->execute([':phone' => $phone]);
        }
        $row = $stmt->fetch();

        // Always run password_verify to prevent timing-based email enumeration.
        // Use a dummy hash when no row found so the timing is identical.
        $dummyHash = '$2y$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345';
        $hashToCheck = ($row && $row['password_hash']) ? $row['password_hash'] : $dummyHash;
        $passwordOk = password_verify($pass, $hashToCheck);

        if (!$row || !$passwordOk) {
            try {
                $pdo->exec("CREATE TABLE IF NOT EXISTS security_log (id INT AUTO_INCREMENT PRIMARY KEY, ip VARCHAR(45), action VARCHAR(50), detail VARCHAR(255), created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
                $pdo->prepare("INSERT INTO security_log (ip, action, detail) VALUES (:ip, 'login_failed', :detail)")
                    ->execute([':ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown', ':detail' => $email ?: $phone]);
            } catch (\Exception $e) {}
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            exit();
        }

        if (!$row['is_verified']) {
            http_response_code(403);
            echo json_encode(['error' => 'Account not verified. Please sign up again.', 'needs_signup' => true]);
            exit();
        }

        $token = jwt_sign(['sub' => (int)$row['id'], 'role' => $row['role'], 'name' => $row['name'], 'exp' => time() + JWT_TTL]);
        unset($row['password_hash'], $row['is_verified']);
        echo json_encode(['token' => $token, 'user' => $row]);
        exit();
    }

    // -----------------------------------------------------------------------
    // FORGOT PASSWORD — send reset OTP
    // -----------------------------------------------------------------------
    if ($action === 'forgot_password') {
        $email = strtolower(trim($data['email'] ?? ''));
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400); echo json_encode(['error' => 'Valid email is required']); exit();
        }

        $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = :email AND is_verified = 1");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        // Always return success to prevent email enumeration
        if ($user) {
            $otp = generate_otp();
            $pdo->prepare("DELETE FROM pending_registrations WHERE email = :e AND name = '__reset__'")->execute([':e' => $email]);
            $pdo->prepare("INSERT INTO pending_registrations (name, email, phone, pass_hash, otp, expires_at) VALUES ('__reset__', :email, NULL, '', :otp, DATE_ADD(NOW(), INTERVAL 15 MINUTE))")
                ->execute([':email' => $email, ':otp' => $otp]);
            $resetId = (int)$pdo->lastInsertId();
            send_reset_email($email, $user['name'], $otp);
            echo json_encode(['pending_id' => $resetId, 'message' => "We sent a reset code to $email."]);
        } else {
            echo json_encode(['pending_id' => 0, 'message' => "If that email exists, we sent a reset code."]);
        }
        exit();
    }

    // -----------------------------------------------------------------------
    // RESET PASSWORD — verify OTP then set new password
    // -----------------------------------------------------------------------
    if ($action === 'reset_password') {
        $pendingId = (int)($data['pending_id'] ?? 0);
        $code      = trim($data['code'] ?? '');
        $newPass   = $data['password'] ?? '';

        if (!$pendingId || !$code || strlen($newPass) < 8) {
            http_response_code(400); echo json_encode(['error' => 'pending_id, code and new password (min 8 chars) are required']); exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM pending_registrations WHERE id = :id AND name = '__reset__' AND otp = :otp AND expires_at > NOW()");
        $stmt->execute([':id' => $pendingId, ':otp' => $code]);
        $pending = $stmt->fetch();

        if (!$pending) { http_response_code(400); echo json_encode(['error' => 'Invalid or expired code.']); exit(); }

        $hash = password_hash($newPass, PASSWORD_DEFAULT);
        $pdo->prepare("UPDATE users SET password_hash = :hash WHERE email = :email")
            ->execute([':hash' => $hash, ':email' => $pending['email']]);
        $pdo->prepare("DELETE FROM pending_registrations WHERE id = :id")->execute([':id' => $pendingId]);

        echo json_encode(['success' => true, 'message' => 'Password updated. You can now sign in.']);
        exit();
    }

    http_response_code(400);
    echo json_encode(['error' => 'Unknown action']);
}
