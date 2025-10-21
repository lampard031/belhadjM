<?php
// /public_html/api/events.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://triple7casino.ca');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require __DIR__ . '/config.php';

function db() {
  static $mysqli = null;
  if ($mysqli === null) {
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT ?? 3306);
    if ($mysqli->connect_error) {
      http_response_code(500);
      echo json_encode(['error'=>'DB connect error']); exit;
    }
    $mysqli->set_charset('utf8mb4');
  }
  return $mysqli;
}

$lang = isset($_GET['lang']) ? strtolower(substr($_GET['lang'], 0, 2)) : 'fr';
if (!in_array($lang, ['fr','en'], true)) { $lang = 'fr'; }

$titleCol = "COALESCE(title_{$lang}, title) AS title";
$descCol  = "COALESCE(description_{$lang}, description) AS description";

$sql = "
  SELECT
    id,
    image_url,
    event_date,
    start_time,
    location,
    status,
    {$titleCol},
    {$descCol},
    createdAt
  FROM events
  WHERE isActive = 1
  ORDER BY event_date ASC, createdAt DESC
  LIMIT 50
";
$db = db();
$res = $db->query($sql);
if (!$res) { http_response_code(500); echo json_encode(['error'=>'Query error']); exit; }

$host = $_SERVER['HTTP_HOST'];
$list = [];
while ($row = $res->fetch_assoc()) {
  $row['title'] = (string)$row['title'];
  $row['description'] = (string)$row['description'];
  $row['location'] = $row['location'] ? (string)$row['location'] : null;
  $row['status']   = $row['status'] ? (string)$row['status']   : 'upcoming';

  if (!empty($row['event_date'])) $row['event_date'] = date('Y-m-d', strtotime($row['event_date']));
  if (!empty($row['start_time'])) $row['start_time'] = substr($row['start_time'], 0, 5);
  if (!empty($row['createdAt']))  $row['createdAt']  = date('c', strtotime($row['createdAt']));

  if (!empty($row['image_url']) && strpos($row['image_url'], 'http') !== 0) {
    $row['image_url'] = 'https://' . $host . $row['image_url'];
  }

  $list[] = $row;
}

if (isset($_GET['flat']) && $_GET['flat'] == '1') {
  echo json_encode($list, JSON_UNESCAPED_SLASHES); exit;
}
echo json_encode(['events' => $list], JSON_UNESCAPED_SLASHES);
