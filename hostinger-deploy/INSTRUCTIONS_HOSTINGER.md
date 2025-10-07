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
