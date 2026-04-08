import type { PreToolUseHookInput } from '@anthropic-ai/claude-agent-sdk';

interface BashToolInput {
  command: string;
  description?: string;
  timeout?: number;
  run_in_background?: boolean;
}

const input: PreToolUseHookInput = await Bun.stdin.json();

if (input.tool_name === 'Bash') {
  const toolInput = input.tool_input as BashToolInput;
  const command = toolInput.command;

  // 拦截所有引用 .env 文件的命令
  if (command.includes('.env')) {
    process.exit(2);
  }
  process.exit(0);
}

// 允许执行所有非 Bash 工具
process.exit(0);
