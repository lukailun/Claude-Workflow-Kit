#!/usr/bin/env bun

/**
 * 创建合并请求脚本
 *
 * 功能：
 * 1. 自动确定目标分支（最新的 release/x.x.x 分支）
 * 2. 比较当前分支与目标分支的代码改动
 * 3. 使用 AI 生成 MR 标题和描述
 * 4. 使用 glab 创建合并请求
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';

config({ path: '.claude/.env' });

async function createMergeRequest() {
  try {
    const baseURL = process.env.ANTHROPIC_BASE_URL;
    if (!baseURL) {
      console.error('错误: 未找到 ANTHROPIC_BASE_URL 环境变量');
      process.exit(1);
    }

    const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
    if (!authToken) {
      console.error('错误: 未找到 ANTHROPIC_AUTH_TOKEN 环境变量');
      process.exit(1);
    }

    const currentBranch = (
      await Bun.$`git branch --show-current`.text()
    ).trim();

    console.log(`当前分支: ${currentBranch}`);

    const remoteBranches = (await Bun.$`git branch -r`.text())
      .split('\n')
      .map((b) => b.trim())
      .filter((branch) => /^origin\/release\/\d+\.\d+\.\d+$/.test(branch));

    if (remoteBranches.length === 0) {
      console.error('[错误]: 未找到符合条件的分支');
      process.exit(1);
    }

    const branches = remoteBranches
      .map((branch) => {
        const match = branch.match(/^origin\/release\/(\d+)\.(\d+)\.(\d+)$/);
        if (!match) return null;
        return {
          full: branch,
          name: branch.replace('origin/', ''),
          major: parseInt(match[1]),
          minor: parseInt(match[2]),
          patch: parseInt(match[3]),
        };
      })
      .filter(Boolean);

    const targetBranch = branches.sort((a, b) => {
      if (a!.major !== b!.major) return b!.major - a!.major;
      if (a!.minor !== b!.minor) return b!.minor - a!.minor;
      return b!.patch - a!.patch;
    })[0];

    if (!targetBranch) {
      console.error('[错误]: 未找到符合条件的分支');
      process.exit(1);
    }

    console.log(`目标分支: ${targetBranch.name}`);

    const gitStatus = await Bun.$`git status`.text();
    console.log('\nGit 状态:');
    console.log(gitStatus);

    console.log(`\n比较 ${currentBranch} 与 ${targetBranch.name} 的改动:`);
    const diffStat =
      await Bun.$`git diff ${targetBranch.name}...${currentBranch} --stat`.text();
    console.log(diffStat);

    const diffLog =
      await Bun.$`git log ${targetBranch.name}..${currentBranch} --oneline`.text();
    console.log('\n提交记录:');
    console.log(diffLog);

    const diffFiles =
      await Bun.$`git diff ${targetBranch.name}...${currentBranch} --numstat`.text();

    const client = new Anthropic({ baseURL, authToken });

    const overviewTemplate = await Bun.file(
      '.claude/skills/create-merge-request/references/create-merge-request.md'
    ).text();

    const prompt = `请根据以下 Git 改动信息，生成一个合并请求的标题和描述。

当前分支: ${currentBranch}
目标分支: ${targetBranch.name}

代码改动统计:
${diffStat}

文件改动详情:
${diffFiles}

提交记录:
${diffLog}

描述格式参考:
${overviewTemplate}

请以 JSON 格式返回，包含 title 和 description 两个字段。
- title: 简洁明了的标题，不超过 80 字符，概括主要改动
- description: 按照格式模板生成，包含改动概述、关联事项、主要变更、影响范围和测试说明

只返回 JSON，不要包含其他内容。`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    let jsonText = responseText.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const mrInfo = JSON.parse(jsonText);
    console.log('\n创建合并请求...');

    await Bun.$`glab mr create --target-branch ${targetBranch.name} --title ${mrInfo.title} --description ${mrInfo.description}`;

    console.log(jsonText);
  } catch (error) {
    console.error('[错误]: ', error);
    process.exit(1);
  }
}

createMergeRequest();
