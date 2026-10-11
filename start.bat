@echo off
title AlgoMotion Studio Launcher
echo ============================================================
echo         AlgoMotion Studio - Clean Port Startup
echo ============================================================

set TARGET_PORT=3300

echo [1/2] Terminating any existing processes on port %TARGET_PORT% and 3301...
powershell -NoProfile -Command "3300, 3301 | ForEach-Object { $p = $_; Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -gt 0 -and $_ -ne $PID } | ForEach-Object { Write-Host '  Killing PID:' $_ 'on port' $p; Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }"

echo.
echo [2/2] Launching AlgoMotion Studio on http://localhost:%TARGET_PORT%...
echo ============================================================
echo.

npm run ui
