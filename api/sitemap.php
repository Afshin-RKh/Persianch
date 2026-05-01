<?php
require_once 'config.php';

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');

$base = 'https://birunimap.com';

$urls = [];

// Static pages
$static = [
    ['loc' => $base . '/',                 'priority' => '1.0', 'changefreq' => 'weekly'],
    ['loc' => $base . '/businesses',       'priority' => '0.9', 'changefreq' => 'daily'],
    ['loc' => $base . '/events',           'priority' => '0.9', 'changefreq' => 'daily'],
    ['loc' => $base . '/blog',             'priority' => '0.8', 'changefreq' => 'weekly'],
    ['loc' => $base . '/about',            'priority' => '0.7', 'changefreq' => 'monthly'],
    ['loc' => $base . '/get-listed',       'priority' => '0.6', 'changefreq' => 'monthly'],
    ['loc' => $base . '/events/submit',    'priority' => '0.6', 'changefreq' => 'monthly'],
    ['loc' => $base . '/contact',          'priority' => '0.5', 'changefreq' => 'monthly'],
];
foreach ($static as $s) $urls[] = $s;

// Approved businesses
$stmt = $pdo->query("SELECT id, updated_at FROM businesses WHERE is_approved = 1 ORDER BY id");
while ($row = $stmt->fetch()) {
    $urls[] = [
        'loc'        => $base . '/businesses/detail?id=' . (int)$row['id'],
        'priority'   => '0.8',
        'changefreq' => 'weekly',
        'lastmod'    => substr($row['updated_at'] ?? date('Y-m-d'), 0, 10),
    ];
}

// Published blog posts
$stmt = $pdo->query("SELECT slug, updated_at FROM blog_posts WHERE status = 'approved' ORDER BY id");
while ($row = $stmt->fetch()) {
    $urls[] = [
        'loc'        => $base . '/blog/post?slug=' . urlencode($row['slug']),
        'priority'   => '0.7',
        'changefreq' => 'monthly',
        'lastmod'    => substr($row['updated_at'] ?? date('Y-m-d'), 0, 10),
    ];
}

// Approved events
$stmt = $pdo->query("SELECT id, updated_at FROM events WHERE status = 'approved' ORDER BY id");
while ($row = $stmt->fetch()) {
    $urls[] = [
        'loc'        => $base . '/events/detail?id=' . (int)$row['id'],
        'priority'   => '0.7',
        'changefreq' => 'weekly',
        'lastmod'    => substr($row['updated_at'] ?? date('Y-m-d'), 0, 10),
    ];
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($urls as $u) {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($u['loc']) . "</loc>\n";
    if (!empty($u['lastmod']))    echo "    <lastmod>{$u['lastmod']}</lastmod>\n";
    if (!empty($u['changefreq'])) echo "    <changefreq>{$u['changefreq']}</changefreq>\n";
    if (!empty($u['priority']))   echo "    <priority>{$u['priority']}</priority>\n";
    echo "  </url>\n";
}
echo '</urlset>';
