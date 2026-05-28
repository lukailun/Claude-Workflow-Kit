#!/usr/bin/env bash
# 安装 nightly-agent 为 macOS LaunchAgent
set -euo pipefail

PLIST_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/com.mampod.sickle.nightly-agent.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.mampod.sickle.nightly-agent.plist"
LOG_DIR="$HOME/.claude/logs/nightly-agent"

mkdir -p "$LOG_DIR"

# 卸载旧版本（如有）
if launchctl list | grep -q "com.mampod.sickle.nightly-agent" 2>/dev/null; then
  echo "卸载旧版本..."
  launchctl bootout "gui/$(id -u)/com.mampod.sickle.nightly-agent" 2>/dev/null || true
fi

cp "$PLIST_SRC" "$PLIST_DEST"
chmod 644 "$PLIST_DEST"

launchctl bootstrap "gui/$(id -u)" "$PLIST_DEST"

echo "✅ nightly-agent 已安装"
echo "   触发时间: 每天 00:05"
echo "   日志目录: $LOG_DIR"
echo ""
echo "手动触发测试:"
echo "  launchctl kickstart -k gui/\$(id -u)/com.mampod.sickle.nightly-agent"
echo ""
echo "卸载:"
echo "  launchctl bootout gui/\$(id -u)/com.mampod.sickle.nightly-agent"
echo "  rm $PLIST_DEST"
