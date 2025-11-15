@echo off
echo ========================================
echo    Deteniendo Todos los Procesos
echo ========================================
echo.

echo [1/2] Matando procesos de Node.js (Frontend)...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Procesos de Node.js detenidos
) else (
    echo - No hay procesos de Node.js corriendo
)

echo.
echo [2/2] Matando procesos de Python (Backend)...
taskkill /F /IM python.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Procesos de Python detenidos
) else (
    echo - No hay procesos de Python corriendo
)

echo.
echo ========================================
echo    Procesos Detenidos
echo ========================================
echo.
echo Puertos liberados:
echo - Puerto 3000 (Frontend)
echo - Puerto 8000 (Backend)
echo.
pause
