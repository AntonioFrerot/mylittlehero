#!/usr/bin/env bash
# À exécuter UNE FOIS sur le VPS (Ubuntu 22.04/24.04), en root ou avec sudo.
set -euo pipefail

apt update
apt install -y curl git nginx

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

npm install -g pm2

echo "OK — Node $(node -v), npm $(npm -v)"
echo "Prochaine étape : cloner le repo dans /var/www/petit-heros-film"
