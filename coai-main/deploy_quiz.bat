@echo off
REM Chat Nio Quiz 功能部署脚本 (Windows)

echo ==========================================
echo Chat Nio Quiz 功能部署
echo ==========================================
echo.

REM 检查 Go 环境
echo 1. 检查 Go 环境...
where go >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未找到 Go 环境，请先安装 Go 1.21+
    exit /b 1
)
for /f "tokens=*" %%i in ('go version') do echo ✅ Go 版本: %%i
echo.

REM 检查 Node.js 环境
echo 2. 检查 Node.js 环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未找到 Node.js 环境，请先安装 Node.js 18+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js 版本: %%i
echo.

REM 安装后端依赖
echo 3. 安装后端依赖...
go mod tidy
if %errorlevel% neq 0 (
    echo ❌ 后端依赖安装失败
    exit /b 1
)
echo ✅ 后端依赖安装完成
echo.

REM 安装前端依赖
echo 4. 安装前端依赖...
cd app
if exist "pnpm-lock.yaml" (
    echo 使用 pnpm 安装...
    pnpm install
) else if exist "yarn.lock" (
    echo 使用 yarn 安装...
    yarn install
) else (
    echo 使用 npm 安装...
    npm install
)

if %errorlevel% neq 0 (
    echo ❌ 前端依赖安装失败
    exit /b 1
)
echo ✅ 前端依赖安装完成
echo.

REM 构建前端
echo 5. 构建前端...
npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端构建失败
    exit /b 1
)
echo ✅ 前端构建完成
cd ..
echo.

REM 构建后端
echo 6. 构建后端...
go build -o chatnio.exe main.go
if %errorlevel% neq 0 (
    echo ❌ 后端构建失败
    exit /b 1
)
echo ✅ 后端构建完成
echo.

echo ==========================================
echo ✅ 部署完成！
echo ==========================================
echo.
echo 启动命令：
echo   chatnio.exe
echo.
echo 访问地址：
echo   主页: http://localhost:8000
echo   Quiz: http://localhost:8000/quiz
echo.
echo 默认管理员账号：
echo   用户名: root
echo   密码: chatnio123456
echo.
echo ⚠️ 请记得修改默认密码！
echo.

pause
