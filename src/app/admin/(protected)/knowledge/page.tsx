import {
  createAdminKnowledge,
  deleteAdminKnowledge,
  updateAdminKnowledge,
} from '@/actions/admin/knowledge';
import { AdminDeleteForm } from '@/components/admin/admin-delete-form';
import {
  AdminEmptyState,
  AdminFormFeedback,
  AdminPageHeader,
  AdminPagination,
  AdminSearchForm,
  AdminSetupNotice,
  formatAdminDate,
} from '@/components/admin/admin-page-primitives';
import { AdminKnowledgeForm } from '@/components/admin/forms/admin-knowledge-form';
import { KnowledgeSyncStatus } from '@/generated/prisma/client';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getAdminKnowledge, getAdminListQuery } from '@/server/cms/queries';

type KnowledgePageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function AdminKnowledgePage({
  searchParams,
}: KnowledgePageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const query = getAdminListQuery(params['search'], params['page']);
  const [knowledgeEntries, databaseConfigured] = await Promise.all([
    getAdminKnowledge(query),
    Promise.resolve(isCmsDatabaseConfigured()),
  ]);

  return (
    <>
      <AdminPageHeader
        description="管理网站助手的公开知识。保存后，助手会优先读取数据库中的已启用内容。"
        eyebrow="AI / KNOWLEDGE"
        title="AI 知识库"
      />
      <AdminFormFeedback error={params['error']} success={params['success']} />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">KNOWLEDGE UPDATE</p>
            <h2>新增知识</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <p className="admin-inline-note">
            当前助手使用数据库直接检索，因此保存后立即生效；语义向量检索是可选增强，未配置 pgvector
            时会显示为待同步。
          </p>
          <AdminKnowledgeForm action={createAdminKnowledge} submitLabel="保存知识" />
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">ASSISTANT CONTEXT</p>
            <h2>知识条目</h2>
          </div>
          <AdminSearchForm action="/admin/knowledge" search={query.search} />
        </div>
        {knowledgeEntries.length === 0 ? (
          <div className="admin-panel-body">
            <AdminEmptyState>
              暂无数据库知识。未配置条目时，助手会继续使用项目内置的静态基础知识。
            </AdminEmptyState>
          </div>
        ) : (
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th scope="col">知识</th>
                  <th scope="col">分类</th>
                  <th scope="col">助手使用</th>
                  <th scope="col">向量同步</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {knowledgeEntries.map((knowledge) => (
                  <tr key={knowledge.id}>
                    <td>
                      <span className="admin-data-title">
                        {knowledge.title}
                        <small>/{knowledge.slug}</small>
                      </span>
                    </td>
                    <td>{knowledge.category}</td>
                    <td>
                      <span className="admin-status-badge">
                        {knowledge.enabled ? '已启用' : '已停用'}
                      </span>
                    </td>
                    <td>
                      <span className="admin-status-badge">
                        {getSyncStatusLabel(knowledge.syncStatus)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <details className="admin-details">
                          <summary>编辑</summary>
                          <AdminKnowledgeForm
                            action={updateAdminKnowledge}
                            submitLabel="保存知识"
                            values={{
                              category: knowledge.category,
                              content: knowledge.content,
                              enabled: knowledge.enabled,
                              id: knowledge.id,
                              slug: knowledge.slug,
                              title: knowledge.title,
                            }}
                          />
                          <p className="admin-detail-meta">
                            最后更新：{formatAdminDate(knowledge.updatedAt)}
                          </p>
                        </details>
                        <AdminDeleteForm
                          action={deleteAdminKnowledge}
                          id={knowledge.id}
                          resourceLabel={`知识「${knowledge.title}」`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination
          itemCount={knowledgeEntries.length}
          page={query.page}
          pathname="/admin/knowledge"
          search={query.search}
        />
      </section>
    </>
  );
}

function getSyncStatusLabel(status: KnowledgeSyncStatus): string {
  return status === KnowledgeSyncStatus.CURRENT ? '已同步' : '待向量同步';
}
