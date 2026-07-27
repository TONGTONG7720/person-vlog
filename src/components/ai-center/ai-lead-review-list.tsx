import Link from 'next/link';

import { runAiLeadAnalysis } from '@/actions/admin/ai-workflows';
import type { AiCenterData } from '@/server/ai/queries';

type AiLeadReviewListProps = Readonly<{
  readonly leads: AiCenterData['leads'];
}>;

export function AiLeadReviewList({ leads }: AiLeadReviewListProps): React.JSX.Element {
  return (
    <section className="admin-panel ai-lead-review-panel">
      <div className="admin-panel-header">
        <div>
          <p className="admin-kicker">CRM / AI ANALYSIS</p>
          <h2>待人工确认的需求分析</h2>
        </div>
        <Link className="admin-secondary-button" href="/admin/crm/leads">
          查看 CRM
        </Link>
      </div>
      <div className="admin-panel-body">
        {leads.length === 0 ? (
          <p className="admin-empty-state">CRM 暂无可分析的线索。</p>
        ) : (
          <ul className="ai-lead-review-list">
            {leads.map((lead) => (
              <li key={lead.id}>
                <div>
                  <div className="ai-lead-review-heading">
                    <strong>{lead.name}</strong>
                    <span>{lead.service ?? '未指定合作方向'}</span>
                  </div>
                  {lead.aiSummary === null ? (
                    <p>尚未生成 AI 分析。可先生成建议，再由人工确认业务判断。</p>
                  ) : (
                    <>
                      <p>{lead.aiSummary}</p>
                      <dl className="ai-lead-analysis-facts">
                        <div>
                          <dt>分类</dt>
                          <dd>{lead.aiCategory ?? '待确认'}</dd>
                        </div>
                        <div>
                          <dt>复杂度</dt>
                          <dd>{lead.aiDifficulty ?? '待确认'}</dd>
                        </div>
                        <div>
                          <dt>建议服务</dt>
                          <dd>{lead.aiSuggestedService ?? '待确认'}</dd>
                        </div>
                      </dl>
                      {lead.aiQuestions.length === 0 ? null : (
                        <ul className="ai-lead-question-list">
                          {lead.aiQuestions.map((question) => (
                            <li key={question}>待确认：{question}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
                <div className="ai-lead-review-actions">
                  <form action={runAiLeadAnalysis}>
                    <input name="leadId" type="hidden" value={lead.id} />
                    <button className="admin-secondary-button" type="submit">
                      {lead.aiSummary === null ? '生成分析' : '重新分析'}
                    </button>
                  </form>
                  <Link className="admin-secondary-button" href={`/admin/crm/leads/${lead.id}`}>
                    查看线索
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
