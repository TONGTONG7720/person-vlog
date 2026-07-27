import { ArrowUpRight, FileText, ListChecks } from 'lucide-react';
import Link from 'next/link';

import { ClientPortalHeader } from '@/components/saas/client-portal-header';
import type { PortalProject } from '@/components/saas/types';
import {
  buildSaasOrganizationHref,
  formatSaasDate,
  workspaceProjectStatusLabels,
} from '@/lib/saas-presentation';
import { requireSaasContext } from '@/server/saas/auth';
import { getSaasPortalProjects } from '@/server/saas/projects';

type ClientPortalPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<{ readonly organization?: string | readonly string[] }>>;
}>;

export default async function ClientPortalPage({
  searchParams,
}: ClientPortalPageProps): Promise<React.JSX.Element> {
  const query = await searchParams;
  const organizationSlug = typeof query.organization === 'string' ? query.organization : undefined;
  const context = await requireSaasContext(organizationSlug);
  const projects = await getSaasPortalProjects(context);
  const projectCards: readonly PortalProject[] = projects.map((project) => ({
    description: project.description,
    documentCount: project._count.documents,
    id: project.id,
    progress: project.progress,
    status: project.status,
    taskCount: project._count.tasks,
    title: project.title,
    updatedAt: project.updatedAt.toISOString(),
    workspaceName: project.workspace.name,
  }));

  return (
    <div className="saas-client-page">
      <ClientPortalHeader
        email={context.user.email}
        organization={context.organization}
        organizations={context.organizations}
      />
      <div className="saas-client-page-content">
        <header className="saas-client-intro">
          <div>
            <p className="saas-kicker">
              {context.organization.slug.toLocaleUpperCase('en-US')} / CLIENT PORTAL
            </p>
            <h1>项目进度，一目了然。</h1>
            <p>在这里查看当前企业空间中属于你的项目、协作任务、交付资料与最新更新。</p>
          </div>
          <div className="saas-client-organization">
            <span>当前企业</span>
            <strong>{context.organization.name}</strong>
          </div>
        </header>
        <section aria-labelledby="client-projects-heading" className="saas-client-projects">
          <div className="saas-panel-heading">
            <div>
              <p className="saas-kicker">PROJECTS</p>
              <h2 id="client-projects-heading">协作项目</h2>
            </div>
            <p>{projectCards.length} 个项目处于当前企业空间中。</p>
          </div>
          {projectCards.length === 0 ? (
            <p className="saas-empty-state">
              暂时没有可见项目。项目创建后会自动显示在这个客户门户中。
            </p>
          ) : (
            <div className="saas-project-grid">
              {projectCards.map((project) => (
                <article className="saas-project-card" key={project.id}>
                  <div className="saas-project-card-topline">
                    <span>{project.workspaceName}</span>
                    <span data-status={project.status.toLocaleLowerCase('en-US')}>
                      {workspaceProjectStatusLabels[project.status]}
                    </span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.description ?? '项目说明会在协作空间中持续更新。'}</p>
                  <progress
                    aria-label={`${project.title} 项目进度`}
                    max={100}
                    value={project.progress}
                  />
                  <div className="saas-project-card-meta">
                    <span>{project.progress}% 完成</span>
                    <span>
                      <ListChecks aria-hidden="true" size={15} /> {project.taskCount} 项任务
                    </span>
                    <span>
                      <FileText aria-hidden="true" size={15} /> {project.documentCount} 份资料
                    </span>
                  </div>
                  <div className="saas-project-card-footer">
                    <time dateTime={project.updatedAt}>
                      更新于 {formatSaasDate(project.updatedAt)}
                    </time>
                    <Link
                      href={buildSaasOrganizationHref(
                        `/dashboard/projects/${project.id}`,
                        context.organization.slug,
                      )}
                    >
                      <span>打开协作空间</span>
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
