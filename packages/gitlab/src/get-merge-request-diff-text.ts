/**
 * 获取 MR diff 文本，按路径过滤并截断超长内容
 *
 * 为每行 diff 标注新文件行号，方便 AI 准确定位。
 */

import { MergeRequestDiffSchema } from '@gitbeaker/rest';
import { minimatch } from 'minimatch';
import { gitlabClient } from './gitlab-client';

interface GetMergeRequestDiffTextParams {
  projectId: number;
  mrIid: number;
  include?: string[];
  exclude?: string[];
}

/**
 * 解析 diff hunk header，提取新文件起始行号
 *
 * 示例：@@ -1,3 +1,10 @@ → 返回 1
 */
function parseHunkNewStart(hunkHeader: string): number {
  const match = hunkHeader.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * 为 diff 内容的每行添加新文件行号标注
 *
 * - 以 + 开头的行（新增）：标注行号，行号递增
 * - 以 - 开头的行（删除）：标注为 `-`，不占行号
 * - 空白开头的行（上下文）：标注行号，行号递增
 */
function annotateDiffWithLineNumbers(diffContent: string): string {
  const lines = diffContent.split('\n');
  const result: string[] = [];
  let newLineNum = 1;

  for (const line of lines) {
    // hunk header: @@ -old,count +new,count @@
    if (line.startsWith('@@')) {
      newLineNum = parseHunkNewStart(line);
      result.push(line);
      continue;
    }

    // 删除的行：不占新文件行号
    if (line.startsWith('-') && !line.startsWith('---')) {
      result.push(`  -  | ${line}`);
      continue;
    }

    // 新增的行
    if (line.startsWith('+') && !line.startsWith('+++')) {
      result.push(`${String(newLineNum).padStart(4)} | ${line}`);
      newLineNum++;
      continue;
    }

    // 上下文行（空格开头）
    result.push(`${String(newLineNum).padStart(4)} | ${line}`);
    newLineNum++;
  }

  return result.join('\n');
}

export async function getMergeRequestDiffs(
  params: GetMergeRequestDiffTextParams
): Promise<MergeRequestDiffSchema[]> {
  const { projectId, mrIid } = params;
  console.log('📥 正在获取 MR diff...');

  const diffs = await gitlabClient.MergeRequests.allDiffs(projectId, mrIid);
  return diffs;
}

/**
 * 获取 MR diff 并格式化为带行号标注的文本
 *
 * @returns 格式化后的 diff 文本，如果没有可审查的变更返回空字符串
 */
export async function getMergeRequestDiffText(
  params: GetMergeRequestDiffTextParams
): Promise<string> {
  const { projectId, mrIid, include, exclude } = params;

  const diffs = await getMergeRequestDiffs({
    projectId,
    mrIid,
    include,
    exclude,
  });
  let diffText = '';

  for (const fileDiff of diffs) {
    const newPath = fileDiff.new_path;
    if (!newPath) continue;
    if (
      include?.length &&
      !include.some((pattern) => minimatch(newPath, pattern))
    )
      continue;
    if (
      exclude?.length &&
      exclude.some((pattern) => minimatch(newPath, pattern))
    )
      continue;
    if (fileDiff.deleted_file) continue;
    const diffContent = fileDiff.diff;
    if (!diffContent) continue;
    const annotated = annotateDiffWithLineNumbers(diffContent);
    diffText += `--- ${newPath} ---\n${annotated}\n\n`;
  }
  return diffText;
}
