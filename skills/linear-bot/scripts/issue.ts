import { linearClient } from './client.js';

export async function getIssue(identifier: string) {
  const parts = identifier.split('-');
  if (parts.length !== 2 || !parts[1]) {
    return {
      error: `Invalid identifier format: ${identifier}. Expected format: TEAM-123`,
    };
  }
  const [teamKey, numberStr] = parts;
  const issueNumber = parseInt(numberStr, 10);

  const results = await linearClient.issues({
    filter: {
      number: { eq: issueNumber },
      team: { key: { eq: teamKey } },
    },
    first: 1,
  });
  const issue = results.nodes[0];

  if (!issue) {
    return { error: `Issue ${identifier} not found` };
  }

  const [state, assignee, team, labelsConn] = await Promise.all([
    issue.state,
    issue.assignee,
    issue.team,
    issue.labels(),
  ]);

  return {
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description ?? null,
    status: state?.name ?? null,
    priority: issue.priorityLabel,
    assignee: assignee?.displayName ?? null,
    labels: labelsConn.nodes.map((l) => l.name),
    team: team?.name ?? null,
    url: issue.url,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  };
}
