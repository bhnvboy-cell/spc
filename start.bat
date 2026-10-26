@echo off
title SPC Trainer
cd /d "%~dp0"

set PORT=8765
set STARTED=0

rem If a healthy server is already running, just open the browser
powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://localhost:%PORT%/login' -UseBasicParsing -TimeoutSec 3; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 goto :openbrowser

rem Port busy but not responding = stale/zombie server. Clean it up.
netstat -ano | findstr ":%PORT%" | findstr "LISTENING" >nul 2>&1
if errorlevel 1 goto :fresh
echo Found a stuck server process. Cleaning up...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do taskkill /F /PID %%p >nul 2>&1
ping -n 2 127.0.0.1 >nul

:fresh
set SERVE=none
py --version >nul 2>&1
if not errorlevel 1 set SERVE=py
python --version >nul 2>&1
if not errorlevel 1 set SERVE=python
if "%SERVE%"=="none" goto :nopython

echo Starting SPC Trainer server (authenticated), please wait...
if "%SERVE%"=="py" start "SPC Trainer" /min py "%~dp0server.py"
if "%SERVE%"=="python" start "SPC Trainer" /min python "%~dp0server.py"

set /a TRIES=0
:waitloop
ping -n 2 127.0.0.1 >nul
powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://localhost:%PORT%/login' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 goto :launched
set /a TRIES+=1
if %TRIES% lss 30 goto :waitloop
echo The server could not start. Check the "SPC Trainer" window for errors.
pause
exit /b 1

:launched
set STARTED=1

:openbrowser
echo Opening http://localhost:%PORT% in your browser...
start "" http://localhost:%PORT%
if "%STARTED%"=="0" (
  echo Server is already running from another window.
  goto :end
)
echo.
echo --- Tablet / phone on the same Wi-Fi ---
set "LANIP="
for /f %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.InterfaceAlias -notlike '*VirtualBox*' -and $_.InterfaceAlias -notlike '*Bluetooth*' } | Sort-Object -Property InterfaceAlias -Descending | Select-Object -First 1 -ExpandProperty IPAddress)"') do set "LANIP=%%i"
if defined LANIP echo   Open  http://%LANIP%:%PORT%  on your tablet's browser.
echo.
echo Accounts: admin, user1 .. user30
echo Default password for all: mefsco123  (change via Admin panel)
echo.
echo Keep this window open while using the app.
echo To stop: close this window or run kill.bat.
goto :end

:nopython
echo Python is required but was not found.
echo Install Python 3 from https://www.python.org/downloads/ then run start.bat again.
pause
exit /b 1

:end
pause
