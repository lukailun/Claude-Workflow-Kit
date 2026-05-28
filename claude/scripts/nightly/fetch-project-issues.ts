/**
 * 从 Linear 项目 "Gusto English App" 获取待实现的 issue
 *
 * 输出 JSON 数组，每个元素包含实现所需的关键字段
 */
import { LinearClient } from '@linear/sdk';

const PROJECT_ID = '01f27b55-ba78-48b1-8dab-9708d71cd7bf'; // Gusto English App

const apiKey = process.env.LINEAR_API_KEY;
if (!apiKey) {
  console.error('[错误]: 未配置 LINEAR_API_KEY');
  process.exit(1);
}

const client = new LinearClient({ apiKey });

const issues = await client.issues({
  filter: {
    project: { id: { eq: PROJECT_ID } },
    state: { type: { eq: 'unstarted' } },
  },
  orderBy: 'prioritySort' as any,
});

const result = await Promise.all(
  issues.nodes.map(async (issue) => {
    const state = await issue.state;
    const assignee = await issue.assignee;
    return {
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description ?? '',
      branchName: issue.branchName,
      url: issue.url,
      priority: issue.priorityLabel,
      state: state?.name ?? '',
      assignee: assignee?.name ?? '',
      createdAt: issue.createdAt,
    };
  })
);

console.log(JSON.stringify(result, null, 2));
