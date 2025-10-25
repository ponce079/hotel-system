@echo off
echo ============================================================
echo    Sistema de Gestion Hotelera
echo ============================================================
echo.

echo [1/2] Iniciando Backend (Node.js + Express)...
start cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] Iniciando Frontend (React + Vite)...
start cmd /k "cd frontend && pnpm run dev"

echo.
echo ============================================================
echo Sistema iniciado correctamente!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Credenciales:
echo   Email:    admin@hotel.com
echo   Password: admin123
echo ============================================================
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
