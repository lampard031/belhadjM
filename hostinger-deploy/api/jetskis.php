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
        if (strpos($request, '/featured') !== false) {
            $stmt = $pdo->query("SELECT * FROM jetskis WHERE featured = 1 ORDER BY created_at DESC");
        } else {
            $stmt = $pdo->query("SELECT * FROM jetskis ORDER BY created_at DESC");
        }
        
        $jetskis = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach($jetskis as &$jetski) {
            $jetski['images'] = json_decode($jetski['images'], true);
        }
        
        echo json_encode($jetskis);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO jetskis (brand, year, model, hours, price, images, engine, passengers, fuel, color, description, featured, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $images_json = json_encode($data['images']);
        
        $stmt->execute([
            $data['brand'],
            $data['year'],
            $data['model'],
            $data['hours'],
            $data['price'],
            $images_json,
            $data['engine'],
            $data['passengers'],
            $data['fuel'],
            $data['color'],
            $data['description'],
            $data['featured'] ? 1 : 0,
            'jetski'
        ]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        break;
        
    case 'PUT':
        // Mettre à jour un jet-ski
        parse_str(file_get_contents('php://input'), $data);
        $id = $data['id'];
        
        $stmt = $pdo->prepare("
            UPDATE jetskis SET brand=?, year=?, model=?, hours=?, price=?, engine=?, passengers=?, fuel=?, color=?, description=?, featured=?
            WHERE id=?
        ");
        
        $stmt->execute([
            $data['brand'],
            $data['year'], 
            $data['model'],
            $data['hours'],
            $data['price'],
            $data['engine'],
            $data['passengers'],
            $data['fuel'],
            $data['color'],
            $data['description'],
            $data['featured'] ? 1 : 0,
            $id
        ]);
        
        echo json_encode(['success' => true]);
        break;
        
    case 'DELETE':
        // Supprimer un jet-ski
        parse_str(file_get_contents('php://input'), $data);
        $id = $data['id'];
        
        $stmt = $pdo->prepare("DELETE FROM jetskis WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
        break;
}
?>
