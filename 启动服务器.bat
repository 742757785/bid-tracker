@echo off
echo ========================================
echo 招标信息追踪 - Web版启动器
echo ========================================
echo.
echo 正在启动Web服务器...
echo.
echo 请在浏览器中访问: http://localhost:8080
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

cd /d "%~dp0"

REM 检查Python是否安装
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用Python启动服务器...
    python -m http.server 8080
) else (
    REM 检查Node.js是否安装
    where node >nul 2>&1
    if %errorlevel% equ 0 (
        echo 使用Node.js启动服务器...
        npx http-server -p 8080
    ) else (
        echo 错误: 未找到Python或Node.js
        echo.
        echo 请安装以下任一软件：
        echo - Python: https://www.python.org/
        echo - Node.js: https://nodejs.org/
        echo.
        echo 或者直接用浏览器打开 index.html 文件
        echo.
        pause
    )
)