/**
 * cwkit CLI 入口
 *
 * 统一命令行入口，参考 openwiki 的 cli.tsx 设计。
 * 解析子命令后加载环境变量，然后分发到对应的工作流。
 */

import { loadEnv } from '@cwkit/shared/env/env-manager';
import { parseCommand } from './commands';
import { printHelp } from './help';
import { configList, configInit } from './config';

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = parseCommand(argv);

  if (command.kind === 'help') {
    printHelp();
    process.exit(0);
  }

  if (command.kind === 'error') {
    console.error(`❌ ${command.message}`);
    process.exit(1);
  }

  // config init 不需要加载环境变量
  if (command.kind === 'config' && command.action === 'init') {
    await configInit();
    return;
  }

  // 加载环境变量（Shell export > 项目级 > 用户级）
  await loadEnv();

  switch (command.kind) {
    case 'feature': {
      const { createBranchFromLinearWorkflow } = await import(
        '@cwkit/workflow/create-branch-from-linear'
      );
      const { createFeatureBranch } = await import(
        '@cwkit/gitlab/create-feature-branch'
      );
      await createBranchFromLinearWorkflow({
        emoji: '🚀',
        branchType: 'feature',
        createBranch: createFeatureBranch,
        branchName: command.branchName,
      });
      break;
    }

    case 'experimental': {
      const { createBranchFromLinearWorkflow } = await import(
        '@cwkit/workflow/create-branch-from-linear'
      );
      const { createExperimentalBranch } = await import(
        '@cwkit/gitlab/create-experimental-branch'
      );
      await createBranchFromLinearWorkflow({
        emoji: '🧪',
        branchType: 'experimental',
        createBranch: createExperimentalBranch,
        branchName: command.branchName,
      });
      break;
    }

    case 'hotfix': {
      await import('@cwkit/workflow/create-hotfix');
      break;
    }

    case 'release': {
      await import('@cwkit/workflow/create-release');
      break;
    }

    case 'commit': {
      const { commitAndPush } = await import(
        '@cwkit/workflow/commit-and-push'
      );
      await commitAndPush({ ai: command.ai });
      break;
    }

    case 'mr': {
      const { createMergeRequestWorkflow } = await import(
        '@cwkit/workflow/create-merge-request'
      );
      await createMergeRequestWorkflow({
        ai: command.ai,
        receipt: command.receipt,
        autoMerge: command.autoMerge,
      });
      break;
    }

    case 'submit': {
      const { submitWorkflow } = await import('@cwkit/workflow/submit');
      await submitWorkflow({
        ai: command.ai,
        receipt: command.receipt,
        autoMerge: command.autoMerge,
      });
      break;
    }

    case 'publish-release': {
      await import('@cwkit/workflow/publish-release');
      break;
    }

    case 'publish-hotfix': {
      await import('@cwkit/workflow/publish-hotfix');
      break;
    }

    case 'receipt': {
      const { buildBranchReceiptWorkflow } = await import(
        '@cwkit/workflow/build-branch-receipt'
      );
      const receipt = await buildBranchReceiptWorkflow(
        command.branch,
        command.bannerIndex,
      );
      if (receipt) console.log(receipt);
      break;
    }

    case 'yolo': {
      await import('@cwkit/workflow/yolo');
      break;
    }

    case 'config': {
      if (command.action === 'list') {
        await configList();
      }
      break;
    }

    default: {
      printHelp();
    }
  }
}

main().catch((err) => {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
