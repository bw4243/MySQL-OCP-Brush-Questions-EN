@echo off
echo ========================================
echo    MySQL OCP 刷题系统启动脚本
echo ========================================
echo.

echo 正在启动服务器...
node server.js

echo.
echo 如果出现错误，请检查：
echo 1. Node.js 是否已安装
echo 2. 是否在正确的目录中运行
echo 3. 端口是否被占用
echo.
pause
