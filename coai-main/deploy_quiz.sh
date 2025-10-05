#!/bin/bash

# Chat Nio Quiz 功能部署脚本

echo "=========================================="
echo "Chat Nio Quiz 功能部署"
echo "=========================================="
echo ""

# 检查 Go 环境
echo "1. 检查 Go 环境..."
if ! command -v go &> /dev/null; then
    echo "❌ 未找到 Go 环境，请先安装 Go 1.21+"
    exit 1
fi
echo "✅ Go 版本: $(go version)"
echo ""

# 检查 Node.js 环境
echo "2. 检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js 环境，请先安装 Node.js 18+"
    exit 1
fi
echo "✅ Node.js 版本: $(node --version)"
echo ""

# 安装后端依赖
echo "3. 安装后端依赖..."
go mod tidy
if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi
echo "✅ 后端依赖安装完成"
echo ""

# 安装前端依赖
echo "4. 安装前端依赖..."
cd app
if [ -f "pnpm-lock.yaml" ]; then
    echo "使用 pnpm 安装..."
    pnpm install
elif [ -f "yarn.lock" ]; then
    echo "使用 yarn 安装..."
    yarn install
else
    echo "使用 npm 安装..."
    npm install
fi

if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi
echo "✅ 前端依赖安装完成"
echo ""

# 构建前端
echo "5. 构建前端..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi
echo "✅ 前端构建完成"
cd ..
echo ""

# 构建后端
echo "6. 构建后端..."
go build -o chatnio main.go
if [ $? -ne 0 ]; then
    echo "❌ 后端构建失败"
    exit 1
fi
echo "✅ 后端构建完成"
echo ""

echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "启动命令："
echo "  ./chatnio"
echo ""
echo "访问地址："
echo "  主页: http://localhost:8000"
echo "  Quiz: http://localhost:8000/quiz"
echo ""
echo "默认管理员账号："
echo "  用户名: root"
echo "  密码: chatnio123456"
echo ""
echo "⚠️ 请记得修改默认密码！"
echo ""
