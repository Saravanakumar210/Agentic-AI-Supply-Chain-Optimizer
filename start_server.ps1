#!/usr/bin/env pwsh
# Start Flask Server

$projectPath = "D:\Final Year Project"
Set-Location $projectPath

Write-Host "Installing dependencies..." -ForegroundColor Green
pip install -r requirements.txt --quiet

Write-Host "Starting Flask server on http://localhost:3000..." -ForegroundColor Green
Write-Host ""

# Try to find Python via pip and extract the path
$pipPythonPath = (pip show pip | Select-String "Location:" | ForEach-Object { $_ -replace "^Location: ", "" }) | ForEach-Object { Split-Path $_ -Parent } | ForEach-Object { Join-Path $_ "..\..\python.exe" }

# Alternative: Try running via -m module flag
Write-Host "Attempting to start server..." -ForegroundColor Cyan
pip list | Select-String "Flask" | Out-Null

# Use python -m flask to run the app
$env:FLASK_APP = "backend/app.py"
$env:FLASK_ENV = "development"

python -m flask run --host=0.0.0.0 --port=3000
