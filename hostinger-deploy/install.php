<?php
/**
 * SCRIPT D'INSTALLATION AUTOMATIQUE FTC AUTOMÓVEIS
 * Téléchargez ce fichier avec les autres sur Hostinger
 * Visitez : votredomaine.com/install.php
 */

if ($_POST['install'] ?? false) {
    $host = $_POST['db_host'] ?? 'localhost';
    $dbname = $_POST['db_name'];
    $username = $_POST['db_user'];
    $password = $_POST['db_pass'];
    
    // 1. Tester la connexion
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
        echo "<div style='color:green'>✅ Connexion MySQL réussie!</div>";
    } catch(PDOException $e) {
        die("<div style='color:red'>❌ Erreur MySQL: " . $e->getMessage() . "</div>");
    }
    
    // 2. Créer les tables automatiquement
    $sql = file_get_contents(__DIR__ . '/api/setup_database.sql');
    if ($sql) {
        $pdo->exec($sql);
        echo "<div style='color:green'>✅ Tables créées avec succès!</div>";
    }
    
    // 3. Mettre à jour config.php automatiquement
    $config_content = "<?php
// Configuration générée automatiquement
\$host = '$host';
\$dbname = '$dbname';
\$username = '$username';
\$password = '$password';

try {
    \$pdo = new PDO(\"mysql:host=\$host;dbname=\$dbname;charset=utf8\", \$username, \$password);
    \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException \$e) {
    die(\"Erreur de connexion : \" . \$e->getMessage());
}

// Configuration CORS pour React
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Gestion des requêtes OPTIONS (CORS preflight)
if (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>";
    
    file_put_contents(__DIR__ . '/api/config.php', $config_content);
    echo "<div style='color:green'>✅ Configuration sauvegardée!</div>";
    
    // 4. Supprimer ce fichier d'installation pour sécurité
    echo "<div style='color:orange'>🔒 IMPORTANT: Supprimez maintenant le fichier install.php pour la sécurité!</div>";
    echo "<div style='color:blue'>🎉 <strong>INSTALLATION TERMINÉE!</strong> Visitez: <a href='/'>votresite.com</a></div>";
    
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Installation FTC Automóveis</title>
    <style>
        body { font-family: Arial; max-width: 500px; margin: 50px auto; padding: 20px; }
        input, button { width: 100%; padding: 10px; margin: 5px 0; }
        button { background: #007cba; color: white; border: none; cursor: pointer; }
        .info { background: #f0f8ff; padding: 15px; border-left: 4px solid #007cba; margin: 15px 0; }
    </style>
</head>
<body>
    <h1>🚗 Installation FTC Automóveis</h1>
    
    <div class="info">
        <strong>📋 Avant de commencer :</strong><br>
        1. Créez une base MySQL dans Hostinger hPanel<br>
        2. Notez : nom base, utilisateur, mot de passe<br>
        3. Remplissez le formulaire ci-dessous
    </div>

    <form method="post">
        <h3>Informations MySQL :</h3>
        <input type="text" name="db_host" value="localhost" placeholder="Hôte (généralement localhost)">
        <input type="text" name="db_name" placeholder="Nom de la base de données" required>
        <input type="text" name="db_user" placeholder="Utilisateur MySQL" required>
        <input type="password" name="db_pass" placeholder="Mot de passe MySQL" required>
        
        <button type="submit" name="install" value="1">🚀 INSTALLER MAINTENANT</button>
    </form>
    
    <div class="info">
        <strong>⚡ Ce script va :</strong><br>
        ✅ Tester la connexion MySQL<br>
        ✅ Créer toutes les tables automatiquement<br>
        ✅ Configurer l'API PHP<br>
        ✅ Insérer des données de démonstration
    </div>
</body>
</html>