<?php
// /public_html/api/promotions.php - Version Corrigée v5.3
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
  http_response_code(200);
  exit; 
}

// Configuration DB
require_once __DIR__ . '/config.php';

// Debug mode - Mettre à false en production
$DEBUG = true;

// Fonction de connexion
function getDB() {
  try {
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT ?? 3306);
    if ($mysqli->connect_error) {
      throw new Exception("DB Connection failed: " . $mysqli->connect_error);
    }
    $mysqli->set_charset('utf8mb4');
    return $mysqli;
  } catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection error', 'debug' => $e->getMessage()]);
    exit;
  }
}

// Fonction pour construire URL absolue
function makeAbsoluteUrl($path) {
  if (!$path) return '';
  if (preg_match('~^https?://~i', $path)) return $path;
  
  $host = $_SERVER['HTTP_HOST'] ?? 'triple7casino.ca';
  if ($path[0] !== '/') $path = '/' . $path;
  return 'https://' . $host . $path;
}

try {
  $db = getDB();
  
  // Vérifier si la table existe
  $tableCheck = $db->query("SHOW TABLES LIKE 'promotions'");
  if ($tableCheck->num_rows === 0) {
    throw new Exception("Table 'promotions' does not exist");
  }
  
  // Récupérer les colonnes de la table
  $columns = [];
  $colResult = $db->query("SHOW COLUMNS FROM promotions");
  while ($col = $colResult->fetch_assoc()) {
    $columns[] = $col['Field'];
  }
  
  // Construire la requête selon les colonnes disponibles
  $hasIsActive = in_array('isActive', $columns);
  
  $sql = "SELECT * FROM promotions";
  
  // Ajouter filtre isActive si la colonne existe
  if ($hasIsActive) {
    $sql .= " WHERE isActive = 1";
  }
  
  $sql .= " ORDER BY ";
  
  // Tri par date si disponible
  if (in_array('start_date', $columns)) {
    $sql .= "start_date DESC, ";
  }
  if (in_array('createdAt', $columns)) {
    $sql .= "createdAt DESC";
  } else {
    $sql .= "id DESC";
  }
  
  $sql .= " LIMIT 50";
  
  $result = $db->query($sql);
  
  if (!$result) {
    throw new Exception("Query failed: " . $db->error);
  }
  
  $promotions = [];
  while ($row = $result->fetch_assoc()) {
    // Normaliser les données
    $promo = [
      'id' => $row['id'] ?? null,
      'title' => $row['title'] ?? 'Promotion',
      'description' => $row['description'] ?? '',
      'start_date' => $row['start_date'] ?? null,
      'end_date' => $row['end_date'] ?? null,
      'image_url' => '',
      'status' => 'active'
    ];
    
    // Gérer l'image
    if (!empty($row['image_url'])) {
      $promo['image_url'] = makeAbsoluteUrl($row['image_url']);
    } elseif (!empty($row['image'])) {
      $promo['image_url'] = makeAbsoluteUrl($row['image']);
    } elseif (!empty($row['photo'])) {
      $promo['image_url'] = makeAbsoluteUrl($row['photo']);
    }
    
    // Gérer le statut
    if (isset($row['status'])) {
      $promo['status'] = strtolower($row['status']);
    } elseif (isset($row['isActive'])) {
      $promo['status'] = $row['isActive'] == 1 ? 'active' : 'inactive';
    }
    
    // Ajouter tous les autres champs
    foreach ($row as $key => $value) {
      if (!isset($promo[$key])) {
        $promo[$key] = $value;
      }
    }
    
    $promotions[] = $promo;
  }
  
  // Debug info
  $debug = [];
  if ($DEBUG) {
    $debug = [
      'total_found' => count($promotions),
      'table_columns' => $columns,
      'query' => $sql,
      'has_isActive' => $hasIsActive
    ];
  }
  
  // Format de réponse
  if (isset($_GET['flat']) && $_GET['flat'] == '1') {
    $response = $promotions;
  } else {
    $response = ['promotions' => $promotions];
  }
  
  // Ajouter debug si activé
  if ($DEBUG && !empty($debug)) {
    $response['_debug'] = $debug;
  }
  
  echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'error' => 'Server error',
    'message' => $e->getMessage(),
    'promotions' => []
  ]);
}
