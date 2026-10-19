@echo off
chcp 65001 >nul
title Infinite Canvas Launcher
cd /d D:\infinite-canvas

echo [1/2] CORS proxy  127.0.0.1:8189  ->  127.0.0.1:8188
start "canvas-cors-proxy" cmd /k "cd /d D:\infinite-canvas && node cors-proxy.mjs"

timeout /t 2 >nul

echo [2/2] Canvas web  http://127.0.0.1:3000
start "canvas-web" cmd /k "cd /d D:\infinite-canvas\web && bun run dev"

timeout /t 7 >nul
start "" http://127.0.0.1:3000

echo.
echo Two windows opened. Keep both running.
echo Close them = canvas disconnects from ComfyUI.
echo.
pause
