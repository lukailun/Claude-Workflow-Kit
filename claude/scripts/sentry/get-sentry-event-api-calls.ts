import { getSentryIssueEvent } from '@/sentry/get-sentry-issue-event';

interface ApiCall {
  url: string;
  method: string;
  statusCode: number;
  timestamp: number;
  duration: number;
}

interface GetEventApiCallsParams {
  issueId: string;
}

/**
 * 从 Sentry event 的 breadcrumbs 中提取所有 HTTP API 调用
 */
export async function getEventApiCalls(
  params: GetEventApiCallsParams
): Promise<ApiCall[]> {
  const event = await getSentryIssueEvent({
    issueId: params.issueId,
  });
  if (!event) return [];
  const breadcrumbsEntry = (
    event.entries as { data: any; type: string }[]
  )?.find((entry) => entry.type === 'breadcrumbs');
  const breadcrumbs = breadcrumbsEntry?.data?.values ?? [];
  const apiCalls: ApiCall[] = breadcrumbs
    .filter(
      (breadcrumbs: any) => breadcrumbs.type === 'http' && breadcrumbs.data
    )
    .map(
      (breadcrumbs: any) =>
        ({
          url: breadcrumbs.data.url,
          method: breadcrumbs.data.method,
          statusCode: breadcrumbs.data.status_code,
          timestamp: new Date(breadcrumbs.timestamp).getTime(),
          duration:
            breadcrumbs.data.end_timestamp - breadcrumbs.data.start_timestamp,
        }) satisfies ApiCall
    );
  return apiCalls;
}

if (require.main === module) {
  const issueId = process.argv[2];
  if (!issueId) {
    console.error('Usage: bun get-sentry-event-api-calls.ts <issueId>');
    process.exit(1);
  }
  const apiCalls = await getEventApiCalls({ issueId });
  apiCalls?.forEach((apiCall) => {
    console.log(JSON.stringify(apiCall));
  });
}
