import { linearClient } from './client.js';

const PROJECT_NAME = 'Gusto English App';
const WXWORK_WEBHOOK =
  'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=d2ce2f7f-f07e-441d-942b-d54184ba6d85';

async function sendToWxWork(text: string) {
  const res = await fetch(WXWORK_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msgtype: 'text', text: { content: text } }),
  });
  if (!res.ok) throw new Error(`WeChat Work webhook failed: ${res.status}`);
}

function buildProgressBar(percent: number, width = 20): string {
  const filled = Math.round((percent / 100) * width);
  return `[${'#'.repeat(filled)}${'.'.repeat(width - filled)}]`;
}

async function getVersionReport(version: string) {
  const projects = await linearClient.projects();
  const project = projects.nodes.find(
    (p) => p.name.toLowerCase() === PROJECT_NAME.toLowerCase()
  );
  if (!project) throw new Error(`Project "${PROJECT_NAME}" not found`);

  const milestones = await project.projectMilestones();
  const milestone = milestones.nodes.find(
    (m) => m.name.toLowerCase() === version.toLowerCase()
  );
  if (!milestone) throw new Error(`Milestone "${version}" not found`);

  const allIssues = [];
  let page = await linearClient.issues({
    filter: { projectMilestone: { id: { eq: milestone.id } } },
    first: 50,
  });
  allIssues.push(...page.nodes);
  while (page.pageInfo.hasNextPage) {
    page = await linearClient.issues({
      filter: { projectMilestone: { id: { eq: milestone.id } } },
      first: 50,
      after: page.pageInfo.endCursor,
    });
    allIssues.push(...page.nodes);
  }

  const issuesWithState = await Promise.all(
    allIssues.map(async (issue) => {
      const state = await issue.state;
      return {
        identifier: issue.identifier,
        title: issue.title,
        status: state?.name ?? 'Unknown',
        type: state?.type ?? 'unknown',
        priority: issue.priority,
      };
    })
  );

  const statusCount: Record<string, number> = {};
  for (const issue of issuesWithState) {
    statusCount[issue.status] = (statusCount[issue.status] ?? 0) + 1;
  }

  const total = issuesWithState.length;
  const doneCount = issuesWithState.filter(
    (i) => i.type === 'completed'
  ).length;
  const completionRate =
    total > 0 ? ((doneCount / total) * 100).toFixed(1) : '0';

  const statusEntries = Object.entries(statusCount).sort((a, b) => b[1] - a[1]);
  const statusRows = statusEntries.map(
    ([status, count]) => `- ${status}: ${count}`
  );

  const lines = [
    `📦 Linear · ${PROJECT_NAME} · ${version}`,
    ``,
    `${buildProgressBar(Number(completionRate))} ${completionRate}% (${doneCount}/${total} done)`,
    ``,
    `📊进度概览`,
    ...statusRows,
  ];

  const unfinished = issuesWithState.filter(
    (i) =>
      i.type !== 'completed' &&
      i.status !== 'Backlog' &&
      i.status !== 'Canceled' &&
      i.status !== 'Testing' &&
      i.status !== 'In Code Review' &&
      (i.priority === 1 || i.priority === 2)
  );
  if (unfinished.length > 0) {
    lines.push(``, `⚠️优先关注(${unfinished.length})`);
    for (const i of unfinished) {
      const flag = i.priority === 1 ? '[urgent]' : '[high]';
      const title =
        i.title.length > 25 ? i.title.slice(0, 25) + '...' : i.title;
      lines.push(`- ${flag} [${i.identifier}] ${title} -- ${i.status}`);
    }
  }

  const report = lines.join('\n');
  console.log(report);
  return report;
}

const version = process.argv[2];
const push = process.argv[3] === '--push';
if (!version) {
  console.error(
    'Usage: npx tsx linear-bot-skill/scripts/report.ts <version> [--push]'
  );
  process.exit(1);
}

getVersionReport(version)
  .then(async (report) => {
    if (push) {
      await sendToWxWork(report);
      console.log('Sent to WeChat Work.');
    }
  })
  .catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
