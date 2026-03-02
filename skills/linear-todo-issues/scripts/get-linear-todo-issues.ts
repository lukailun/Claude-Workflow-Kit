#!/usr/bin/env bun

/**
 * 从 Linear 获取 issues 脚本
 *
 * 功能：
 * 1. 接收 apiKey、timestamp 和 userEmail 作为参数
 * 2. 获取该用户的所有 issues
 * 3. 生成摘要内容并输出到标准输出
 *
 * 使用方法：
 * bun run get-linear-todo-issues.ts <apiKey> <timestamp> <userEmail>
 *
 * 参数说明：
 * - apiKey: Linear API Key
 * - timestamp: 时间戳
 * - userEmail: 用户邮箱
 */

import { LinearClient } from '@linear/sdk';

function getPriorityLabel(priority: number): string {
  const labels: Record<number, string> = {
    0: '无优先级',
    1: '紧急',
    2: '高',
    3: '中',
    4: '低',
  };
  return labels[priority] ?? '未知';
}

async function getLinearTodoIssues() {
  try {
    const apiKey = process.argv[2];
    const timestamp = process.argv[3];
    const userEmail = process.argv[4];

    if (!apiKey) {
      console.error('[错误]: 未提供 apiKey 参数');
      console.error(
        '使用方法: bun run get-linear-todo-issues.ts <apiKey> <timestamp> <userEmail>'
      );
      process.exit(1);
    }

    if (!timestamp) {
      console.error('[错误]: 未提供时间戳参数');
      console.error(
        '使用方法: bun run get-linear-todo-issues.ts <apiKey> <timestamp> <userEmail>'
      );
      process.exit(1);
    }

    if (!userEmail) {
      console.error('[错误]: 未提供用户邮箱参数');
      console.error(
        '使用方法: bun run get-linear-todo-issues.ts <apiKey> <timestamp> <userEmail>'
      );
      process.exit(1);
    }

    const client = new LinearClient({ apiKey });

    const usersConnection = await client.users();
    const users = usersConnection.nodes;
    const selectedUser = users.find((user) => user.email === userEmail);

    if (!selectedUser) {
      console.error(`[错误]: 未找到用户 "${userEmail}"`);
      process.exit(1);
    }

    const issuesConnection = await client.issues({
      filter: {
        assignee: { id: { eq: selectedUser.id } },
      },
    });
    const issues = issuesConnection.nodes;

    if (issues.length === 0) {
      const summary = `# Linear Issues 汇总 - ${timestamp}\n\n用户: ${selectedUser.displayName || selectedUser.name} (${selectedUser.email})\n\n总计: 0 个 issues\n`;
      console.log(summary);
      return;
    }

    const issuesWithDetails = await Promise.all(
      issues.map(async (issue) => {
        const state = await issue.state;
        const assignee = await issue.assignee;
        return {
          identifier: issue.identifier,
          title: issue.title,
          description: issue.description,
          state: state ? { name: state.name } : { name: '未知' },
          assignee: assignee ? { name: assignee.name } : undefined,
          priority: issue.priority,
          url: issue.url,
        };
      })
    );

    const todoIssues = issuesWithDetails.filter(
      (issue) => issue.state.name.toLowerCase() === 'todo'
    );

    if (todoIssues.length === 0) {
      const summary = `# Linear Issues 汇总 - ${timestamp}\n\n用户: ${selectedUser.displayName || selectedUser.name} (${selectedUser.email})\n\n总计: 0 个 Todo issues\n`;
      console.log(summary);
      return;
    }

    const issuesByState = todoIssues.reduce(
      (acc, issue) => {
        const stateName = issue.state.name;
        if (!acc[stateName]) {
          acc[stateName] = [];
        }
        acc[stateName].push(issue);
        return acc;
      },
      {} as Record<string, typeof todoIssues>
    );

    let summary = `# Linear Issues 汇总 - ${timestamp}\n\n`;
    summary += `用户: ${selectedUser.displayName || selectedUser.name} (${selectedUser.email})\n\n`;
    summary += `总计: ${todoIssues.length} 个 Todo issues\n\n`;

    for (const [stateName, stateIssues] of Object.entries(issuesByState)) {
      summary += `## ${stateName} (${stateIssues.length})\n\n`;

      for (const issue of stateIssues) {
        summary += `### ${issue.identifier}: ${issue.title}\n\n`;
        summary += `- 优先级: ${getPriorityLabel(issue.priority)}\n`;
        if (issue.assignee) {
          summary += `- 负责人: ${issue.assignee.name}\n`;
        }
        summary += `- 链接: ${issue.url}\n`;
        if (issue.description) {
          summary += `- 描述: ${issue.description.substring(0, 200)}${issue.description.length > 200 ? '...' : ''}\n`;
        }
        summary += '\n';
      }
    }

    console.log(summary);
  } catch (error) {
    console.error('[错误]: ', error);
    process.exit(1);
  }
}

getLinearTodoIssues();
