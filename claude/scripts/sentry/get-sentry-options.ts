import { Options } from '@sentry/api';
import { getSentryFromEnv } from '@/env/get-sentry-from-env';

interface SentryOptionsParams {
  issueId: string | undefined;
}

export function getSentryOptions(params?: SentryOptionsParams) {
  const { apiKey, baseUrl, organization, project } = getSentryFromEnv();
  const options = {
    baseUrl,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    path: {
      organization_id_or_slug: organization,
      project_id_or_slug: project,
      issue_id: params?.issueId ?? '',
    },
  } satisfies Options;
  return options;
}
