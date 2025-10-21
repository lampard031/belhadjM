<?php
// /public_html/api/index.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://triple7casino.ca');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require __DIR__ . '/config.php'; // même identifiants DB que /admin/config.php

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

$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '', '/'); // ex: "api/winners"
$parts = explode('/', $path);             // ["api","winners"]
$resource = $parts[1] ?? '';              // winners

// GET /api/health
if ($resource === 'health' && $_SERVER['REQUEST_METHOD'] === 'GET') {
  echo json_encode(['ok'=>true,'time'=>date('c')]); exit;
}

// GET /api/winners
if ($resource === 'winners' && $_SERVER['REQUEST_METHOD'] === 'GET') {
  $db = db();
  $res = $db->query("
    SELECT id, amount, game, date, photo, isActive, createdAt
    FROM winners
    WHERE isActive = 1
    ORDER BY date DESC, createdAt DESC
    LIMIT 10
  ");

  $out = [];
  $host = $_SERVER['HTTP_HOST'];
  while ($row = $res->fetch_assoc()) {
    $row['amount'] = (float)$row['amount'];
    if (!empty($row['date']))      $row['date']      = date('Y-m-d', strtotime($row['date']));
    if (!empty($row['createdAt'])) $row['createdAt'] = date('c',     strtotime($row['createdAt']));

    // URL absolue pour la photo
    $photo = $row['photo'] ?? '';
    if ($photo && strpos($photo, 'http') !== 0) {
      $photo = 'https://' . $host . $photo; // /uploads/... -> https://domaine/uploads/...
    }
    // Expose les 2 clés pour compat max
    $row['photo'] = $photo;
    $row['image_url'] = $photo;

    $out[] = $row;
  }

  // Si ?flat=1, renvoie un tableau brut (pas d'objet {winners: ...})
  if (isset($_GET['flat']) && $_GET['flat'] == '1') {
    echo json_encode($out, JSON_UNESCAPED_SLASHES); 
    exit;
  }

  echo json_encode(['winners' => $out], JSON_UNESCAPED_SLASHES); 
  exit;
}
// GET /api/events
if ($resource === 'events' && $_SERVER['REQUEST_METHOD'] === 'GET') {
  $db = db();
  $res = $db->query("
    SELECT 
      id,
      title,
      description,
      category,
      event_date,
      start_time,
      price,
      image_url,
      isActive,
      createdAt
    FROM events
    WHERE isActive = 1
    ORDER BY event_date DESC, createdAt DESC
    LIMIT 50
  ");

  $out = [];
  $host = $_SERVER['HTTP_HOST'];

  while ($row = $res->fetch_assoc()) {
    // Types/formatages
    if (!empty($row['event_date'])) $row['event_date'] = date('Y-m-d', strtotime($row['event_date']));
    if (!empty($row['start_time'])) $row['start_time'] = substr($row['start_time'], 0, 5); // "HH:MM"
    if (isset($row['price']))       $row['price'] = $row['price'] !== null ? (float)$row['price'] : null;
    if (!empty($row['createdAt']))  $row['createdAt'] = date('c', strtotime($row['createdAt']));

    // Image absolue
    $img = $row['image_url'] ?? '';
    if ($img && strpos($img, 'http') !== 0) {
      // si ça ressemble à "/uploads/xxx.jpg"
      $img = 'https://' . $host . $img;
    }
    $row['image_url'] = $img;      // conservé
    $row['photo']     = $img;      // alias de compat éventuelle

    $out[] = $row;
  }

  if (isset($_GET['flat']) && $_GET['flat'] == '1') {
    echo json_encode($out, JSON_UNESCAPED_SLASHES); 
    exit;
  }

  echo json_encode(['events' => $out], JSON_UNESCAPED_SLASHES); 
  exit;
}


// GET /api/promotions
if ($resource === 'promotions' && $_SERVER['REQUEST_METHOD'] === 'GET') {
  $db = db();
  $res = $db->query("
    SELECT 
      id,
      title,
      description,
      start_date,
      end_date,
      percent_off,
      fixed_amount,
      promo_code,
      image_url,
      isActive,
      createdAt
    FROM promotions
    WHERE isActive = 1
    ORDER BY start_date DESC, createdAt DESC
    LIMIT 50
  ");

  $out = [];
  $host = $_SERVER['HTTP_HOST'];

  while ($row = $res->fetch_assoc()) {
    // Types/formatages
    if (!empty($row['start_date']))   $row['start_date']   = date('Y-m-d', strtotime($row['start_date']));
    if (!empty($row['end_date']))     $row['end_date']     = date('Y-m-d', strtotime($row['end_date']));
    if (isset($row['percent_off']))   $row['percent_off']  = $row['percent_off']  !== null ? (float)$row['percent_off']  : null;
    if (isset($row['fixed_amount']))  $row['fixed_amount'] = $row['fixed_amount'] !== null ? (float)$row['fixed_amount'] : null;
    if (!empty($row['createdAt']))    $row['createdAt']    = date('c', strtotime($row['createdAt']));

    // Image absolue
    $img = $row['image_url'] ?? '';
    if ($img && strpos($img, 'http') !== 0) {
      // si ça ressemble à "/uploads/xxx.jpg"
      $img = 'https://' . $host . $img;
    }
    $row['image_url'] = $img;    // conservé
    $row['photo']     = $img;    // alias de compat éventuelle

    $out[] = $row;
  }

  if (isset($_GET['flat']) && $_GET['flat'] == '1') {
    echo json_encode($out, JSON_UNESCAPED_SLASHES); 
    exit;
  }

  echo json_encode(['promotions' => $out], JSON_UNESCAPED_SLASHES); 
  exit;
}


// 404 JSON
http_response_code(404);
echo json_encode(['error'=>'Not found']);
