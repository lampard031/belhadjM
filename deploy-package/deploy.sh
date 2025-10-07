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
