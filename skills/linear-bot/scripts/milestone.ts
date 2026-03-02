import { linearClient } from './client.js';

export async function getMilestoneIssues(
  projectName: string,
  milestoneName: string
) {
  const projects = await linearClient.projects();
  const project = projects.nodes.find(
    (p) => p.name.toLowerCase() === projectName.toLowerCase()
  );

  if (!project) {
    return { error: `Project "${projectName}" not found` };
  }

  const milestones = await project.projectMilestones();
  const milestone = milestones.nodes.find(
    (m) => m.name.toLowerCase() === milestoneName.toLowerCase()
  );

  if (!milestone) {
    return {
      error: `Milestone "${milestoneName}" not found in project "${projectName}"`,
    };
  }

  const allIssues = [];
  let issuesPage = await linearClient.issues({
    filter: { projectMilestone: { id: { eq: milestone.id } } },
    first: 50,
  });

  allIssues.push(...issuesPage.nodes);

  while (issuesPage.pageInfo.hasNextPage) {
    issuesPage = await linearClient.issues({
      filter: { projectMilestone: { id: { eq: milestone.id } } },
      first: 50,
      after: issuesPage.pageInfo.endCursor,
    });
    allIssues.push(...issuesPage.nodes);
  }

  const issueData = await Promise.all(
    allIssues.map(async (issue) => {
      const [state, assignee, labelsConn] = await Promise.all([
        issue.state,
        issue.assignee,
        issue.labels(),
      ]);
      return {
        identifier: issue.identifier,
        title: issue.title,
        status: state?.name ?? null,
        priority: issue.priorityLabel,
        assignee: assignee?.displayName ?? null,
        labels: labelsConn.nodes.map((l) => l.name),
        url: issue.url,
      };
    })
  );

  return {
    project: project.name,
    milestone: milestone.name,
    total: issueData.length,
    issues: issueData,
  };
}
