#!/bin/bash
echo "🔧 Déploiement du backend FastAPI..."

# Création du répertoire de l'app
mkdir -p /var/www/ftcautomoveis/backend
cd /var/www/ftcautomoveis/backend

# Copie des fichiers backend
cp -r /tmp/deploy-package/backend/* .

# Création de l'environnement virtuel Python
python3 -m venv venv
source venv/bin/activate

# Installation des dépendances
pip install -r requirements.txt

# Configuration de l'environnement
cat > .env << 'ENVEOF'
MONGO_URL=mongodb://localhost:27017/
DB_NAME=ftc_automoveis
PYTHONPATH=/var/www/ftcautomoveis/backend
ENVEOF

# Configuration PM2
cat > ecosystem.config.js << 'PMEOF'
module.exports = {
  apps: [{
    name: 'ftc-api',
    script: 'venv/bin/uvicorn',
    args: 'server:app --host 0.0.0.0 --port 8001',
    cwd: '/var/www/ftcautomoveis/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
PMEOF

# Démarrage avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Backend déployé et démarré !"
