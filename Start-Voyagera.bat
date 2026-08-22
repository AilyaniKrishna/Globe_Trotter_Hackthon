@echo off
title Voyagera local server
cd /d "%~dp0"
echo Starting Voyagera at http://127.0.0.1:3000
echo Keep this window open while using the website.
start "" /b node server.js
timeout /t 2 /nobreak > nul
start "" http://127.0.0.1:3000
pause
