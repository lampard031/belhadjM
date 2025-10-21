<?php
require_once __DIR__ . '/_bootstrap.php';

$db = db();
$sql = "SELECT id, amount, game, date, photo,
               isActive, createdAt
        FROM winners
        WHERE isActive = 1
        ORDER BY createdAt DESC
        LIMIT 100";
$res = $db->query($sql);

$rows = [];
if ($res) {
  while ($x = $res->fetch_assoc()) {
    $x['isActive'] = intval($x['isActive']);
    if (isset($x['amount'])) $x['amount'] = $x['amount'] !== null ? floatval($x['amount']) : null;
    $rows[] = $x;
  }
}

if (isset($_GET['flat'])) {
  json_ok($rows);
} else {
  json_ok($rows, 'winners');
}
