import { notFound } from 'next/navigation';

import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import { ProjectWorkspace } from '@/components/saas/project-workspace';
import type { WorkspaceProjectView } from '@/components/saas/types';
import { requireSaasContext } from '@/server/saas/auth';
import { getSaasProjectWorkspace } from '@/server/saas/projects';

type ProjectWorkspacePageProps = Readonly<{
  readonly params: Promise<Readonly<{ readonly id: string }>>;
  readonly searchParams: Promise<Readonly<{ readonly organization?: string | readonly string[] }>>;
}>;

export default async function ProjectWorkspacePage({
  params,
  searchParams,
}: ProjectWorkspacePageProps): Promise<React.JSX.Element> {
  const [route, query] = await Promise.all([params, searchParams]);
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const context = await requireSaasContext(organizationSlug);
  const project = await getSaasProjectWorkspace(context, route.id);

  if (project === null) {
    notFound();
  }

  const projectView: WorkspaceProjectView = {
    activities: project.activities.map((activity) => ({
      actorEmail: activity.actor?.user.email,
      content: activity.content,
      createdAt: activity.createdAt.toISOString(),
      id: activity.id,
      type: activity.type,
    })),
    description: project.description,
    documents: project.documents.map((document) => ({
      content: document.content,
      contentType: document.contentType,
      createdAt: document.createdAt.toISOString(),
      id: document.id,
      kind: document.kind,
      pathname: document.pathname,
      size: document.size,
      title: document.title,
      updatedAt: document.updatedAt.toISOString(),
    })),
    id: project.id,
    ownerEmail: project.owner?.user.email,
    progress: project.progress,
    status: project.status,
    tasks: project.tasks.map((task) => ({
      assigneeEmail: task.assignee?.user.email,
      description: task.description,
      dueDate: task.dueDate?.toISOString(),
      id: task.id,
      priority: task.priority,
      status: task.status,
      title: task.title,
    })),
    title: project.title,
    workspaceName: project.workspace.name,
  };

  return (
    <div className="saas-portal-shell">
      <ClientPortalHeader
        currentPath={`/dashboard/projects/${project.id}`}
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
        organizationSwitchPath="/client"
      />
      <main className="saas-client-main">
        <ProjectWorkspace organizationSlug={context.organization.slug} project={projectView} />
      </main>
    </div>
  );
}
