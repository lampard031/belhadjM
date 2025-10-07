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
