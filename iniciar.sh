#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

export PM2_HOME="/home/kali/Documentos/punto-de-acceso/.pm2"
cd /home/kali/Documentos/punto-de-acceso
pm2 start ecosystem.config.js
pm2 status
echo ""
echo "=================================================="
echo "🚀 VitalFit / Punto de Inflexión está corriendo!"
echo "👉 Frontend (App Web): http://localhost:3001"
echo "👉 Backend (API):     http://localhost:3000/api/v1"
echo "=================================================="
