<?php
// /public_html/api/promotions_diag.php
header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/config.php';

$out = [
  'ok' => false,
  'tables' => [],
  'probable_table' => null,
  'describe' => null,
  'sample' => null,
  'error' => null
];

try {
  mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
  $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT ?? 3306);
  $db->set_charset('utf8mb4');

  // 1) Liste des tables
  $res = $db->query("SHOW TABLES");
  $tbls = [];
  while ($r = $res->fetch_array(MYSQLI_NUM)) {
    $tbls[] = $r[0];
  }
  $out['tables'] = $tbls;

  // 2) Trouve une table "promos"
  $probable = null;
  foreach ($tbls as $t) {
    if (stripos($t, 'promo') !== false) { $probable = $t; break; }
  }
  if (!$probable && in_array('promotions', $tbls, true)) $probable = 'promotions';
  $out['probable_table'] = $probable;

  if ($probable) {
    // 3) Describe
    $d = $db->query("SHOW COLUMNS FROM `$probable`");
    $desc = [];
    while ($c = $d->fetch_assoc()) $desc[] = $c;
    $out['describe'] = $desc;

    // 4) Sample data
    $s = $db->query("SELECT * FROM `$probable` LIMIT 3");
    $rows = [];
    while ($row = $s->fetch_assoc()) $rows[] = $row;
    $out['sample'] = $rows;
  }

  $out['ok'] = true;
} catch (Throwable $e) {
  $out['error'] = $e->getMessage();
}

echo json_encode($out, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
