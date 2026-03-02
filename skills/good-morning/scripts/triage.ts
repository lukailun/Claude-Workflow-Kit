#!/usr/bin/env bun

/**
 * Triage script for good-morning skill
 *
 * Combines Linear issues and MR summaries into a structured triage output
 *
 * Usage:
 * bun run triage.ts <linear-summary-path> <mr-summary-output>
 */

import { readFileSync } from 'fs';

interface Issue {
  identifier: string;
  title: string;
  priority: string;
  milestone?: string;
  labels: string[];
  url: string;
}

// interface MRInfo {
//   id: string;
//   title: string;
//   author: string;
//   reviewer?: string;
//   status: string;
// }

function parseLinearSummary(content: string): Issue[] {
  const issues: Issue[] = [];
  const lines = content.split('\n');

  let currentIssue: Partial<Issue> | null = null;

  for (const line of lines) {
    const issueMatch = line.match(/^### (4T-\d+): (.+)$/);
    if (issueMatch) {
      if (currentIssue && currentIssue.identifier) {
        issues.push(currentIssue as Issue);
      }
      currentIssue = {
        identifier: issueMatch[1],
        title: issueMatch[2],
        labels: [],
      };
      continue;
    }

    if (currentIssue) {
      if (line.startsWith('- 优先级:')) {
        currentIssue.priority = line.replace('- 优先级:', '').trim();
      } else if (line.startsWith('- Milestone:')) {
        currentIssue.milestone = line.replace('- Milestone:', '').trim();
      } else if (line.startsWith('- 标签:')) {
        currentIssue.labels = line
          .replace('- 标签:', '')
          .split(',')
          .map((l) => l.trim());
      } else if (line.startsWith('- 链接:')) {
        currentIssue.url = line.replace('- 链接:', '').trim();
      }
    }
  }

  if (currentIssue && currentIssue.identifier) {
    issues.push(currentIssue as Issue);
  }

  return issues;
}

function main() {
  const linearSummaryPath = process.argv[2];
  const mrSummaryOutput = process.argv[3];

  if (!linearSummaryPath || !mrSummaryOutput) {
    console.error(
      'Usage: bun run triage.ts <linear-summary-path> <mr-summary-output>'
    );
    process.exit(1);
  }

  const linearContent = readFileSync(linearSummaryPath, 'utf-8');
  const issues = parseLinearSummary(linearContent);

  // Generate triage summary
  console.log('## 🌅 Good Morning Work Triage\n');

  // MR Summary
  console.log('### 📋 Merge Requests\n');
  console.log(mrSummaryOutput);
  console.log('\n---\n');

  // Linear Issues by Category
  console.log('### 🎯 Linear Issues\n');

  const milestoneIssues = issues.filter((i) => i.milestone);
  const bossFeedback = issues.filter((i) => i.labels.includes('老板反馈'));
  const bugs = issues.filter((i) => i.labels.includes('Bug'));

  if (milestoneIssues.length > 0) {
    console.log(`**Milestone Issues (${milestoneIssues.length}):**\n`);
    milestoneIssues.slice(0, 5).forEach((issue) => {
      console.log(`- **${issue.identifier}**: ${issue.title}`);
    });
    console.log('');
  }

  if (bossFeedback.length > 0) {
    console.log(`**Boss Feedback (${bossFeedback.length}):**\n`);
    bossFeedback.slice(0, 5).forEach((issue) => {
      console.log(`- **${issue.identifier}**: ${issue.title}`);
    });
    console.log('');
  }

  if (bugs.length > 0) {
    console.log(`**Bugs (${bugs.length}):**\n`);
    bugs.slice(0, 5).forEach((issue) => {
      console.log(`- **${issue.identifier}**: ${issue.title}`);
    });
  }
}

main();
