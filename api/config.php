<?php
$allowedOrigins = ['https://birunimap.com', 'https://www.birunimap.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: https://birunimap.com');
}
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// .env.php sits at public_html/.env.php (one level up from public_html/api/)
$envFile = dirname(__DIR__) . '/.env.php';
if (file_exists($envFile)) {
    require_once $envFile;
}

$hostRaw = trim(defined('DB_HOST') ? DB_HOST : 'localhost');
$db      = defined('DB_NAME') ? DB_NAME : '';
$user    = defined('DB_USER') ? DB_USER : '';
$pass    = defined('DB_PASS') ? DB_PASS : '';

// Namecheap shared hosting requires 127.0.0.1 instead of localhost
if (strpos($hostRaw, ':') !== false) {
    [$host, $port] = explode(':', $hostRaw, 2);
} else {
    $host = $hostRaw;
    $port = '3306';
}
if ($host === 'localhost') $host = '127.0.0.1';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT            => 5,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

/**
 * Sanitize HTML from TipTap editor: strip dangerous attributes and tags.
 * Uses DOMDocument to properly handle nested elements.
 */
/**
 * Like auth_required() but re-fetches role from the DB so a demoted
 * user can't keep using an old JWT with an elevated role claim.
 */
function auth_required_db(PDO $pdo, string $min_role = 'user'): array {
    $token = bearer_token();
    $user  = $token ? jwt_verify($token) : null;
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => (int)$user['sub']]);
    $row = $stmt->fetch();
    if (!$row) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    $user['role'] = $row['role'];

    $hierarchy = ['user' => 0, 'business_owner' => 0, 'admin' => 1, 'superadmin' => 2];
    $required  = $hierarchy[$min_role] ?? 0;
    $actual    = $hierarchy[$user['role']] ?? 0;
    if ($actual < $required) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit();
    }
    return $user;
}

function sanitize_html(string $html): string {
    if (trim($html) === '') return '';

    $allowedTags = ['p','br','b','strong','i','em','u','s','ul','ol','li',
                    'h1','h2','h3','h4','h5','h6','blockquote','pre','code',
                    'a','img','figure','figcaption','mark','span','div','hr',
                    'table','thead','tbody','tr','th','td'];

    $dom = new DOMDocument('1.0', 'UTF-8');
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="UTF-8"><body>' . $html . '</body>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();

    $toRemove = [];
    $xpath    = new DOMXPath($dom);

    // Collect nodes to remove (unsafe tags)
    foreach ($xpath->query('//*') as $node) {
        if (!in_array(strtolower($node->nodeName), $allowedTags, true)) {
            $toRemove[] = $node;
            continue;
        }
        // Strip dangerous attributes
        $attrNames = [];
        foreach ($node->attributes as $attr) $attrNames[] = $attr->name;
        foreach ($attrNames as $attrName) {
            $lower = strtolower($attrName);
            // Remove all event handlers (onclick, onerror, onload, …)
            if (strpos($lower, 'on') === 0) { $node->removeAttribute($attrName); continue; }
            if (in_array($lower, ['href', 'src', 'action'], true)) {
                $val = strtolower(trim($node->getAttribute($attrName)));
                if (strpos($val, 'javascript:') === 0 || strpos($val, 'data:') === 0) {
                    $node->removeAttribute($attrName);
                }
            }
        }
    }

    foreach ($toRemove as $node) {
        if ($node->parentNode) {
            // Replace node with its text content to avoid losing visible text
            $frag = $dom->createDocumentFragment();
            while ($node->firstChild) $frag->appendChild($node->firstChild);
            $node->parentNode->replaceChild($frag, $node);
        }
    }

    $body   = $dom->getElementsByTagName('body')->item(0);
    $result = '';
    foreach ($body->childNodes as $child) {
        $result .= $dom->saveHTML($child);
    }
    return $result;
}

function sanitize_url(?string $url): ?string {
    if (!$url) return null;
    $url = trim($url);
    if (!preg_match('/^https?:\/\//i', $url)) return null;
    return filter_var($url, FILTER_VALIDATE_URL) ? $url : null;
}

function sanitize_urls_in_array(array &$data, array $fields): void {
    foreach ($fields as $field) {
        if (isset($data[$field]) && $data[$field] !== '') {
            $data[$field] = sanitize_url($data[$field]);
        }
    }
}
