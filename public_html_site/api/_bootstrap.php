<?php
// API bootstrap commun

// Autoriser lecture publique (CORS pour le front)
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// Charger la config existante (DB, db(), ensure_tables(), etc.)
// -> adapte ce chemin si ton "config.php" est ailleurs
$root = dirname(__DIR__);
$configFile = $root . '/admin/config.php';
if (!file_exists($configFile)) {
  http_response_code(500);
  echo json_encode(['error' => 'config.php introuvable']);
  exit;
}
require_once $configFile;

// S’assure que les tables existent (si la fonction est dispo)
if (function_exists('ensure_tables')) {
  ensure_tables();
}

// Petit helper pour sortir du JSON proprement
function json_ok($payload, $wrapKey = null) {
  if ($wrapKey) {
    echo json_encode([$wrapKey => $payload], JSON_UNESCAPED_UNICODE);
  } else {
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  }
  exit;
}
