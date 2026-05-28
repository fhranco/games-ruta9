#!/bin/bash

# Navigate to script directory
cd "$(dirname "$0")"

echo "=== DIAGNOSTICO DE INICIO DE JUEGOS ===" > server.log
echo "Fecha: $(date)" >> server.log
echo "Version Node: $(node -v)" >> server.log
echo "Version NPM: $(npm -v)" >> server.log
echo "Ruta actual: $(pwd)" >> server.log

echo "--------------------------------------" >> server.log
echo "Instalando dependencias necesarias..." >> server.log
npm install >> server.log 2>&1

# Run server.cjs in the background and redirect output to server.log
echo "Iniciando servidor central de stock server.cjs en puerto 3001..." >> server.log
node server.cjs >> server.log 2>&1 &
SERVER_PID=$!
echo "Servidor central de stock iniciado en segundo plano con PID: $SERVER_PID" >> server.log

echo "--------------------------------------" >> server.log
echo "Iniciando servidor Vite en puerto 3333..." >> server.log

# Run Vite in the background and redirect output to server.log
npx vite --port 3333 --host >> server.log 2>&1 &
VITE_PID=$!

echo "Vite iniciado en segundo plano con PID: $VITE_PID" >> server.log
sleep 4

echo "--------------------------------------" >> server.log
echo "Verificando si los servidores siguen activos..." >> server.log
if ps -p $VITE_PID > /dev/null; then
  echo "¡Servidor Vite INICIADO EXITOSAMENTE en puerto 3333!" >> server.log
else
  echo "El servidor Vite se detuvo. Revisa los logs de arriba." >> server.log
fi

if ps -p $SERVER_PID > /dev/null; then
  echo "¡Servidor Stock INICIADO EXITOSAMENTE en puerto 3001!" >> server.log
else
  echo "El servidor de stock se detuvo. Revisa los logs de arriba." >> server.log
fi

