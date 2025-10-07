#!/bin/bash

echo "🚀 Script de déploiement FTC Automóveis sur Hostinger VPS"
echo "========================================================="

# Variables à configurer
VPS_IP="VOTRE_IP_VPS"
VPS_USER="root"
DOMAIN="ftcautomoveis.com"

echo "📁 Préparation des fichiers..."

# 1. Build du frontend
echo "🔨 Build du frontend React..."
cd /app/frontend
yarn build

# 2. Création du package de déploiement
echo "📦 Création du package de déploiement..."
cd /app
mkdir -p deploy-package
cp -r backend deploy-package/
cp -r frontend/build deploy-package/frontend-build
cp contracts.md deploy-package/

# 3. Création des scripts d'installation serveur
cat > deploy-package/install-server.sh << 'EOF'
#!/bin/bash
echo "🔧 Installation des dépendances sur le VPS..."

# Mise à jour système
apt update && apt upgrade -y

# Installation Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Installation Python 3.9+
apt install -y python3 python3-pip python3-venv

# Installation Nginx
apt install -y nginx

# Installation MongoDB
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Démarrage des services
systemctl enable mongod
systemctl start mongod
systemctl enable nginx
systemctl start nginx

# Installation PM2 pour le backend Python
npm install -g pm2

echo "✅ Installation des dépendances terminée !"
EOF

# 4. Configuration Nginx
cat > deploy-package/nginx-ftc.conf << 'EOF'
server {
    listen 80;
    server_name ftcautomoveis.com www.ftcautomoveis.com;

    # Frontend React (fichiers statiques)
    location / {
        root /var/www/ftcautomoveis/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Backend FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gestion des fichiers statiques
    location /static/ {
        root /var/www/ftcautomoveis/frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 5. Script de déploiement backend
cat > deploy-package/deploy-backend.sh << 'EOF'
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
EOF

# 6. Script de déploiement frontend
cat > deploy-package/deploy-frontend.sh << 'EOF'
#!/bin/bash
echo "🎨 Déploiement du frontend React..."

# Création du répertoire frontend
mkdir -p /var/www/ftcautomoveis/frontend

# Copie des fichiers build
cp -r /tmp/deploy-package/frontend-build/* /var/www/ftcautomoveis/frontend/

# Configuration Nginx
cp /tmp/deploy-package/nginx-ftc.conf /etc/nginx/sites-available/ftcautomoveis.com
ln -sf /etc/nginx/sites-available/ftcautomoveis.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test et redémarrage Nginx
nginx -t && systemctl reload nginx

echo "✅ Frontend déployé !"
EOF

# 7. Script principal de déploiement
cat > deploy-package/deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Déploiement complet FTC Automóveis"
echo "===================================="

# Rendre les scripts exécutables
chmod +x /tmp/deploy-package/*.sh

# 1. Installation des dépendances système
/tmp/deploy-package/install-server.sh

# 2. Déploiement du backend
/tmp/deploy-package/deploy-backend.sh

# 3. Déploiement du frontend  
/tmp/deploy-package/deploy-frontend.sh

# 4. Configuration du firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo "🎉 Déploiement terminé !"
echo "Site accessible sur : http://ftcautomoveis.com"
echo "Admin accessible sur : http://ftcautomoveis.com/admin"
EOF

chmod +x deploy-package/*.sh

echo "✅ Package de déploiement créé dans ./deploy-package/"
echo ""
echo "📋 PROCHAINES ÉTAPES :"
echo "1. Modifiez VPS_IP dans ce script avec votre vraie IP VPS"
echo "2. Envoyez le package sur votre VPS avec :"
echo "   scp -r deploy-package root@VOTRE_IP_VPS:/tmp/"
echo "3. Connectez-vous en SSH et lancez :"
echo "   ssh root@VOTRE_IP_VPS"
echo "   cd /tmp && chmod +x deploy-package/deploy.sh && ./deploy-package/deploy.sh"
echo ""
echo "🌐 Après déploiement, configurez votre domaine ftcautomoveis.com"
echo "   pour pointer vers l'IP de votre VPS dans votre registrar de domaine."