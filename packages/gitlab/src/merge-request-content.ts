import { Issue } from '@linear/sdk';
import { LanguageModel, LanguageModelUsage } from 'ai';
import { getLanguageModelInfo } from '@cwkit/ai/get-language-model';
import { CommitType } from '@cwkit/shared/git/commit-type';
import { getCurrentBranch } from '@cwkit/shared/git/get-current-branch';
import { getCurrentProjectId } from './get-current-project-id';
import { getProjectDetails } from './get-project-details';

export interface MergeRequestTitle {
  type: CommitType;
  subject: string;
}
export type ChangedFileStatus = 'new' | 'modified' | 'deleted';

export interface ChangedFile {
  path: string;
  status: ChangedFileStatus;
}
export interface MergeRequestDescription {
  overview: string;
  changes: string[];
  impact: {
    files: ChangedFile[];
    features: string[];
  };
  tests: string[];
}
export interface MergeRequestContent {
  title: MergeRequestTitle;
  description: MergeRequestDescription;
  model: LanguageModel;
  usage?: LanguageModelUsage;
  receipt?: string;
  relatedIssue?: Issue;
}

export function formatTitle(content: MergeRequestContent): string {
  return `${content.title.type}: ${content.relatedIssue ? `[${content.relatedIssue.identifier}] ` : ''}${content.title.subject}`;
}

export async function formatDescription(
  content: MergeRequestContent
): Promise<string> {
  const desc = content.description;
  const sections: string[] = [];

  sections.push(`## 改动概述\n${desc.overview}`);

  const relatedIssue = content.relatedIssue;
  if (relatedIssue) {
    sections.push(
      `## 关联工单\n* [${relatedIssue.identifier} ${relatedIssue.title}](${relatedIssue.url})`
    );
  }

  if (desc.changes.length > 0) {
    sections.push(
      `## 主要变更\n${desc.changes.map((change) => `* ${change}`).join('\n')}`
    );
  }

  const impactItems: string[] = [];
  if (desc.impact.files.length > 0) {
    const projectId = await getCurrentProjectId();
    const projectDetails = await getProjectDetails({ projectId });
    const webUrl = projectDetails?.web_url ?? '';
    const currentBranch = await getCurrentBranch();
    if (webUrl.length > 0 && currentBranch.length > 0) {
      impactItems.push(
        `### 改动文件\n${desc.impact.files
          .map((file) => {
            const link = `[${file.path}](${webUrl}/-/blob/${currentBranch}/${file.path.split('/').map(encodeURIComponent).join('/')})`;
            if (file.status === 'deleted') return `* ~~${link}~~`;
            if (file.status === 'new') return `* 🆕 ${link}`;
            return `* ${link}`;
          })
          .join('\n')}`
      );
    } else {
      impactItems.push(
        `### 改动文件\n${desc.impact.files
          .map((file) => {
            if (file.status === 'deleted') return `* ~~${file.path}~~`;
            if (file.status === 'new') return `* 🆕 ${file.path}`;
            return `* ${file.path}`;
          })
          .join('\n')}`
      );
    }
  }
  if (desc.impact.features.length > 0) {
    impactItems.push(
      `### 影响功能\n${desc.impact.features.map((feature) => `* ${feature}`).join('\n')}`
    );
  }
  if (impactItems.length > 0) {
    sections.push(`## 影响范围\n${impactItems.join('\n')}`);
  }

  if (desc.tests.length > 0) {
    sections.push(
      `## 测试说明\n${desc.tests.map((test) => `* ${test}`).join('\n')}`
    );
  }

  const modelInfo = getLanguageModelInfo(content.model);
  const usage = content.usage;
  sections.push('## 生成信息');
  let info = `* 模型: ${modelInfo.provider}: ${modelInfo.modelId}`;
  if (usage) {
    info += '\n';
    info += `* 输入: ${usage.inputTokens}\n* 输出: ${usage.outputTokens}`;
  }
  sections.push(info);
  const receipt = content.receipt;
  if (receipt) {
    sections.push(
      `## 开发统计\n\n<details>\n<summary>查看详情</summary>\n\n\`\`\`${receipt}\n\`\`\`\n\n</details>`
    );
  }

  return sections.join('\n\n');
}
