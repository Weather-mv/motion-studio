@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on PATH. Install it, then run this file again.
  pause
  exit /b 1
)

rem First run only: install the dependencies.
if not exist "node_modules\node-pty" (
  echo Installing dependencies. This only happens once.
  call npm install
  if errorlevel 1 (
    echo npm install failed. See the messages above.
    pause
    exit /b 1
  )
)

rem Already running? Just open the page.
node server.js --ping
if not errorlevel 1 goto open

if not exist ".runtime" mkdir ".runtime"
powershell -NoProfile -NonInteractive -Command "Start-Process -FilePath node -ArgumentList 'server.js' -WorkingDirectory (Get-Location).Path -WindowStyle Hidden -RedirectStandardOutput '.runtime\server.log' -RedirectStandardError '.runtime\server.err.log'"

rem Wait for the server to answer, up to about 15 seconds.
for /l %%i in (1,1,15) do (
  node server.js --ping
  if not errorlevel 1 goto open
  ping -n 2 127.0.0.1 >nul
)

echo The server did not start. Port 3000 may be in use by another program, such as Remotion Studio.
type ".runtime\server.err.log"
pause
exit /b 1

:open
start "" "http://localhost:3000"
exit /b 0
