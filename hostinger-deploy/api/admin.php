<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Vérification simple (en production, utilisez un hash)
    if($data['username'] === 'admin' && $data['password'] === 'admin123') {
        session_start();
        $_SESSION['admin_logged'] = true;
        echo json_encode(['success' => true, 'message' => 'Connexion réussie']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Identifiants invalides']);
    }
} else if($method === 'GET') {
    // Vérifier si l'admin est connecté
    session_start();
    echo json_encode(['logged_in' => isset($_SESSION['admin_logged'])]);
}
?>
