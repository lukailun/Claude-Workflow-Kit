import {
  getOrganizationIssue,
  GetOrganizationIssueResponses,
} from '@sentry/api';
import { getSentryOptions } from '@/sentry/get-sentry-options';

interface GetSentryIssueParams {
  issueId: string;
}

/**
 * 获取单个 Sentry Issue 详情
 */
export async function getSentryIssue(params: GetSentryIssueParams) {
  const options = getSentryOptions({ issueId: params.issueId });

  const { data } = await getOrganizationIssue({
    ...options,
  });

  if (!data) return null;
  return data satisfies GetOrganizationIssueResponses['200'];
}

if (require.main === module) {
  const issueId = process.argv[2];
  if (!issueId) {
    console.error('Usage: bun get-sentry-issue.ts <issueId>');
    process.exit(1);
  }
  const issue = await getSentryIssue({ issueId });
  console.log(JSON.stringify(issue));
}
