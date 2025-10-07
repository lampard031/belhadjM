#!/bin/bash

echo "🌐 Préparation des fichiers pour Hébergement Web Hostinger"
echo "=========================================================="

# Création du dossier de déploiement
mkdir -p hostinger-deploy
cd hostinger-deploy

echo "🔨 Build du frontend React..."
cd ../frontend
yarn build
cd ../hostinger-deploy

# Copie des fichiers React build
echo "📁 Copie du frontend..."
cp -r ../frontend/build/* ./

echo "🔧 Création du backend PHP..."

# Création de la structure PHP
mkdir -p api

# Configuration de base de données MySQL
cat > api/config.php << 'EOF'
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
EOF

# API pour les voitures
cat > api/cars.php << 'EOF'
<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$request = $_SERVER['REQUEST_URI'];

switch($method) {
    case 'GET':
        if (strpos($request, '/featured') !== false) {
            // Récupérer les voitures en vedette
            $stmt = $pdo->query("SELECT * FROM cars WHERE featured = 1 ORDER BY created_at DESC");
        } else {
            // Récupérer toutes les voitures
            $stmt = $pdo->query("SELECT * FROM cars ORDER BY created_at DESC");
        }
        
        $cars = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Conversion du format pour compatibilité frontend
        foreach($cars as &$car) {
            $car['images'] = json_decode($car['images'], true);
        }
        
        echo json_encode($cars);
        break;
        
    case 'POST':
        // Ajouter une nouvelle voiture
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
        parse_str(file_get_contents('php://input'), $data);
        $id = $data['id'];
        
        $stmt = $pdo->prepare("DELETE FROM cars WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
        break;
}
?>
EOF

# API pour les jet-skis
cat > api/jetskis.php << 'EOF'
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
EOF

# API pour l'authentification admin
cat > api/admin.php << 'EOF'
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
EOF

# Script SQL pour créer les tables
cat > api/setup_database.sql << 'EOF'
-- Base de données pour FTC Automóveis
-- À exécuter dans phpMyAdmin Hostinger

-- Table des voitures
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    model VARCHAR(100) NOT NULL,
    mileage INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    images JSON,
    fuel VARCHAR(50) NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    type VARCHAR(20) DEFAULT 'car',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des jet-skis
CREATE TABLE IF NOT EXISTS jetskis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    model VARCHAR(100) NOT NULL,
    hours INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    images JSON,
    engine VARCHAR(100) NOT NULL,
    passengers INT NOT NULL,
    fuel VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    type VARCHAR(20) DEFAULT 'jetski',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Données d'exemple pour les voitures
INSERT INTO cars (brand, year, model, mileage, price, images, fuel, transmission, color, description, featured) VALUES
('BMW', 2020, '320i', 45000, 28500.00, '["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop"]', 'Gasolina', 'Automática', 'Preto', 'BMW 320i em excelente estado, com todos os extras de série.', TRUE),
('Mercedes-Benz', 2019, 'C200', 52000, 32000.00, '["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&h=300&fit=crop"]', 'Gasolina', 'Automática', 'Prata', 'Mercedes-Benz C200 com interior em pele e navegação GPS.', TRUE),
('Audi', 2021, 'A4', 25000, 35000.00, '["https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=500&h=300&fit=crop"]', 'Diesel', 'Automática', 'Branco', 'Audi A4 quase novo com garantia de fábrica ainda válida.', TRUE);

-- Données d'exemple pour les jet-skis
INSERT INTO jetskis (brand, year, model, hours, price, images, engine, passengers, fuel, color, description, featured) VALUES
('Yamaha', 2023, 'VX Cruiser HO', 45, 18500.00, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop"]', '1812cc', 3, 'Gasolina', 'Azul/Branco', 'Yamaha VX Cruiser HO em excelente estado, ideal para passeios familiares.', TRUE),
('Sea-Doo', 2022, 'GTX 230', 78, 22000.00, '["https://images.unsplash.com/photo-1607473129281-bc8e9a88540e?w=500&h=300&fit=crop"]', '1630cc Rotax', 3, 'Gasolina', 'Preto/Amarelo', 'Sea-Doo GTX 230 com sistema de som e GPS integrado.', TRUE);
EOF

# Fichier .htaccess pour la redirection des routes React
cat > .htaccess << 'EOF'
# Redirection pour React Router
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # API calls - rediriger vers PHP
  RewriteRule ^api/cars/?$ api/cars.php [L,QSA]
  RewriteRule ^api/jetskis/?$ api/jetskis.php [L,QSA]
  RewriteRule ^api/admin/?$ api/admin.php [L,QSA]
  
  # React Router - toutes les autres routes vers index.html
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Configuration des en-têtes CORS
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Compression et cache pour les performances
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
</IfModule>
EOF

# Instructions d'installation
cat > INSTRUCTIONS_HOSTINGER.md << 'EOF'
# 🚀 Installation sur Hostinger - Hébergement Web

## 📋 Étapes d'installation :

### 1. 🗄️ Base de données MySQL
1. Connectez-vous à votre hPanel Hostinger
2. Allez dans "Bases de données MySQL"
3. Créez une nouvelle base de données : `u123456789_ftc`
4. Créez un utilisateur : `u123456789_ftcuser`
5. Assignez l'utilisateur à la base de données
6. Ouvrez phpMyAdmin
7. Importez le fichier `api/setup_database.sql`

### 2. 📝 Configuration
1. Éditez `api/config.php`
2. Remplacez les infos de BDD par les vraies :
   - $dbname = 'votre_vraie_bdd';
   - $username = 'votre_vrai_user';
   - $password = 'votre_vrai_password';

### 3. 📁 Upload des fichiers
1. Allez dans "Gestionnaire de fichiers" dans hPanel
2. Naviguez vers `public_html/`
3. Supprimez tous les fichiers existants
4. Uploadez TOUS les fichiers de ce dossier hostinger-deploy/

### 4. 🌐 Accès au site
- Site : https://www.ftcautomoveis.com
- Admin : https://www.ftcautomoveis.com/admin
- Login admin : admin / admin123

## 🔧 Configuration du domaine
Dans les paramètres de domaine Hostinger, pointez ftcautomoveis.com vers ce dossier.

## ✅ Vérification
- Testez l'accès au site
- Testez la connexion admin
- Vérifiez que les voitures s'affichent
- Testez l'ajout d'une voiture depuis l'admin
EOF

echo ""
echo "✅ Fichiers préparés pour Hostinger dans ./hostinger-deploy/"
echo ""
echo "📋 PROCHAINES ÉTAPES :"
echo "1. 📖 Lisez INSTRUCTIONS_HOSTINGER.md"
echo "2. 🗄️ Créez votre base de données MySQL sur Hostinger"
echo "3. 📝 Modifiez api/config.php avec vos vraies infos BDD"
echo "4. 📁 Uploadez tous les fichiers vers public_html/"
echo "5. 🌐 Configurez votre domaine"
echo ""
echo "🎉 Votre site sera accessible sur https://www.ftcautomoveis.com"