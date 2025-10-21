<?php
// /public_html/api/promotions.php (version simple & robuste)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://triple7casino.ca');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require __DIR__ . '/config.php';

function db() {
  static $db = null;
  if ($db === null) {
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT ?? 3306);
    $db->set_charset('utf8mb4');
  }
  return $db;
}
function absolute($p){
  if(!$p) return '';
  if (preg_match('~^https?://~i', $p)) return $p;
  $host = $_SERVER['HTTP_HOST'] ?? 'triple7casino.ca';
  if ($p[0] !== '/') $p = '/'.$p;
  return 'https://' . $host . $p;
}
function first($row, $keys){
  foreach($keys as $k){
    if(isset($row[$k]) && is_string($row[$k]) && trim($row[$k])!=='') return $row[$k];
  }
  return '';
}

try {
  $db = db();
  // Trouve une table avec "promo" dedans
  $tables = [];
  $rt = $db->query("SHOW TABLES");
  while($r = $rt->fetch_array(MYSQLI_NUM)) $tables[] = $r[0];
  $table = null;
  foreach($tables as $t){ if (stripos($t,'promo')!==false){ $table = $t; break; } }
  if(!$table && in_array('promotions',$tables,true)) $table = 'promotions';
  if(!$table) { echo json_encode([]); exit; }

  // Récupérer seulement les promotions actives, triées par date
  $res = $db->query("SELECT * FROM `$table` WHERE isActive = 1 ORDER BY start_date DESC LIMIT 50");
  $out = [];
  while($row = $res->fetch_assoc()){
    $out[] = [
      'id'          => $row['id'] ?? null,
      'title'       => first($row, ['title','name']) ?: 'Promotion',
      'description' => first($row, ['description','desc','text']),
      'image_url'   => absolute(first($row, ['image_url','image','photo'])),
      'start_date'  => first($row, ['start_date','startDate','date_start']),
      'end_date'    => first($row, ['end_date','endDate','date_end']),
      'location'    => $row['location'] ?? '',
      'status'      => (function($v){
                        $v = strtolower(trim((string)$v));
                        if ($v==='' || $v==='1'||$v==='true'||$v==='active'||$v==='ongoing') return 'active';
                        if (strpos($v,'upcoming')!==false) return 'upcoming';
                        return 'active';
                      })( first($row,['status','state','isActive','active']) ),
    ];
  }

  if (isset($_GET['flat']) && $_GET['flat']=='1') {
    echo json_encode($out, JSON_UNESCAPED_SLASHES); exit;
  }
  echo json_encode(['promotions'=>$out], JSON_UNESCAPED_SLASHES); exit;

} catch(Throwable $e){
  http_response_code(500);
  echo json_encode(['error'=>'Internal error']); // volontairement non verbeux en prod
}
