@echo off
echo ====================================================
echo Launching SafeHaul Full-Stack Application...
echo ====================================================
start "SafeHaul Backend (Django)" cmd /k "cd /d %~dp0 && start_backend.bat"
timeout /t 3 /nobreak >nul
start "SafeHaul Frontend (React)" cmd /k "cd /d %~dp0 && start_frontend.bat"
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
echo Both Django and React servers have been launched in separate windows!
echo Your browser should open http://localhost:5173 automatically.
echo (You can also view http://127.0.0.1:8000 for Django API)
