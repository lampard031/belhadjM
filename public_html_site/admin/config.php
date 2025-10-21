<?php
session_start();

define('ADMIN_USER', 'admin');
define('ADMIN_PASS_PLAIN', 'casino2024'); // <<< temporaire, pour te connecter
define('ADMIN_PASS_HASH', '$2y$10$kqR0cmYQ0/lVVCE7K0S68ulTFxM/cUnHEWcXWb3.1Wz/EbmfS3b3u'); // laissé tel quel pour l’instant


// MySQL Hostinger
define('DB_HOST', '127.0.0.1');
define('DB_PORT', 3306);
define('DB_NAME', 'u498246000_triple7casino');
define('DB_USER', 'u498246000_admin');
define('DB_PASS', 'HiV2a|2TJ9?5');

function db() {
  static $mysqli = null;
  if ($mysqli === null) {
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
    if ($mysqli->connect_error) {
      die('DB connect error: '.$mysqli->connect_error);
    }
    $mysqli->set_charset('utf8mb4');
  }
  return $mysqli;
}

function ensure_tables() {
  $sqls = [
    "CREATE TABLE IF NOT EXISTS winners (
      id VARCHAR(64) PRIMARY KEY,
      amount DECIMAL(10,2) NOT NULL,
      game VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      photo TEXT NOT NULL,
      isActive TINYINT(1) DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      event_date DATE,
      start_time TIME,
      price DECIMAL(10,2) NULL,
      image_url TEXT NULL,
      isActive TINYINT(1) DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    "CREATE TABLE IF NOT EXISTS promotions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      percent_off DECIMAL(5,2) NULL,
      fixed_amount DECIMAL(10,2) NULL,
      promo_code VARCHAR(50) NULL,
      image_url TEXT NULL,
      isActive TINYINT(1) DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  ];
  $db = db();
  foreach ($sqls as $ddl) { $db->query($ddl); }
}

function require_login() {
  if (empty($_SESSION['admin_logged'])) {
    header('Location: /admin/login.php'); exit;
  }
}

function csrf_token() {
  if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
  return $_SESSION['csrf'];
}
function csrf_check($t) {
  return isset($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $t ?? '');
}
function upload_image($field, $subdir = '') {
  if (empty($_FILES[$field]) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) return null;
  $allowed = ['image/jpeg','image/jpg','image/png','image/webp'];
  if (!in_array(mime_content_type($_FILES[$field]['tmp_name']), $allowed)) return null;

  $ext  = strtolower(pathinfo($_FILES[$field]['name'], PATHINFO_EXTENSION));
  $name = bin2hex(random_bytes(8)).'.'.$ext;

  $base = dirname(__DIR__).'/uploads';
  if ($subdir) $base .= '/'.$subdir;
  if (!is_dir($base)) mkdir($base, 0755, true);

  $dest = $base.'/'.$name;
  if (!move_uploaded_file($_FILES[$field]['tmp_name'], $dest)) return null;

  $host = $_SERVER['HTTP_HOST'];
  $url  = '/uploads'.($subdir ? '/'.$subdir : '').'/'.$name;
  return "https://{$host}{$url}";
}

