<?php
// /public_html/api/test_db.php - Test de connexion et données
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

$output = [
  'status' => 'testing',
  'connection' => null,
  'tables' => [],
  'promotions_structure' => [],
  'promotions_data' => [],
  'errors' => []
];

try {
  // Test connexion
  $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT ?? 3306);
  
  if ($mysqli->connect_error) {
    throw new Exception("Connection failed: " . $mysqli->connect_error);
  }
  
  $output['connection'] = '✅ Connecté à: ' . DB_NAME;
  $mysqli->set_charset('utf8mb4');
  
  // Liste des tables
  $tables = [];
  $result = $mysqli->query("SHOW TABLES");
  while ($row = $result->fetch_array(MYSQLI_NUM)) {
    $tables[] = $row[0];
  }
  $output['tables'] = $tables;
  
  // Vérifier si table promotions existe
  if (!in_array('promotions', $tables)) {
    $output['errors'][] = '❌ Table "promotions" n\'existe pas!';
  } else {
    $output['promotions_table'] = '✅ Table promotions existe';
    
    // Structure de la table
    $columns = [];
    $result = $mysqli->query("SHOW COLUMNS FROM promotions");
    while ($col = $result->fetch_assoc()) {
      $columns[] = [
        'Field' => $col['Field'],
        'Type' => $col['Type'],
        'Null' => $col['Null'],
        'Default' => $col['Default']
      ];
    }
    $output['promotions_structure'] = $columns;
    
    // Compter les promotions
    $result = $mysqli->query("SELECT COUNT(*) as total FROM promotions");
    $count = $result->fetch_assoc();
    $output['total_promotions'] = $count['total'];
    
    // Compter les promotions actives (si colonne existe)
    $hasIsActive = false;
    foreach ($columns as $col) {
      if ($col['Field'] === 'isActive') {
        $hasIsActive = true;
        break;
      }
    }
    
    if ($hasIsActive) {
      $result = $mysqli->query("SELECT COUNT(*) as total FROM promotions WHERE isActive = 1");
      $count = $result->fetch_assoc();
      $output['active_promotions'] = $count['total'];
    }
    
    // Récupérer toutes les promotions (max 5)
    $result = $mysqli->query("SELECT * FROM promotions LIMIT 5");
    $promos = [];
    while ($row = $result->fetch_assoc()) {
      $promos[] = $row;
    }
    $output['promotions_data'] = $promos;
  }
  
  $output['status'] = '✅ SUCCESS';
  
} catch (Exception $e) {
  $output['status'] = '❌ ERROR';
  $output['errors'][] = $e->getMessage();
}

echo json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
