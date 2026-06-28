@echo off
cd /d D:\Final Year Project
pip install -r requirements.txt
cls
echo Starting Flask server...
echo Opening browser at http://localhost:3000
timeout /t 2 /nobreak
start http://localhost:3000
pip run python backend/app.py
