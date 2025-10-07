<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$request = $_SERVER['REQUEST_URI'];

// Helper function to check admin authentication for write operations
function checkAdminAuth() {
    session_start();
    return isset($_SESSION['admin_logged']) && $_SESSION['admin_logged'] === true;
}

switch($method) {
    case 'GET':
        // Extraire l'ID de la requête si présent
        if (preg_match('/\/cars\/(\d+)/', $request, $matches)) {
            // Récupérer une voiture spécifique par ID
            $id = $matches[1];
            $stmt = $pdo->prepare("SELECT * FROM cars WHERE id = ?");
            $stmt->execute([$id]);
            $car = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($car) {
                $car['images'] = json_decode($car['images'], true);
                echo json_encode($car);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Voiture non trouvée']);
            }
        } else if (strpos($request, '/featured') !== false) {
            // Récupérer les voitures en vedette
            $stmt = $pdo->query("SELECT * FROM cars WHERE featured = 1 ORDER BY created_at DESC");
            $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach($cars as &$car) {
                $car['images'] = json_decode($car['images'], true);
            }
            
            echo json_encode($cars);
        } else {
            // Récupérer toutes les voitures
            $stmt = $pdo->query("SELECT * FROM cars ORDER BY created_at DESC");
            $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach($cars as &$car) {
                $car['images'] = json_decode($car['images'], true);
            }
            
            echo json_encode($cars);
        }
        break;
        
    case 'POST':
        // Ajouter une nouvelle voiture
        if (!checkAdminAuth()) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO cars (brand, year, model, mileage, price, images, fuel, transmission, color, description, featured, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $images_json = json_encode($data['images']);
        
        $stmt->execute([
            $data['brand'],
            $data['year'],
            $data['model'],
            $data['mileage'],
            $data['price'],
            $images_json,
            $data['fuel'],
            $data['transmission'],
            $data['color'],
            $data['description'],
            $data['featured'] ? 1 : 0,
            'car'
        ]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        break;
        
    case 'PUT':
        // Mettre à jour une voiture
        if (!checkAdminAuth()) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }
        
        parse_str(file_get_contents('php://input'), $data);
        $id = $data['id'];
        
        $stmt = $pdo->prepare("
            UPDATE cars SET brand=?, year=?, model=?, mileage=?, price=?, fuel=?, transmission=?, color=?, description=?, featured=?
            WHERE id=?
        ");
        
        $stmt->execute([
            $data['brand'],
            $data['year'], 
            $data['model'],
            $data['mileage'],
            $data['price'],
            $data['fuel'],
            $data['transmission'],
            $data['color'],
            $data['description'],
            $data['featured'] ? 1 : 0,
            $id
        ]);
        
        echo json_encode(['success' => true]);
        break;
        
    case 'DELETE':
        // Supprimer une voiture
        if (!checkAdminAuth()) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }
        
        parse_str(file_get_contents('php://input'), $data);
        $id = $data['id'];
        
        $stmt = $pdo->prepare("DELETE FROM cars WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
        break;
}
?>
