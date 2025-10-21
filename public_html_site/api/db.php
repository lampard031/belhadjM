<?php
require_once __DIR__.'/config.php';

function db() {
  static $mysqli = null;
  if ($mysqli === null) {
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
    if ($mysqli->connect_error) {
      http_response_code(500);
      echo json_encode(["error"=>"db_connect_failed","detail"=>$mysqli->connect_error]);
      exit;
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
  $conn = db();
  foreach ($sqls as $ddl) { $conn->query($ddl); }
}
