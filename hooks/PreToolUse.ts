import type { PreToolUseHookInput } from '@anthropic-ai/claude-agent-sdk';

interface BashToolInput {
  command: string;
  description?: string;
  timeout?: number;
  run_in_background?: boolean;
}

const input: PreToolUseHookInput = await Bun.stdin.json();

// 仅允许执行来自 "bun run scripts" 目录的脚本的 Bash 命令
if (input.tool_name === 'Bash') {
  const toolInput = input.tool_input as BashToolInput;
  const command = toolInput.command;

  // 拦截所有引用 .env 文件的命令
  if (command.includes('.env')) {
    process.exit(2);
  }

  // 检查命令是否匹配 "bun run .claude/skills/*/scripts/*" 格式
  const allowedPattern = /^bun\s+run\s+\.claude\/skills\/[^/]+\/scripts\//;

  if (allowedPattern.test(command)) {
    process.exit(0);
  } else {
    process.exit(2);
  }
}

// 允许执行所有非 Bash 工具
process.exit(0);
