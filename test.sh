#!/bin/bash

# 测试脚本
# 用法：chmod +x test.sh && ./test.sh

set -e

echo "🧪 开始测试脚本..."

# 检查 bun 是否可用
if ! command -v bun &> /dev/null; then
    echo "❌ bun 未安装"
    exit 1
fi
echo "✅ bun 可用"

# 检查脚本文件是否存在
SCRIPTS=(
    ".claude/scripts/workflow/create-feature.ts"
    ".claude/scripts/workflow/create-release.ts"
    ".claude/scripts/workflow/create-hotfix.ts"
    ".claude/scripts/workflow/create-experimental.ts"
    ".claude/scripts/workflow/commit-and-push.ts"
    ".claude/scripts/workflow/create-merge-request.ts"
    ".claude/scripts/workflow/submit.ts"
    ".claude/scripts/workflow/publish-release.ts"
    ".claude/scripts/workflow/publish-hotfix.ts"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo "✅ $script 存在"
    else
        echo "❌ $script 不存在"
        exit 1
    fi
done

# 检查 TypeScript 语法
echo ""
echo "🔍 检查 TypeScript 语法..."
for script in "${SCRIPTS[@]}"; do
    if bun build "$script" --outdir /tmp/test-build --target bun 2>/dev/null; then
        echo "✅ $script 语法正确"
    else
        echo "❌ $script 语法错误"
        exit 1
    fi
done

echo ""
echo "🎉 所有测试通过！"
echo ""
echo "提示：要实际运行脚本，请先初始化 Git 仓库并配置远程仓库。"
