<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$request = $_SERVER['REQUEST_URI'];

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
}
?>
