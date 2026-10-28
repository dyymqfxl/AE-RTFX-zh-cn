@echo off
cd /d "%~dp0"
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0安装.ps1" -Restore
if errorlevel 1 echo 还原失败。请以管理员身份运行，并查看上面的错误信息。
pause
