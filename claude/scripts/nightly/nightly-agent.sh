#!/usr/bin/env bash
# =============================================================================
# nightly-agent.sh
#
# 每晚午夜运行，自动：
#   1. 从 Linear 项目拉取待实现的 issue
#   2. 跳过已处理过的 issue
#   3. 对每个新 issue：创建分支 → claude 自动实现 → 推送 → 创建 MR
#
# 依赖：bun, claude CLI, glab (已配置 GitLab 认证)
# 日志：~/.claude/logs/nightly-agent/YYYY-MM-DD.log
# =============================================================================

set -euo pipefail

# ── 路径配置 ──────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.claude/.env"
PROCESSED_FILE="$PROJECT_ROOT/.claude/scripts/nightly/.processed-issues"
LOG_DIR="$HOME/.claude/logs/nightly-agent"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d).log"
CLAUDE_BIN="/Users/$(whoami)/.local/bin/claude"
BASE_BRANCH="dev"

# ── 工具函数 ──────────────────────────────────────────────────────────────────
log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

# ── 初始化 ────────────────────────────────────────────────────────────────────
mkdir -p "$LOG_DIR"
touch "$PROCESSED_FILE"

log "====== nightly-agent 启动 ======"
log "项目路径: $PROJECT_ROOT"

# 加载环境变量
if [[ -f "$ENV_FILE" ]]; then
  set -a; source <(grep -v '^#' "$ENV_FILE" | grep -v '^$'); set +a
else
  log "[错误] 未找到 $ENV_FILE"
  exit 1
fi

# ── 切到项目根目录 ─────────────────────────────────────────────────────────────
cd "$PROJECT_ROOT"

# 确保 git 状态干净
if [[ -n "$(git status --porcelain)" ]]; then
  log "[跳过] 工作区不干净，放弃本次运行"
  git status --short >> "$LOG_FILE"
  exit 0
fi

# 拉取最新代码
log "拉取 $BASE_BRANCH 最新代码..."
git fetch origin
git checkout "$BASE_BRANCH"
git pull origin "$BASE_BRANCH"

# ── 获取待实现 issue ───────────────────────────────────────────────────────────
log "从 Linear 获取待实现 issue..."
ISSUES_JSON=$(bun --env-file="$ENV_FILE" "$SCRIPT_DIR/fetch-project-issues.ts" 2>>"$LOG_FILE")
ISSUE_COUNT=$(echo "$ISSUES_JSON" | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.length)")
log "共 $ISSUE_COUNT 个 unstarted issue"

# ── 逐个处理 ──────────────────────────────────────────────────────────────────
PROCESSED=0
FAILED=0

while IFS= read -r ISSUE; do
  ID=$(echo "$ISSUE" | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.id)")
  IDENTIFIER=$(echo "$ISSUE" | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.identifier)")
  TITLE=$(echo "$ISSUE" | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.title)")
  BRANCH=$(echo "$ISSUE" | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.branchName)")
  URL=$(echo "$ISSUE" | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.url)")
  DESCRIPTION=$(echo "$ISSUE" | bun -e "const d=JSON.parse(await Bun.stdin.text()); console.log(d.description)")

  # 跳过已处理
  if grep -qF "$ID" "$PROCESSED_FILE"; then
    log "[$IDENTIFIER] 已处理，跳过"
    continue
  fi

  log "──────────────────────────────────"
  log "[$IDENTIFIER] 开始处理: $TITLE"
  log "[$IDENTIFIER] 分支: $BRANCH"

  # 创建 feature 分支
  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    log "[$IDENTIFIER] 分支已存在，切换到该分支"
    git checkout "$BRANCH"
  else
    git checkout -b "$BRANCH"
  fi

  # 构造给 claude 的 prompt
  PROMPT="你是 Gusto 开口说 React Native 项目的开发者，需要实现以下 Linear issue。

**Issue**: $IDENTIFIER — $TITLE
**URL**: $URL
**Description**:
$DESCRIPTION

**任务要求**:
1. 仔细阅读 issue 描述，理解需要实现什么
2. 浏览相关代码，理解上下文
3. 完成代码修改，保持改动聚焦、最小化
4. 运行 yarn check-types 确保无 TypeScript 报错，如有报错请修复
5. 将所有改动 git add 并 commit，commit message 格式：feat: $IDENTIFIER ${TITLE}
6. 不要 push，不要创建 MR

当前分支：$BRANCH（已切换好）
遵循项目 CLAUDE.md 中的所有约定。"

  # 运行 claude 自动实现
  log "[$IDENTIFIER] 运行 claude 自动实现..."
  if "$CLAUDE_BIN" \
    --dangerously-skip-permissions \
    --print \
    "$PROMPT" \
    >> "$LOG_FILE" 2>&1; then
    log "[$IDENTIFIER] claude 执行完成"
  else
    log "[$IDENTIFIER] claude 执行失败，跳过"
    git checkout "$BASE_BRANCH"
    git branch -D "$BRANCH" 2>/dev/null || true
    ((FAILED++)) || true
    continue
  fi

  # 检查是否有新提交
  COMMIT_COUNT=$(git log "origin/$BASE_BRANCH..$BRANCH" --oneline 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$COMMIT_COUNT" -eq 0 ]]; then
    log "[$IDENTIFIER] 没有新提交，可能未实现，跳过创建 MR"
    git checkout "$BASE_BRANCH"
    git branch -D "$BRANCH" 2>/dev/null || true
    continue
  fi

  # 推送分支
  log "[$IDENTIFIER] 推送分支..."
  git push -u origin "$BRANCH"

  # 找最新 release 分支作为 MR 目标
  TARGET_BRANCH=$(git branch -r | grep 'origin/release/' | sort -V | tail -1 | sed 's/.*origin\///')
  if [[ -z "$TARGET_BRANCH" ]]; then
    TARGET_BRANCH="$BASE_BRANCH"
  fi
  log "[$IDENTIFIER] MR 目标分支: $TARGET_BRANCH"

  # 创建 MR
  log "[$IDENTIFIER] 创建 MR..."
  MR_URL=$(glab mr create \
    --source-branch "$BRANCH" \
    --target-branch "$TARGET_BRANCH" \
    --title "feat: $IDENTIFIER $TITLE" \
    --description "## 改动概述
自动实现 Linear issue $IDENTIFIER。

## 关联事项
[$IDENTIFIER $TITLE]($URL)

## 说明
此 MR 由 nightly-agent 自动生成，请 review 后合并。" \
    --no-editor \
    --print-mr-url 2>>"$LOG_FILE" || echo "")

  if [[ -n "$MR_URL" ]]; then
    log "[$IDENTIFIER] MR 创建成功: $MR_URL"
  else
    log "[$IDENTIFIER] MR 创建失败，请手动检查"
  fi

  # 记录已处理
  echo "$ID" >> "$PROCESSED_FILE"
  ((PROCESSED++)) || true

  # 回到 base 分支，准备下一个
  git checkout "$BASE_BRANCH"

done < <(echo "$ISSUES_JSON" | bun -e "
const d = JSON.parse(await Bun.stdin.text());
for (const i of d) { console.log(JSON.stringify(i)); }
")

log "──────────────────────────────────"
log "本次运行完成：处理 $PROCESSED 个，失败 $FAILED 个"
log "====== nightly-agent 结束 ======"
