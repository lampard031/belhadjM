<?php
// Point d'entrée principal pour l'API FTC Automóveis
// Router simple pour Hostinger shared hosting

$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Supprimer les paramètres de la query string
$path = parse_url($request_uri, PHP_URL_PATH);

// Router simple
if (strpos($path, '/api/cars') !== false) {
    require_once 'api/cars.php';
    exit;
}

if (strpos($path, '/api/jetskis') !== false) {
    require_once 'api/jetskis.php';
    exit;
}

if (strpos($path, '/api/admin') !== false) {
    require_once 'api/admin.php';
    exit;
}

// Si aucune route API n'est trouvée, servir le frontend React
// Pour les autres requêtes, rediriger vers index.html (React Router)
if (!strpos($path, '/api/')) {
    // Vérifier si le fichier existe
    $file_path = __DIR__ . $path;
    
    if (is_file($file_path)) {
        // Servir le fichier statique
        $mime_type = mime_content_type($file_path);
        header('Content-Type: ' . $mime_type);
        readfile($file_path);
        exit;
    } else {
        // Rediriger vers index.html pour React Router
        require_once 'index.html';
        exit;
    }
}

// Route par défaut - API status
header('Content-Type: application/json');
echo json_encode([
    'status' => 'FTC Automóveis API is running',
    'version' => '1.0',
    'endpoints' => [
        '/api/cars' => 'CRUD operations for cars',
        '/api/jetskis' => 'CRUD operations for jet-skis', 
        '/api/admin' => 'Admin authentication'
    ]
]);
?>