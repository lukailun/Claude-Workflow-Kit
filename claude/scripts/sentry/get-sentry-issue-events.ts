import {
  listOrganizationIssueEvents,
  ListOrganizationIssueEventsResponses,
} from '@sentry/api';
import { getSentryOptions } from '@/sentry/get-sentry-options';

interface GetSentryIssueEventsParams {
  issueId: string;
}

/**
 * 获取 Sentry Issue 的事件列表
 */
export async function getSentryIssueEvents(params: GetSentryIssueEventsParams) {
  const options = getSentryOptions({ issueId: params.issueId });

  const { data } = await listOrganizationIssueEvents({
    ...options,
    query: {
      full: true,
    },
  });

  if (!data) return [];
  return data satisfies ListOrganizationIssueEventsResponses['200'];
}

if (require.main === module) {
  const issueId = process.argv[2];
  if (!issueId) {
    console.error('Usage: bun get-sentry-issue-events.ts <issueId>');
    process.exit(1);
  }
  const events = await getSentryIssueEvents({ issueId });
  events?.forEach((event) => {
    console.log(`Event ID: ${event.id}, title: ${event.title}`);
  });
}
