<?php
require_once 'config.php';
require_once 'jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function optional_auth_ev(): ?array {
    $token = bearer_token();
    return $token ? jwt_verify($token) : null;
}

function is_admin_ev(?array $user): bool {
    return $user && in_array($user['role'] ?? '', ['admin', 'superadmin']);
}

/**
 * Given an event row, compute the next occurrence date (as a DateTime) within
 * [$from, $to]. Returns null if no occurrence falls in the window.
 * For non-recurring events, checks if the event's start_date is in the window.
 */
function next_occurrence(array $ev, DateTimeImmutable $from, DateTimeImmutable $to): ?DateTimeImmutable {
    $start = new DateTimeImmutable($ev['start_date']);
    $end   = new DateTimeImmutable($ev['end_date']);
    $duration = $start->diff($end); // event duration

    if (!$ev['is_recurring']) {
        // Single event: visible if end_date >= $from and start_date <= $to
        if ($end >= $from && $start <= $to) return $start;
        return null;
    }

    // Recurring: walk occurrences until we find one in window or pass $to
    $recEndRaw = $ev['recurrence_end_date'] ?? null;
    $recEnd    = $recEndRaw ? new DateTimeImmutable($recEndRaw . ' 23:59:59') : $to;

    $type = $ev['recurrence_type'];
    $cur  = $start;

    while ($cur <= $to && $cur <= $recEnd) {
        $curEnd = $cur->add($duration);
        if ($curEnd >= $from && $cur <= $to) return $cur;

        // Advance to next occurrence
        if ($type === 'weekly')   $cur = $cur->modify('+7 days');
        elseif ($type === 'biweekly') $cur = $cur->modify('+14 days');
        elseif ($type === 'monthly')  $cur = $cur->modify('+1 month');
        else break;
    }
    return null;
}

function window_dates(string $filter): array {
    $now = new DateTimeImmutable('now');
    return match($filter) {
        'week'   => [$now, $now->modify('+7 days')],
        'month'  => [$now, $now->modify('+30 days')],
        default  => [$now, $now->modify('+180 days')], // 6months or no filter
    };
}

