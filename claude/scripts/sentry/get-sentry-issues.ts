import {
  listProjectIssues,
  ListProjectIssuesData,
  ListProjectIssuesResponses,
} from '@sentry/api';
import { getSentryOptions } from '@/sentry/get-sentry-options';

/**
 * 获取 Sentry Issues 列表
 */
export async function getSentryIssues(query?: ListProjectIssuesData['query']) {
  const options = getSentryOptions();
  const { data } = await listProjectIssues({
    ...options,
    query: {
      query: query?.query ?? 'is:unresolved',
      statsPeriod: query?.statsPeriod ?? '24h',
    },
  });
  if (!data) return null;
  return data satisfies ListProjectIssuesResponses['200'];
}

if (require.main === module) {
  const issues = await getSentryIssues();
  issues?.forEach((issue) => {
    console.log(`Issue ID: ${issue.id}, title: ${issue.title}`);
  });
}
