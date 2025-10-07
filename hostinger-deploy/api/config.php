<?php
// Configuration de la base de données MySQL Hostinger
$host = 'localhost'; // ou l'host fourni par Hostinger
$dbname = 'u123456789_ftc'; // Remplacez par votre nom de BDD
$username = 'u123456789_ftcuser'; // Remplacez par votre utilisateur BDD
$password = 'VOTRE_MOT_DE_PASSE_BDD'; // Remplacez par votre mot de passe BDD

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

// Configuration CORS pour React
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Gestion des requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
