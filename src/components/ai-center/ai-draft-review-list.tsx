import Link from 'next/link';

import { approveAiProjectPlan, createBlogDraftFromAiContent } from '@/actions/admin/ai-workflows';
import { formatAdminDate } from '@/components/admin/admin-page-primitives';
import type { AiCenterData } from '@/server/ai/queries';

type AiDraftReviewListProps = Readonly<{
  readonly contentDrafts: AiCenterData['contentDrafts'];
  readonly projectPlans: AiCenterData['projectPlans'];
}>;

export function AiDraftReviewList({
  contentDrafts,
  projectPlans,
}: AiDraftReviewListProps): React.JSX.Element {
  return (
    <section className="ai-review-grid">
      <article className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">CONTENT DRAFTS</p>
            <h2>待编辑内容</h2>
          </div>
          <Link className="admin-secondary-button" href="/admin/growth">
            前往内容增长
          </Link>
        </div>
        <div className="admin-panel-body">
          {contentDrafts.length === 0 ? (
            <p className="admin-empty-state">没有待审核内容草稿。</p>
          ) : (
            <ul className="ai-review-list">
              {contentDrafts.map((draft) => (
                <li key={draft.id}>
                  <div>
                    <strong>{draft.title}</strong>
                    <span>{draft.topic}</span>
                  </div>
                  <time dateTime={draft.createdAt.toISOString()}>
                    {formatAdminDate(draft.createdAt)}
                  </time>
                  {draft.status === 'DRAFT' ? (
                    <form action={createBlogDraftFromAiContent}>
                      <input name="id" type="hidden" value={draft.id} />
                      <button className="admin-secondary-button" type="submit">
                        转为博客草稿
                      </button>
                    </form>
                  ) : (
                    <span className="admin-status-badge">已交给编辑</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>

      <article className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">PROJECT PLANS</p>
            <h2>待确认任务计划</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          {projectPlans.length === 0 ? (
            <p className="admin-empty-state">没有待确认的项目任务建议。</p>
          ) : (
            <ul className="ai-plan-list">
              {projectPlans.map((plan) => (
                <li key={plan.id}>
                  <div>
                    <strong>{plan.projectTitle}</strong>
                    <p>{plan.summary}</p>
                    <ol>
                      {plan.tasks.map((task, index) => (
                        <li key={`${plan.id}-${task}`}>{`${index + 1}. ${task}`}</li>
                      ))}
                    </ol>
                  </div>
                  {plan.status === 'DRAFT' ? (
                    <form action={approveAiProjectPlan}>
                      <input name="id" type="hidden" value={plan.id} />
                      <button className="admin-primary-button" type="submit">
                        确认并创建任务
                      </button>
                    </form>
                  ) : (
                    <span className="admin-status-badge">已确认</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </section>
  );
}
