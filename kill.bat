@echo off
title Stop SPC Trainer
setlocal enabledelayedexpansion

set FOUND=0
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8765" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%p >nul 2>&1
  if !errorlevel!==0 set FOUND=1
  if !errorlevel!==0 echo Stopped server process - PID %%p
)

if !FOUND!==0 echo SPC Trainer server is not running.
if !FOUND!==1 echo SPC Trainer stopped.
ping -n 3 127.0.0.1 >nul
