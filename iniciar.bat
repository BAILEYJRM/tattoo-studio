@echo off
title Tattoo Studio - Inicio Rapido
color 0A

echo ========================================================
echo         INICIANDO TATTOO STUDIO - SERVICIOS
echo ========================================================
echo.

:: 1. Iniciar servidor Backend
echo [1/3] Iniciando Servidor Backend (Puerto 5000)...
start "Tattoo Studio - Backend" cmd /k "cd /d %~dp0backend && npm run dev"

:: 2. Iniciar servidor Frontend
echo [2/3] Iniciando Servidor Frontend (Puerto 3000)...
start "Tattoo Studio - Frontend" cmd /k "cd /d %~dp0frontend && npm start"

:: 3. Esperar y abrir el navegador
echo [3/3] Abriendo el navegador en http://localhost:3000 ...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================================
echo ¡Servicios iniciados correctamente!
echo.
echo  - Backend:  http://localhost:5000
echo  - Frontend: http://localhost:3000
echo.
echo Cierra las ventanas de comandos para detener el servidor.
echo ========================================================
echo.

pause
