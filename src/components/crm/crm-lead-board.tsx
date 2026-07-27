'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { moveCrmLead } from '@/actions/admin/crm';
import { CrmLeadStatusBadge, CrmPriorityBadge } from '@/components/crm/crm-status-badge';
import { crmLeadStatuses, crmLeadStatusLabels } from '@/types/crm';
import type { CrmLeadPriority, CrmLeadSource, CrmLeadStatus } from '@/types/crm';

export type CrmLeadBoardItem = Readonly<{
  readonly company: string | null;
  readonly id: string;
  readonly name: string;
  readonly priority: CrmLeadPriority;
  readonly score: number;
  readonly service: string | null;
  readonly source: CrmLeadSource | undefined;
  readonly status: CrmLeadStatus;
  readonly taskTitle: string | undefined;
}>;

type CrmLeadBoardProps = Readonly<{
  readonly leads: readonly CrmLeadBoardItem[];
}>;

export function CrmLeadBoard({ leads }: CrmLeadBoardProps): React.JSX.Element {
  const router = useRouter();
  const [draggedLeadId, setDraggedLeadId] = useState<string | undefined>(undefined);
  const [announcement, setAnnouncement] = useState('');
  const [isPending, startTransition] = useTransition();

  function requestMove(leadId: string, status: CrmLeadStatus): void {
    const lead = leads.find((item) => item.id === leadId);

    if (lead === undefined || lead.status === status) {
      return;
    }

    setAnnouncement(`正在将 ${lead.name} 移动到${crmLeadStatusLabels[status]}。`);
    startTransition(() => {
      void moveCrmLead({ leadId, status })
        .then((result) => {
          if (result.kind === 'success') {
            setAnnouncement(`${lead.name} 已移动到${crmLeadStatusLabels[status]}。`);
            router.refresh();

            return;
          }

          setAnnouncement('无法更新线索状态，请稍后重试。');
        })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            setAnnouncement('无法更新线索状态，请检查登录状态和数据库连接。');

            return;
          }

          setAnnouncement('无法更新线索状态，请稍后重试。');
        });
    });
  }

  return (
    <section aria-describedby="crm-board-status" className="crm-lead-board">
      <p className="visually-hidden" id="crm-board-status" role="status">
        {isPending ? '正在更新线索状态。' : announcement}
      </p>
      <div className="crm-lead-board-scroll">
        <div className="crm-lead-board-columns">
          {crmLeadStatuses.map((status) => {
            const items = leads.filter((lead) => lead.status === status);

            return (
              <section
                className="crm-lead-column"
                data-drop-target={draggedLeadId === undefined ? undefined : 'true'}
                key={status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();

                  if (draggedLeadId !== undefined) {
                    requestMove(draggedLeadId, status);
                    setDraggedLeadId(undefined);
                  }
                }}
              >
                <header>
                  <h2>{crmLeadStatusLabels[status]}</h2>
                  <span>{items.length}</span>
                </header>
                <div className="crm-lead-column-items">
                  {items.length === 0 ? (
                    <p className="crm-lead-column-empty">暂无线索</p>
                  ) : (
                    items.map((lead) => (
                      <article
                        className="crm-lead-card"
                        draggable
                        key={lead.id}
                        onDragEnd={() => setDraggedLeadId(undefined)}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('text/plain', lead.id);
                          setDraggedLeadId(lead.id);
                        }}
                      >
                        <div className="crm-lead-card-topline">
                          <CrmPriorityBadge priority={lead.priority} />
                          <span>{lead.score} 分</span>
                        </div>
                        <Link href={`/admin/crm/leads/${lead.id}`}>{lead.name}</Link>
                        <p>{lead.company ?? lead.service ?? '待补充合作信息'}</p>
                        <div className="crm-lead-card-meta">
                          <CrmLeadStatusBadge status={lead.status} />
                          {lead.taskTitle === undefined ? null : <span>{lead.taskTitle}</span>}
                        </div>
                        <label className="crm-lead-card-move">
                          <span className="visually-hidden">移动 {lead.name} 到其他阶段</span>
                          <select
                            defaultValue={lead.status}
                            disabled={isPending}
                            onChange={(event) => {
                              const nextStatus = crmLeadStatuses.find(
                                (value) => value === event.target.value,
                              );

                              if (nextStatus !== undefined) {
                                requestMove(lead.id, nextStatus);
                              }
                            }}
                          >
                            {crmLeadStatuses.map((option) => (
                              <option key={option} value={option}>
                                移动到{crmLeadStatusLabels[option]}
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
