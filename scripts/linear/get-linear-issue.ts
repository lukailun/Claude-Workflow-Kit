/**
 * 查询 Linear Issue
 *
 */

import { Issue } from '@linear/sdk';
import linearClient from './linear-client';

/**
 * 通过 issue identifier 获取 issue
 * @param issueId Issue 的 identifier（如 '4T-9192'）
 * @returns issue 详情
 */
async function getLinearIssue(issueId: string): Promise<Issue> {
  const issue = await linearClient.issue(issueId);
  return issue;
}

export default getLinearIssue;
