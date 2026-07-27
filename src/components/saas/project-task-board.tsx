'use client';

import { CheckCircle2, Circle, Clock3, LoaderCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

import type { ProjectTaskStatus } from '@/generated/prisma/client';
import type { PortalTask } from '@/components/saas/types';
import { projectTaskPriorityLabels, projectTaskStatusLabels } from '@/lib/saas-presentation';

const taskColumns = [
  'TODO',
  'DOING',
  'REVIEW',
  'DONE',
] as const satisfies readonly ProjectTaskStatus[];

type ProjectTaskBoardProps = Readonly<{
  readonly organizationSlug: string;
  readonly projectId: string;
  readonly tasks: readonly PortalTask[];
}>;

type TaskStatusUpdate = Readonly<{
  readonly status: ProjectTaskStatus;
  readonly taskId: string;
}>;

export function ProjectTaskBoard({
  organizationSlug,
  projectId,
  tasks,
}: ProjectTaskBoardProps): React.JSX.Element {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | undefined>();
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const taskEndpoint = `/api/v1/projects/${projectId}/tasks?organization=${encodeURIComponent(organizationSlug)}`;

  async function handleCreateTask(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsCreating(true);
    setStatusMessage(undefined);

    try {
      const response = await fetch(taskEndpoint, {
        body: JSON.stringify({
          description: String(formData.get('description') ?? ''),
          priority: String(formData.get('priority') ?? 'MEDIUM'),
          status: 'TODO',
          title: String(formData.get('title') ?? ''),
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        setStatusMessage('无法创建任务，请检查权限与项目连接。');
        return;
      }

      form.reset();
      setStatusMessage('任务已创建。');
      router.refresh();
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('网络连接不可用，请稍后重试。');
        return;
      }

      throw error;
    } finally {
      setIsCreating(false);
    }
  }

  async function handleStatusUpdate(input: TaskStatusUpdate): Promise<void> {
    setPendingTaskId(input.taskId);
    setStatusMessage(undefined);

    try {
      const response = await fetch(
        `/api/v1/projects/${projectId}/tasks/${input.taskId}?organization=${encodeURIComponent(organizationSlug)}`,
        {
          body: JSON.stringify({ status: input.status }),
          headers: { 'Content-Type': 'application/json' },
          method: 'PATCH',
        },
      );

      if (!response.ok) {
        setStatusMessage('无法更新任务状态，请确认当前成员权限。');
        return;
      }

      setStatusMessage('任务状态已更新。');
      router.refresh();
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('网络连接不可用，请稍后重试。');
        return;
      }

      throw error;
    } finally {
      setPendingTaskId(undefined);
    }
  }

  return (
    <section aria-labelledby="project-tasks-heading" className="saas-workspace-panel">
      <div className="saas-panel-heading">
        <div>
          <p className="saas-kicker">TASKS</p>
          <h2 id="project-tasks-heading">任务进度</h2>
        </div>
        <p>每次状态变化都会记录在项目动态中。</p>
      </div>
      <form className="saas-task-create-form" onSubmit={handleCreateTask}>
        <label>
          <span className="visually-hidden">新任务标题</span>
          <input name="title" placeholder="添加一个需要推进的任务" required type="text" />
        </label>
        <label className="visually-hidden" htmlFor="new-task-description">
          任务说明
        </label>
        <input
          id="new-task-description"
          name="description"
          placeholder="说明（可选）"
          type="text"
        />
        <label className="visually-hidden" htmlFor="new-task-priority">
          任务优先级
        </label>
        <select defaultValue="MEDIUM" id="new-task-priority" name="priority">
          {Object.entries(projectTaskPriorityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}优先级
            </option>
          ))}
        </select>
        <button className="saas-secondary-button" disabled={isCreating} type="submit">
          {isCreating ? (
            <LoaderCircle aria-hidden="true" className="saas-inline-spinner" size={16} />
          ) : (
            <Plus aria-hidden="true" size={16} />
          )}
          <span>{isCreating ? '创建中' : '新增任务'}</span>
        </button>
      </form>
      {statusMessage === undefined ? null : (
        <p aria-live="polite" className="saas-inline-feedback" role="status">
          {statusMessage}
        </p>
      )}
      <div className="saas-board-scroll" tabIndex={0}>
        <div className="saas-task-board">
          {taskColumns.map((status) => {
            const columnTasks = tasks.filter((task) => task.status === status);
            const ColumnIcon =
              status === 'DONE' ? CheckCircle2 : status === 'TODO' ? Circle : Clock3;

            return (
              <section
                aria-labelledby={`task-column-${status}`}
                className="saas-task-column"
                key={status}
              >
                <header>
                  <div>
                    <ColumnIcon aria-hidden="true" size={16} strokeWidth={1.75} />
                    <h3 id={`task-column-${status}`}>{projectTaskStatusLabels[status]}</h3>
                  </div>
                  <span>{columnTasks.length}</span>
                </header>
                <div className="saas-task-list">
                  {columnTasks.length === 0 ? (
                    <p className="saas-column-empty">当前没有任务</p>
                  ) : (
                    columnTasks.map((task) => (
                      <article className="saas-task-card" key={task.id}>
                        <div className="saas-task-card-copy">
                          <strong>{task.title}</strong>
                          {task.description === null ? null : <p>{task.description}</p>}
                        </div>
                        <div className="saas-task-meta">
                          <span data-priority={task.priority.toLocaleLowerCase('en-US')}>
                            {projectTaskPriorityLabels[task.priority]}优先级
                          </span>
                          <span>{task.assigneeEmail ?? '未分配成员'}</span>
                        </div>
                        <label className="saas-task-status-control">
                          <span className="visually-hidden">更新任务状态</span>
                          <select
                            disabled={pendingTaskId === task.id}
                            onChange={(event) => {
                              const nextStatus = taskColumns.find(
                                (option) => option === event.target.value,
                              );

                              if (nextStatus !== undefined) {
                                void handleStatusUpdate({ status: nextStatus, taskId: task.id });
                              }
                            }}
                            value={task.status}
                          >
                            {taskColumns.map((option) => (
                              <option key={option} value={option}>
                                {projectTaskStatusLabels[option]}
                              </option>
                            ))}
                          </select>
                        </label>
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
