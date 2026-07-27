import { Activity, FileText, FolderKanban, UserRound } from 'lucide-react';

import { ProjectAssistant } from '@/components/saas/project-assistant';
import { ProjectFilePanel } from '@/components/saas/project-file-panel';
import { ProjectTaskBoard } from '@/components/saas/project-task-board';
import type { WorkspaceProjectView } from '@/components/saas/types';
import { formatSaasDate, workspaceProjectStatusLabels } from '@/lib/saas-presentation';

type ProjectWorkspaceProps = Readonly<{
  readonly organizationSlug: string;
  readonly project: WorkspaceProjectView;
}>;

export function ProjectWorkspace({
  organizationSlug,
  project,
}: ProjectWorkspaceProps): React.JSX.Element {
  return (
    <div className="saas-workspace-page">
      <section aria-labelledby="project-overview-heading" className="saas-project-overview">
        <div className="saas-project-overview-copy">
          <p className="saas-kicker">
            {project.workspaceName.toLocaleUpperCase('en-US')} / PROJECT WORKSPACE
          </p>
          <h1 id="project-overview-heading">{project.title}</h1>
          <p>{project.description ?? '项目说明会在协作空间中持续补充。'}</p>
        </div>
        <div className="saas-project-status-card">
          <span>当前阶段</span>
          <strong data-status={project.status.toLocaleLowerCase('en-US')}>
            {workspaceProjectStatusLabels[project.status]}
          </strong>
          <progress aria-label="项目进度" max={100} value={project.progress} />
          <small>{project.progress}% 已完成</small>
        </div>
      </section>
      <section aria-label="项目概览数据" className="saas-project-facts">
        <article>
          <FolderKanban aria-hidden="true" size={18} strokeWidth={1.75} />
          <div>
            <span>协作任务</span>
            <strong>{project.tasks.length}</strong>
          </div>
        </article>
        <article>
          <FileText aria-hidden="true" size={18} strokeWidth={1.75} />
          <div>
            <span>交付文档</span>
            <strong>{project.documents.length}</strong>
          </div>
        </article>
        <article>
          <UserRound aria-hidden="true" size={18} strokeWidth={1.75} />
          <div>
            <span>项目负责人</span>
            <strong>{project.ownerEmail ?? '待指定'}</strong>
          </div>
        </article>
      </section>
      <ProjectTaskBoard
        organizationSlug={organizationSlug}
        projectId={project.id}
        tasks={project.tasks}
      />
      <ProjectFilePanel
        documents={project.documents}
        organizationSlug={organizationSlug}
        projectId={project.id}
      />
      <section aria-labelledby="project-activity-heading" className="saas-workspace-panel">
        <div className="saas-panel-heading">
          <div>
            <p className="saas-kicker">TIMELINE</p>
            <h2 id="project-activity-heading">项目动态</h2>
          </div>
          <p>任务、文档与项目状态变更会在此留下可追溯记录。</p>
        </div>
        <ol className="saas-activity-list">
          {project.activities.length === 0 ? (
            <li className="saas-empty-state">项目开始协作后，动态会显示在这里。</li>
          ) : (
            project.activities.map((activity) => (
              <li key={activity.id}>
                <Activity aria-hidden="true" size={16} strokeWidth={1.75} />
                <div>
                  <strong>{activity.content}</strong>
                  <span>{activity.actorEmail ?? '系统记录'}</span>
                </div>
                <time dateTime={activity.createdAt}>{formatSaasDate(activity.createdAt)}</time>
              </li>
            ))
          )}
        </ol>
      </section>
      <ProjectAssistant organizationSlug={organizationSlug} projectId={project.id} />
    </div>
  );
}
