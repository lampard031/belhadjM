<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://triple7casino.ca');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__.'/config.php';

function require_admin() {
  $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!preg_match('/Bearer\s+(.+)/i', $hdr, $m)) { http_response_code(401); echo json_encode(["error"=>"missing_bearer"]); exit; }
  if ($m[1] !== ADMIN_BEARER) { http_response_code(403); echo json_encode(["error"=>"invalid_token"]); exit; }
}
require_admin();

if (!isset($_FILES['file'])) { http_response_code(400); echo json_encode(["error"=>"no_file"]); exit; }
$allowed = ['image/jpeg','image/jpg','image/png','image/webp'];
if (!in_array($_FILES['file']['type'], $allowed)) { http_response_code(400); echo json_encode(["error"=>"bad_type"]); exit; }

$ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
$name = bin2hex(random_bytes(8)).'.'.$ext;

$destDir = dirname(__DIR__).'/uploads';
if (!is_dir($destDir)) { mkdir($destDir,0755,true); }
$dest = $destDir.'/'.$name;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $dest)) { http_response_code(500); echo json_encode(["error"=>"move_failed"]); exit; }
$url = 'https://'.$_SERVER['HTTP_HOST'].'/uploads/'.$name;
echo json_encode(["success"=>true,"url"=>$url,"filename"=>$name]);
