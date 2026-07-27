import Link from 'next/link';

import { createCrmLead } from '@/actions/admin/crm';
import { CrmLeadBoard } from '@/components/crm/crm-lead-board';
import { CrmNavigation } from '@/components/crm/crm-navigation';
import {
  AdminEmptyState,
  AdminFormFeedback,
  AdminPageHeader,
  AdminSearchForm,
  AdminSetupNotice,
} from '@/components/admin/admin-page-primitives';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getAdminListQuery } from '@/server/cms/queries';
import { crmLeadPriorityFromPrisma, crmLeadStatusFromPrisma } from '@/server/crm/mappings';
import { getCrmLeads } from '@/server/crm/queries';
import {
  crmLeadSources,
  crmLeadStatuses,
  crmLeadStatusLabels,
  normalizeCrmLeadSource,
} from '@/types/crm';

type CrmLeadsPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function CrmLeadsPage({
  searchParams,
}: CrmLeadsPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const query = getAdminListQuery(params['search'], params['page']);
  const statusValue = typeof params['status'] === 'string' ? params['status'] : undefined;
  const status = crmLeadStatuses.find((value) => value === statusValue);
  const [leads, databaseConfigured] = await Promise.all([
    getCrmLeads(query, status),
    Promise.resolve(isCmsDatabaseConfigured()),
  ]);
  const boardLeads = leads.map((lead) => ({
    company: lead.company,
    id: lead.id,
    name: lead.name,
    priority: crmLeadPriorityFromPrisma[lead.priority],
    score: lead.score,
    service: lead.service,
    source: normalizeCrmLeadSource(lead.source ?? undefined),
    status: crmLeadStatusFromPrisma[lead.status],
    taskTitle: lead.tasks[0]?.title,
  }));

  return (
    <>
      <AdminPageHeader
        description="拖拽卡片或使用卡片内的阶段选择器，持续推进每一条合作线索。"
        eyebrow="CRM / LEADS"
        title="线索看板"
      />
      <CrmNavigation current="/admin/crm/leads" />
      <AdminFormFeedback error={params['error']} success={params['success']} />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">LEAD PIPELINE</p>
            <h2>合作机会</h2>
          </div>
          <AdminSearchForm action="/admin/crm/leads" search={query.search} />
        </div>
        <div className="crm-filter-row" role="navigation" aria-label="按线索阶段筛选">
          <Link data-active={status === undefined} href="/admin/crm/leads">
            全部
          </Link>
          {crmLeadStatuses.map((item) => (
            <Link data-active={status === item} href={`/admin/crm/leads?status=${item}`} key={item}>
              {crmLeadStatusLabels[item]}
            </Link>
          ))}
        </div>
        <div className="admin-panel-body">
          {boardLeads.length === 0 ? (
            <AdminEmptyState>
              暂无匹配线索。官网 Contact 提交、社媒来源或手动录入的合作机会会显示在这里。
            </AdminEmptyState>
          ) : (
            <CrmLeadBoard leads={boardLeads} />
          )}
        </div>
      </section>

      <details className="crm-create-panel">
        <summary>手动录入线索</summary>
        <form action={createCrmLead} className="admin-resource-form">
          <div className="admin-field-grid">
            <label>
              联系人
              <input name="name" required type="text" />
            </label>
            <label>
              邮箱
              <input name="email" required type="email" />
            </label>
          </div>
          <div className="admin-field-grid">
            <label>
              公司或团队
              <input name="company" type="text" />
            </label>
            <label>
              合作方向
              <input name="service" placeholder="例如 AI 应用开发" type="text" />
            </label>
          </div>
          <div className="admin-field-grid">
            <label>
              线索来源
              <select defaultValue="" name="source">
                <option value="">未指定</option>
                {crmLeadSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </label>
            <label>
              优先级
              <select defaultValue="medium" name="priority">
                <option value="low">低</option>
                <option value="medium">常规</option>
                <option value="high">高</option>
              </select>
            </label>
          </div>
          <div className="admin-field-grid">
            <label>
              预算范围
              <input name="budget" type="text" />
            </label>
            <label>
              期望时间
              <input name="timeline" type="text" />
            </label>
          </div>
          <label>
            标签（逗号分隔）
            <input name="tags" placeholder="AI, System" type="text" />
          </label>
          <label>
            初始备注
            <textarea name="notes" rows={4} />
          </label>
          <button className="admin-primary-button" type="submit">
            创建线索
          </button>
        </form>
      </details>
    </>
  );
}
