#!/bin/bash

# 新项目初始化脚本
# 用法：chmod +x init.sh && ./init.sh

set -e

echo "🚀 开始初始化项目..."

# 检查 bun 是否安装
if ! command -v bun &> /dev/null; then
    echo "❌ bun 未安装，正在安装..."
    curl -fsSL https://bun.sh/install | bash
    echo "✅ bun 安装完成"
else
    echo "✅ bun 已安装"
fi

# 安装 .claude 依赖
echo "📦 安装 .claude 依赖..."
cd .claude && bun install
echo "✅ 依赖安装完成"

# 复制环境变量文件
if [ ! -f .env ]; then
    echo "📋 创建环境变量文件..."
    cp .env.template .env
    echo "⚠️  请编辑 .claude/.env 文件，填入 GitLab 配置（可选）"
else
    echo "✅ 环境变量文件已存在"
fi

# 检查 glab 是否安装
if ! command -v glab &> /dev/null; then
    echo "⚠️  glab 未安装（可选，用于创建 MR）"
    echo "   安装命令：brew install glab"
    echo "   然后运行：glab auth login"
else
    echo "✅ glab 已安装"
fi

echo ""
echo "🎉 项目初始化完成！"
echo ""
echo "可用命令："
echo "  bun run .claude/scripts/workflow/create-feature.ts <branch-name>"
echo "  bun run .claude/scripts/workflow/create-release.ts"
echo "  bun run .claude/scripts/workflow/create-hotfix.ts"
echo "  bun run .claude/scripts/workflow/commit-and-push.ts"
echo "  bun run .claude/scripts/workflow/submit.ts"
