import { deleteAdminMessage, updateAdminMessageStatus } from '@/actions/admin/messages';
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
import { MessageStatus } from '@/generated/prisma/client';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { getAdminListQuery, getAdminMessages } from '@/server/cms/queries';

type MessagesPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

export default async function AdminMessagesPage({
  searchParams,
}: MessagesPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const query = getAdminListQuery(params['search'], params['page']);
  const [messages, databaseConfigured] = await Promise.all([
    getAdminMessages(query),
    Promise.resolve(isCmsDatabaseConfigured()),
  ]);

  return (
    <>
      <AdminPageHeader
        description="集中查看官网咨询，记录处理状态，并直接通过邮箱继续沟通。"
        eyebrow="INBOX / LEADS"
        title="咨询留言"
      />
      <AdminFormFeedback error={params['error']} success={params['success']} />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">CONTACT INBOX</p>
            <h2>留言列表</h2>
          </div>
          <AdminSearchForm action="/admin/messages" search={query.search} />
        </div>
        {messages.length === 0 ? (
          <div className="admin-panel-body">
            <AdminEmptyState>
              暂无咨询留言。官网 Contact 表单提交后会自动出现在这里。
            </AdminEmptyState>
          </div>
        ) : (
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th scope="col">联系人</th>
                  <th scope="col">项目类型</th>
                  <th scope="col">状态</th>
                  <th scope="col">提交时间</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td>
                      <span className="admin-data-title">
                        {message.name}
                        <small>{message.email}</small>
                      </span>
                    </td>
                    <td>{message.service}</td>
                    <td>
                      <form action={updateAdminMessageStatus} className="admin-inline-form">
                        <input name="id" type="hidden" value={message.id} />
                        <label className="visually-hidden" htmlFor={`message-status-${message.id}`}>
                          更新咨询状态
                        </label>
                        <select
                          defaultValue={getMessageStatusValue(message.status)}
                          id={`message-status-${message.id}`}
                          name="status"
                        >
                          <option value="unread">未读</option>
                          <option value="processing">处理中</option>
                          <option value="completed">已完成</option>
                          <option value="archived">已归档</option>
                        </select>
                        <button className="admin-secondary-button" type="submit">
                          保存
                        </button>
                      </form>
                    </td>
                    <td>
                      <time dateTime={message.createdAt.toISOString()}>
                        {formatAdminDate(message.createdAt)}
                      </time>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <details className="admin-details">
                          <summary>查看详情</summary>
                          <div className="admin-message-details">
                            <p>
                              <strong>公司：</strong>
                              {message.company ?? '未填写'}
                            </p>
                            <p>
                              <strong>预算：</strong>
                              {message.budget ?? '未填写'}
                            </p>
                            <p>
                              <strong>期望时间：</strong>
                              {message.timeline ?? '未填写'}
                            </p>
                            <p>
                              <strong>需求：</strong>
                              {message.message}
                            </p>
                            <a className="admin-secondary-button" href={`mailto:${message.email}`}>
                              邮件回复
                            </a>
                          </div>
                        </details>
                        <AdminDeleteForm
                          action={deleteAdminMessage}
                          id={message.id}
                          resourceLabel={`来自 ${message.name} 的咨询`}
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
          itemCount={messages.length}
          page={query.page}
          pathname="/admin/messages"
          search={query.search}
        />
      </section>
    </>
  );
}

function getMessageStatusValue(
  status: MessageStatus,
): 'archived' | 'completed' | 'processing' | 'unread' {
  if (status === MessageStatus.ARCHIVED) {
    return 'archived';
  }

  if (status === MessageStatus.COMPLETED) {
    return 'completed';
  }

  return status === MessageStatus.PROCESSING ? 'processing' : 'unread';
}
