import {
  getOrganizationIssueEvent,
  GetOrganizationIssueEventResponses,
} from '@sentry/api';
import { getSentryOptions } from '@/sentry/get-sentry-options';

interface GetSentryIssueEventParams {
  issueId: string;
}

export async function getSentryIssueEvent(params: GetSentryIssueEventParams) {
  const options = getSentryOptions({ issueId: params.issueId });

  const { data } = await getOrganizationIssueEvent({
    ...options,
    path: {
      ...options.path,
      event_id: 'latest',
    },
  });
  if (!data) return null;
  return data satisfies GetOrganizationIssueEventResponses['200'];
}

if (require.main === module) {
  const issueId = process.argv[2];
  if (!issueId) {
    console.error('Usage: bun get-sentry-issue-event.ts <issueId>');
    process.exit(1);
  }
  const event = await getSentryIssueEvent({ issueId });
  console.log(JSON.stringify(event));
}
