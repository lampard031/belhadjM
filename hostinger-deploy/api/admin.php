<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Helper function to check admin authentication
function checkAdminAuth() {
    session_start();
    return isset($_SESSION['admin_logged']) && $_SESSION['admin_logged'] === true;
}

if($method === 'POST') {
    if (strpos($request_uri, '/login') !== false) {
        // Login endpoint
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Simple verification (in production, use proper hashing)
        if($data['username'] === 'admin' && $data['password'] === 'admin123') {
            session_start();
            $_SESSION['admin_logged'] = true;
            $_SESSION['admin_username'] = 'admin';
            echo json_encode([
                'success' => true, 
                'message' => 'Connexion réussie',
                'user' => ['username' => 'admin', 'role' => 'admin']
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Identifiants invalides']);
        }
    } else if (strpos($request_uri, '/logout') !== false) {
        // Logout endpoint
        session_start();
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Déconnexion réussie']);
    }
} else if($method === 'GET') {
    if (strpos($request_uri, '/status') !== false || strpos($request_uri, '/admin') !== false) {
        // Check admin status
        session_start();
        $is_logged = isset($_SESSION['admin_logged']) && $_SESSION['admin_logged'] === true;
        
        if ($is_logged) {
            echo json_encode([
                'logged_in' => true,
                'user' => [
                    'username' => $_SESSION['admin_username'] ?? 'admin',
                    'role' => 'admin'
                ]
            ]);
        } else {
            echo json_encode(['logged_in' => false]);
        }
    } else if (strpos($request_uri, '/stats') !== false) {
        // Dashboard statistics
        if (!checkAdminAuth()) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }
        
        // Get statistics
        try {
            $cars_count = $pdo->query("SELECT COUNT(*) as count FROM cars")->fetch(PDO::FETCH_ASSOC)['count'];
            $jetskis_count = $pdo->query("SELECT COUNT(*) as count FROM jetskis")->fetch(PDO::FETCH_ASSOC)['count'];
            $avg_car_price = $pdo->query("SELECT AVG(price) as avg_price FROM cars")->fetch(PDO::FETCH_ASSOC)['avg_price'];
            $avg_jetski_price = $pdo->query("SELECT AVG(price) as avg_price FROM jetskis")->fetch(PDO::FETCH_ASSOC)['avg_price'];
            
            echo json_encode([
                'success' => true,
                'stats' => [
                    'cars_count' => intval($cars_count),
                    'jetskis_count' => intval($jetskis_count),
                    'total_vehicles' => intval($cars_count) + intval($jetskis_count),
                    'avg_car_price' => floatval($avg_car_price ?? 0),
                    'avg_jetski_price' => floatval($avg_jetski_price ?? 0)
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors du calcul des statistiques: ' . $e->getMessage()]);
        }
    }
}
?>