// ── GET — public listing ─────────────────────────────────────────────────────
if ($method === 'GET') {
    $viewer  = optional_auth_ev();
    $isAdmin = is_admin_ev($viewer);

    // Single event by id — public for approved, full access for admin
    if (!empty($_GET['id'])) {
        $where = $isAdmin ? "id = :id" : "id = :id AND status = 'approved'";
        $stmt  = $pdo->prepare("SELECT * FROM events WHERE $where");
        $stmt->execute([':id' => (int)$_GET['id']]);
        $row = $stmt->fetch();
        if ($row) {
            $row['is_recurring'] = (bool)$row['is_recurring'];
            $row['lat'] = $row['lat'] ? (float)$row['lat'] : null;
            $row['lng'] = $row['lng'] ? (float)$row['lng'] : null;
            $row['next_occurrence'] = $row['start_date'];
        }
        echo json_encode($row ?: null);
        exit();
    }

    // Pending list for admin review
    if (!empty($_GET['pending']) && $isAdmin) {
        $stmt = $pdo->query("SELECT * FROM events WHERE status = 'pending' ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
        exit();
    }

    // Public: approved events (admins see all statuses)
    $filter  = $_GET['filter'] ?? '6months'; // week | month | 6months
    [$from, $to] = window_dates($filter);

    $where  = $isAdmin ? [] : ["status = 'approved'"];
    $params = [];

    if (!empty($_GET['type'])) {
        $where[]        = "event_type = :type";
        $params[':type'] = $_GET['type'];
    }
    if (!empty($_GET['country'])) {
        $where[]           = "country = :country";
        $params[':country'] = $_GET['country'];
    }
    if (!empty($_GET['city'])) {
        $where[]        = "city = :city";
        $params[':city'] = $_GET['city'];
    }

    $sql  = "SELECT * FROM events" . ($where ? " WHERE " . implode(' AND ', $where) : "") . " ORDER BY start_date ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    // Filter by date window and attach next_occurrence
    $result = [];
    foreach ($rows as $ev) {
        $occ = next_occurrence($ev, $from, $to);
        if ($occ !== null) {
            $ev['next_occurrence'] = $occ->format('Y-m-d H:i:s');
            $ev['is_recurring']    = (bool)$ev['is_recurring'];
            $ev['lat']  = $ev['lat']  ? (float)$ev['lat']  : null;
            $ev['lng']  = $ev['lng']  ? (float)$ev['lng']  : null;
            $result[] = $ev;
        }
    }

    // Sort by next occurrence
    usort($result, fn($a, $b) => strcmp($a['next_occurrence'], $b['next_occurrence']));
    echo json_encode($result);
    exit();
}

// ── POST — public submission ──────────────────────────────────────────────────
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $title      = trim($data['title'] ?? '');
    $eventType  = $data['event_type'] ?? 'other';
    $country    = trim($data['country'] ?? '');
    $city       = trim($data['city'] ?? '');
    $startDate  = $data['start_date'] ?? '';
    $endDate    = $data['end_date'] ?? '';

    if (!$title)     { http_response_code(400); echo json_encode(['error' => 'Title is required']); exit(); }
    if (!$country)   { http_response_code(400); echo json_encode(['error' => 'Country is required']); exit(); }
    if (!$city)      { http_response_code(400); echo json_encode(['error' => 'City is required']); exit(); }
    if (!$startDate) { http_response_code(400); echo json_encode(['error' => 'Start date is required']); exit(); }
    if (!$endDate)   { http_response_code(400); echo json_encode(['error' => 'End date is required']); exit(); }

    $validTypes = ['concert','theatre','protest','language_class','dance_class','food_culture','art_exhibition','sports','religious_cultural','party','conference','other'];
    if (!in_array($eventType, $validTypes)) $eventType = 'other';

    $isRecurring    = !empty($data['is_recurring']);
    $recurrenceType = $isRecurring ? ($data['recurrence_type'] ?? null) : null;
    $recurrenceEnd  = $isRecurring ? ($data['recurrence_end_date'] ?? null) : null;

    if ($isRecurring && !in_array($recurrenceType, ['weekly','biweekly','monthly'])) {
        http_response_code(400); echo json_encode(['error' => 'Invalid recurrence_type']); exit();
    }

    $viewer = optional_auth_ev();
    $submittedBy = $viewer ? (int)$viewer['sub'] : null;

    $stmt = $pdo->prepare(
        "INSERT INTO events (title, title_fa, description, description_fa, event_type,
         country, city, address, venue, lat, lng, start_date, end_date,
         is_recurring, recurrence_type, recurrence_end_date,
         external_link, cover_image, organizer_name, organizer_email,
         status, submitted_by)
         VALUES (:title, :title_fa, :description, :description_fa, :event_type,
         :country, :city, :address, :venue, :lat, :lng, :start_date, :end_date,
         :is_recurring, :recurrence_type, :recurrence_end_date,
         :external_link, :cover_image, :organizer_name, :organizer_email,
         'pending', :submitted_by)"
    );
    $stmt->execute([
        ':title'               => $title,
        ':title_fa'            => $data['title_fa'] ?? null,
        ':description'         => $data['description'] ?? null,
        ':description_fa'      => $data['description_fa'] ?? null,
        ':event_type'          => $eventType,
        ':country'             => $country,
        ':city'                => $city,
        ':address'             => $data['address'] ?? null,
        ':venue'               => $data['venue'] ?? null,
        ':lat'                 => $data['lat'] ?? null,
        ':lng'                 => $data['lng'] ?? null,
        ':start_date'          => $startDate,
        ':end_date'            => $endDate,
        ':is_recurring'        => $isRecurring ? 1 : 0,
        ':recurrence_type'     => $recurrenceType,
        ':recurrence_end_date' => $recurrenceEnd,
        ':external_link'       => $data['external_link'] ?? null,
        ':cover_image'         => $data['cover_image'] ?? null,
        ':organizer_name'      => $data['organizer_name'] ?? null,
        ':organizer_email'     => $data['organizer_email'] ?? null,
        ':submitted_by'        => $submittedBy,
    ]);

    echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit();
}

// ── PATCH — admin edit/approve/reject ─────────────────────────────────────────
if ($method === 'PATCH') {
    $viewer = optional_auth_ev();
    if (!is_admin_ev($viewer)) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit(); }

    $data = json_decode(file_get_contents('php://input'), true);
    $id   = (int)($data['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    $allowed = ['title','title_fa','description','description_fa','event_type','country','city',
                'address','venue','lat','lng','start_date','end_date','is_recurring',
                'recurrence_type','recurrence_end_date','external_link','cover_image',
                'organizer_name','organizer_email','status'];
    $sets   = [];
    $params = [':id' => $id];

    foreach ($allowed as $col) {
        if (array_key_exists($col, $data)) {
            $sets[]          = "$col = :$col";
            $params[":$col"] = $data[$col];
        }
    }

    if (empty($sets)) { http_response_code(400); echo json_encode(['error' => 'Nothing to update']); exit(); }

    $pdo->prepare("UPDATE events SET " . implode(', ', $sets) . " WHERE id = :id")->execute($params);
    echo json_encode(['success' => true]);
    exit();
}

// ── DELETE — admin only ───────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $viewer = optional_auth_ev();
    if (!is_admin_ev($viewer)) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit(); }

    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'id required']); exit(); }

    $pdo->prepare("DELETE FROM events WHERE id = :id")->execute([':id' => $id]);
    echo json_encode(['success' => true]);
    exit();
}
