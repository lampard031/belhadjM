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
