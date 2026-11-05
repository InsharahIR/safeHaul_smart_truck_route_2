@echo off
echo ====================================================
echo Starting SafeHaul Django Backend Server...
echo ====================================================
cd /d "%~dp0backend"
if exist "..\venv\Scripts\python.exe" (
    ..\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
) else (
    python manage.py runserver 127.0.0.1:8000
)
pause
