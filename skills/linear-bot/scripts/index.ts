import { Command } from 'commander';
import { getIssue } from './issue.js';
import { getMilestoneIssues } from './milestone.js';

const program = new Command();

program
  .command('issue <identifier>')
  .description('查询单个 issue 详情，如: issue ENG-123')
  .action(async (identifier: string) => {
    const result = await getIssue(identifier);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('milestone-issues <project> <milestone>')
  .description(
    '查询项目某个 milestone 下的所有 issue，如: milestone-issues "My Project" "v1.0"'
  )
  .action(async (project: string, milestone: string) => {
    const result = await getMilestoneIssues(project, milestone);
    console.log(JSON.stringify(result, null, 2));
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(JSON.stringify({ error: String(err) }));
  process.exit(1);
});
