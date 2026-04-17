<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!empty($_GET['slug'])) {
        $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE slug = :slug AND published = 1");
        $stmt->execute([':slug' => $_GET['slug']]);
        echo json_encode($stmt->fetch() ?: null);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE published = 1 ORDER BY created_at DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['title'] ?? '')));

    $sql = "INSERT INTO blog_posts (title, title_fa, slug, content, content_fa, cover_image, published)
            VALUES (:title, :title_fa, :slug, :content, :content_fa, :cover_image, :published)
            ON DUPLICATE KEY UPDATE
            title=VALUES(title), title_fa=VALUES(title_fa), content=VALUES(content),
            content_fa=VALUES(content_fa), cover_image=VALUES(cover_image), published=VALUES(published)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':title'       => $data['title'] ?? '',
        ':title_fa'    => $data['title_fa'] ?? null,
        ':slug'        => $slug,
        ':content'     => $data['content'] ?? '',
        ':content_fa'  => $data['content_fa'] ?? null,
        ':cover_image' => $data['cover_image'] ?? null,
        ':published'   => $data['published'] ? 1 : 0,
    ]);

    echo json_encode(['success' => true, 'slug' => $slug]);
}
