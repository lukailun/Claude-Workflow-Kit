export const diffs1 = `\
diff --git a/src/UI/pages/Home/index.tsx b/src/UI/pages/Home/index.tsx
index abc1234..def5678 100644
--- a/src/UI/pages/Home/index.tsx
+++ b/src/UI/pages/Home/index.tsx
@@ -1,10 +1,15 @@
 import React from 'react';
-import { View, Text } from 'react-native';
+import { View, Text, TouchableOpacity } from 'react-native';
+import { useSelector } from 'react-redux';

 export function HomeScreen() {
+  const count = useSelector((state: any) => state.counter.value);
+
   return (
     <View>
       <Text>Home</Text>
+      <TouchableOpacity onPress={() => console.log('pressed')}>
+        <Text>Count: {count}</Text>
+      </TouchableOpacity>
     </View>
   );
 }
`;

export const diffs2 = `
--- .claude/scripts/ai/generate-merge-request.ts ---
@@ -10,7 +10,10 @@ import z from 'zod';
  10 |  import { getMergeRequestPrompt } from '@lukailun/dev-kit/ai/prompts/get-merge-request-prompt';
  11 |  import { commitTypes } from '@lukailun/dev-kit/git/commit-type';
  12 |  import { getRepositoryCompare } from '@lukailun/dev-kit-gitlab/get-repository-compare';
  -  | -import { MergeRequestContent } from '@lukailun/dev-kit-gitlab/merge-request-content';
  13 | +import {
  14 | +  ChangedFileStatus,
  15 | +  MergeRequestContent,
  16 | +} from '@lukailun/dev-kit-gitlab/merge-request-content';
  17 |  import { getLinearIssue } from '@lukailun/dev-kit-linear/get-linear-issue';
  18 |
  19 |  interface GenerateMergeRequestParams {
@@ -73,6 +76,14 @@ async function generateMergeRequest(
  76 |      .join('\n');
  77 |
  78 |    const diffs = compare.diffs || [];
  79 | +  const changedFiles = diffs.map((diff) => {
  80 | +    const status: ChangedFileStatus = diff.deleted_file
  81 | +      ? 'deleted'
  82 | +      : diff.new_file
  83 | +        ? 'new'
  84 | +        : 'modified';
  85 | +    return { path: diff.new_path, status };
  86 | +  });
  87 |    const diffStat = diffs
  88 |      .map((diff) => {
  89 |        const oldPath = diff.old_path;
@@ -114,9 +125,6 @@ async function generateMergeRequest(
 125 |              overview: z.string().meta({ description: '改动概述' }),
 126 |              changes: z.array(z.string()).meta({ description: '主要变更列表' }),
 127 |              impact: z.object({
  -  | -              files: z
  -  | -                .array(z.string())
  -  | -                .meta({ description: '受影响的文件列表' }),
 128 |                features: z
 129 |                  .array(z.string())
 130 |                  .meta({ description: '受影响的功能列表' }),
@@ -131,9 +139,16 @@ async function generateMergeRequest(
 139 |
 140 |    return {
 141 |      ...result.output,
 142 | +    description: {
 143 | +      ...result.output.description,
 144 | +      impact: {
 145 | +        ...result.output.description.impact,
 146 | +        files: changedFiles,
 147 | +      },
 148 | +    },
 149 |      relatedIssue,
 150 |      model: params.model,
  -  | -    usage: result.totalUsage,
 151 | +    usage: result.usage,
 152 |    } satisfies MergeRequestContent;
 153 |  }
 154 |
 155 |

--- .claude/scripts/gitlab/merge-request-content.ts ---
@@ -9,11 +9,17 @@ export interface MergeRequestTitle {
   9 |    type: CommitType;
  10 |    subject: string;
  11 |  }
  12 | +export type ChangedFileStatus = 'new' | 'modified' | 'deleted';
  13 | +
  14 | +export interface ChangedFile {
  15 | +  path: string;
  16 | +  status: ChangedFileStatus;
  17 | +}
  18 |  export interface MergeRequestDescription {
  19 |    overview: string;
  20 |    changes: string[];
  21 |    impact: {
  -  | -    files: string[];
  22 | +    files: ChangedFile[];
  23 |      features: string[];
  24 |    };
  25 |    tests: string[];
@@ -60,11 +66,24 @@ export async function formatDescription(
  66 |      const currentBranch = await getCurrentBranch();
  67 |      if (webUrl.length > 0 && currentBranch.length > 0) {
  68 |        impactItems.push(
  -  | -        \`### 改动文件\n\${desc.impact.files.map((file) => \`* [\${file}](\${webUrl}/-/\${currentBranch}/\${file.split('/').map(encodeURIComponent).join('/')})\`).join('\\n')}\`
  69 | +        \`### 改动文件\n\${desc.impact.files
  70 | +          .map((file) => {
  71 | +            const link = \`[\${file.path}](\${webUrl}/-/\${currentBranch}/\${file.path.split('/').map(encodeURIComponent).join('/')})\`;
  72 | +            if (file.status === 'deleted') return \`* ~~\${link}~~\`;
  73 | +            if (file.status === 'new') return \`* 🆕 \${link}\`;
  74 | +            return \`* \${link}\`;
  75 | +          })
  76 | +          .join('\\n')}\`
  77 |        );
  78 |      } else {
  79 |        impactItems.push(
  -  | -        \`### 改动文件\n\${desc.impact.files.map((file) => \`* \${file}\`).join('\\n')}\`
  80 | +        \`### 改动文件\n\${desc.impact.files
  81 | +          .map((file) => {
  82 | +            if (file.status === 'deleted') return \`* ~~\${file.path}~~\`;
  83 | +            if (file.status === 'new') return \`* 🆕 \${file.path}\`;
  84 | +            return \`* \${file.path}\`;
  85 | +          })
  86 | +          .join('\\n')}\`
  87 |        );
  88 |      }
  89 |    }
  90 |

`;
