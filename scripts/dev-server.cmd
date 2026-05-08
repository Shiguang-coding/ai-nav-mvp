@echo off
cd /d "%~dp0.."
echo Starting AI Nav dev server... > ".next\dev-server.log"
echo Working directory: %CD% >> ".next\dev-server.log"
"D:\Environment\nodejs\node.exe" "%~dp0dev-runner.cjs" >> ".next\dev-server.log" 2>&1
echo Dev server exited with code %ERRORLEVEL% >> ".next\dev-server.log"
pause
