#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

export PM2_HOME="/home/kali/Documentos/punto-de-acceso/.pm2"
pm2 stop all
echo "🛑 Servidores de VitalFit detenidos."
