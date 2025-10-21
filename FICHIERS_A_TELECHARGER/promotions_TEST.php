<?php
// TEST DIRECT - Force le bon format
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require __DIR__ . '/config.php';

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT ?? 3306);
$mysqli->set_charset('utf8mb4');

$result = $mysqli->query("SELECT * FROM promotions WHERE isActive = 1 ORDER BY start_date DESC LIMIT 50");

$promotions = [];
$host = $_SERVER['HTTP_HOST'];

while ($row = $result->fetch_assoc()) {
    $img = $row['image_url'] ?? '';
    if ($img && strpos($img, 'http') !== 0) {
        $img = 'https://' . $host . $img;
    }
    
    $promotions[] = [
        'id' => (int)$row['id'],
        'title' => $row['title'],
        'description' => $row['description'] ?? '',
        'start_date' => $row['start_date'],
        'end_date' => $row['end_date'],
        'image_url' => $img,
        'photo' => $img,
        'status' => 'active',
        'isActive' => 1
    ];
}

// FORCER le format tableau avec array_values ET JSON_FORCE_OBJECT false
echo json_encode(array_values($promotions), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
