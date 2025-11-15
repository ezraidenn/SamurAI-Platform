@echo off
echo ========================================
echo    UCU Reporta - Inicio Completo
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "backend" (
    echo ERROR: No se encuentra la carpeta backend
    echo Asegurate de ejecutar este script desde la raiz del proyecto
    pause
    exit /b 1
)

echo [1/3] Iniciando Backend...
echo.
start "UCU Reporta - Backend" cmd /k "python start_backend.py"

echo Esperando 5 segundos para que el backend inicie...
timeout /t 5 /nobreak >nul

echo.
echo [2/3] Iniciando Frontend...
echo.
start "UCU Reporta - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo [3/3] Abriendo navegador...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo    Servicios Iniciados!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Presiona cualquier tecla para cerrar esta ventana
echo (Los servicios seguiran corriendo en sus propias ventanas)
pause >nul
