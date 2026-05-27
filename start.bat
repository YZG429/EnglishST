@echo off
chcp 65001 >nul
title EnglishST

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误：未检测到 Node.js，请先安装 Node.js 后再运行。
    echo 下载地址：https://nodejs.org
    pause
    exit /b 1
)

echo 正在启动 EnglishST ...
start http://localhost:5183
npm start
pause
