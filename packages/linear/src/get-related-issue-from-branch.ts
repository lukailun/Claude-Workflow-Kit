import { Issue } from '@linear/sdk';
import { getLinearIssue } from '@/get-linear-issue';

export async function getRelatedIssueFromBranch(
  branch: string
): Promise<Issue | undefined> {
  const issueIdPattern = /[a-zA-Z0-9]+-\d+/i;
  const match = branch.match(issueIdPattern);
  if (!match) return undefined;
  const issueId = match[0].toUpperCase();
  return getLinearIssue(issueId);
}
