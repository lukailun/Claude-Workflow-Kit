/**
 * CLI 命令定义与解析
 */

import { AI_PROVIDERS, type AI } from '@cwkit/ai/get-language-model';

export type CliCommand =
  | { kind: 'help'; exitCode: 0 }
  | { kind: 'error'; exitCode: 1; message: string }
  | { kind: 'feature'; branchName?: string }
  | { kind: 'experimental'; branchName?: string }
  | { kind: 'hotfix' }
  | { kind: 'release' }
  | { kind: 'commit'; ai?: AI }
  | { kind: 'mr'; ai?: AI; receipt?: boolean; autoMerge?: boolean }
  | { kind: 'submit'; ai?: AI; receipt?: boolean; autoMerge?: boolean }
  | { kind: 'publish-release' }
  | { kind: 'publish-hotfix' }
  | { kind: 'receipt'; branch?: string; bannerIndex?: number }
  | { kind: 'yolo' }
  | { kind: 'config'; action: 'list' | 'init' };

/** 子命令 → 命令类型映射 */
const COMMAND_ALIASES: Record<string, string> = {
  feat: 'feature',
  exp: 'experimental',
};

/** 支持的子命令列表 */
const KNOWN_COMMANDS = new Set([
  'feature',
  'experimental',
  'hotfix',
  'release',
  'commit',
  'mr',
  'submit',
  'publish-release',
  'publish-hotfix',
  'receipt',
  'yolo',
  'config',
  'help',
]);

/**
 * 解析 --ai 参数，返回 AI provider 或抛出错误
 */
function parseAI(args: string[], index: number): { ai: AI; nextIndex: number } {
  const value = args[index + 1];
  if (!value) {
    throw new Error('--ai 需要指定 provider');
  }
  if (!AI_PROVIDERS.includes(value as AI)) {
    throw new Error(
      `无效的 AI provider: ${value}\n可用的选项: ${AI_PROVIDERS.join(', ')}`,
    );
  }
  return { ai: value as AI, nextIndex: index + 2 };
}

/**
 * 解析命令行参数
 */
export function parseCommand(argv: string[]): CliCommand {
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
    return { kind: 'help', exitCode: 0 };
  }

  // 解析子命令（处理别名）
  let subcommand = argv[0];
  subcommand = COMMAND_ALIASES[subcommand] ?? subcommand;

  if (subcommand === 'help') {
    return { kind: 'help', exitCode: 0 };
  }

  if (!KNOWN_COMMANDS.has(subcommand)) {
    return {
      kind: 'error',
      exitCode: 1,
      message: `未知命令: ${argv[0]}\n运行 cwkit --help 查看可用命令`,
    };
  }

  const rest = argv.slice(1);

  try {
    switch (subcommand) {
      case 'feature':
      case 'experimental': {
        const branchName = rest.find((arg) => !arg.startsWith('-'));
        return {
          kind: subcommand,
          branchName,
        } as CliCommand;
      }

      case 'hotfix':
      case 'release':
      case 'yolo':
      case 'publish-release':
      case 'publish-hotfix':
        return { kind: subcommand } as CliCommand;

      case 'commit': {
        let ai: AI | undefined;
        for (let i = 0; i < rest.length; i++) {
          if (rest[i] === '--ai') {
            const result = parseAI(rest, i);
            ai = result.ai;
            i = result.nextIndex - 1;
          }
        }
        return { kind: 'commit', ai };
      }

      case 'mr':
      case 'submit': {
        let ai: AI | undefined;
        let receipt = false;
        let autoMerge = false;
        for (let i = 0; i < rest.length; i++) {
          if (rest[i] === '--ai') {
            const result = parseAI(rest, i);
            ai = result.ai;
            i = result.nextIndex - 1;
          } else if (rest[i] === '--receipt') {
            receipt = true;
          } else if (rest[i] === '--auto-merge') {
            autoMerge = true;
          }
        }
        return { kind: subcommand, ai, receipt, autoMerge } as CliCommand;
      }

      case 'receipt': {
        let branch: string | undefined;
        let bannerIndex: number | undefined;
        for (const arg of rest) {
          if (/^\d+$/.test(arg)) {
            bannerIndex = parseInt(arg, 10);
          } else if (!arg.startsWith('-')) {
            branch = arg;
          }
        }
        return { kind: 'receipt', branch, bannerIndex };
      }

      case 'config': {
        const action = rest[0];
        if (action === 'list' || action === 'init') {
          return { kind: 'config', action };
        }
        return {
          kind: 'error',
          exitCode: 1,
          message: '用法: cwkit config <list|init>',
        };
      }

      default:
        return { kind: 'help', exitCode: 0 };
    }
  } catch (err) {
    return {
      kind: 'error',
      exitCode: 1,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}
