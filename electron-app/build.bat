@echo off
echo ============================================
echo Building Hostel Music Queue Admin Desktop App
echo ============================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Building Windows installer...
echo.

call npm run build:win

echo.
echo ============================================
echo Build complete!
echo ============================================
echo.
echo Your installer is in the dist\ folder:
dir /B dist\*.exe
echo.
echo You can now distribute this to hostel staff!
echo.
pause
