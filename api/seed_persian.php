<?php
require_once 'config.php';

// Fetch all businesses so we can match by English name
$all = $pdo->query("SELECT id, name FROM businesses WHERE is_approved = 1 ORDER BY id")->fetchAll();
echo json_encode($all, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
