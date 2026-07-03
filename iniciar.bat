@echo off
rem ============================================================
rem  Inicia o site + sistema do consultorio com dois cliques.
rem  Requisito: Node.js 22.5 ou superior (https://nodejs.org)
rem ============================================================
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Baixe em: https://nodejs.org
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando dependencias pela primeira vez...
  call npm install --no-fund --no-audit
)

echo.
echo  Site publico:   http://localhost:3000
echo  Area restrita:  http://localhost:3000/login.html
echo  (feche esta janela para desligar o servidor)
echo.
start "" http://localhost:3000
node server.js
