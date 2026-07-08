/**
 * 创建新规则文件脚本
 *
 * 用法：
 *   bun run scripts/review/create-rule.ts
 *
 * 交互式创建规则文件，按 severity 分别放入 error-rules 或 warning-rules 目录。
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const CODING_STANDARDS_DIR = path.resolve(__dirname, './coding-standards');
const ERROR_RULES_DIR = path.join(CODING_STANDARDS_DIR, 'error-rules');
const WARNING_RULES_DIR = path.join(CODING_STANDARDS_DIR, 'warning-rules');

/** 根据 severity 获取规则目录 */
function getRulesDir(severity: 'error' | 'warning'): string {
  return severity === 'error' ? ERROR_RULES_DIR : WARNING_RULES_DIR;
}

/**
 * 获取下一个可用的规则编号
 */
function getNextRuleId(severity: 'error' | 'warning'): number {
  const dir = getRulesDir(severity);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  let maxId = 0;
  for (const file of files) {
    const match = file.match(/^(\d+)-/);
    if (match) {
      maxId = Math.max(maxId, parseInt(match[1], 10));
    }
  }

  return maxId + 1;
}

/**
 * 生成文件名
 */
function generateFilename(id: number, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

  return `${id}-${slug}.md`;
}

/**
 * 生成规则文件内容
 */
function generateRuleContent(
  ruleId: string,
  title: string,
  severity: 'error' | 'warning',
  description: string
): string {
  return `---
ruleId: ${ruleId}
title: ${title}
severity: ${severity}
---

## [${ruleId}] ${title}

${description}

### 错误示例

\`\`\`tsx
// TODO: 添加错误示例
\`\`\`

### 正确示例

\`\`\`tsx
// TODO: 添加正确示例
\`\`\`
`;
}

/**
 * 交互式询问
 */
function askQuestion(
  rl: readline.Interface,
  question: string
): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * 主流程
 */
async function main(): Promise<void> {
  console.log('=========================================');
  console.log(' 📝 创建新规则');
  console.log('=========================================\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // 选择严重程度
  console.log('请选择严重程度：');
  console.log('  1. error — 会导致应用崩溃，CI 失败');
  console.log('  2. warning — 不会崩溃，CI 通过');

  const severityChoice = await askQuestion(rl, '\n输入编号: ');
  const severity = severityChoice === '1' ? 'error' : 'warning';

  // 输入标题
  const title = await askQuestion(rl, '\n输入规则标题: ');
  if (!title) {
    console.error('❌ 标题不能为空');
    process.exit(1);
  }

  // 输入描述
  const description = await askQuestion(rl, '\n输入规则描述: ');

  // 生成规则
  const nextId = getNextRuleId(severity);
  const prefix = severity === 'error' ? 'ERROR' : 'WARNING';
  const ruleId = `${prefix}-${nextId}`;
  const filename = generateFilename(nextId, title);
  const content = generateRuleContent(ruleId, title, severity, description);
  const rulesDir = getRulesDir(severity);

  // 确认
  console.log('\n=========================================');
  console.log('📋 规则信息');
  console.log('=========================================');
  console.log(`规则 ID: ${ruleId}`);
  console.log(`标题: ${title}`);
  console.log(`严重程度: ${severity}`);
  console.log(
    `目录: ${severity === 'error' ? 'error-rules' : 'warning-rules'}`
  );
  console.log(`文件名: ${filename}`);
  console.log(`描述: ${description || '(无)'}`);
  console.log('=========================================\n');

  const confirm = await askQuestion(rl, '确认创建？(y/N): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('已取消');
    process.exit(0);
  }

  // 创建文件
  const filePath = path.join(rulesDir, filename);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ 规则文件已创建: ${filePath}`);

  console.log('\n=========================================');
  console.log(' 🎉 创建完成！');
  console.log('=========================================');
  console.log(`\n请编辑规则文件添加详细内容：`);
  console.log(`  ${filePath}`);

  rl.close();
}

main().catch((err) => {
  console.error('❌ 创建失败：', err);
  process.exit(1);
});
