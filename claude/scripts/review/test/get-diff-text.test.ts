import { getCurrentProjectId } from '@/gitlab/get-current-project-id';
import { getMergeRequestDiffText } from '@/gitlab/get-merge-request-diff-text';

const mergeId = 3186;

async function main() {
  const projectId = (await getCurrentProjectId()) ?? 0;
  const diff = await getMergeRequestDiffText({
    projectId,
    mrIid: mergeId,
    include: ['src/**/*.ts', 'src/**/*.tsx'],
    exclude: [
      'src/Assets/**',
      'src/Network/GeneratedApi.ts',
      'src/Network/GeneratedApiTypes.ts',
    ],
  });
  console.log('==================');
  console.log(diff);
  console.log('==================');
}

main().catch(console.error);
