import Link from 'next/link';

import { AiDraftReviewList } from '@/components/ai-center/ai-draft-review-list';
import { AiLeadReviewList } from '@/components/ai-center/ai-lead-review-list';
import { AiMetricGrid } from '@/components/ai-center/ai-metric-grid';
import { AiUsageLogList } from '@/components/ai-center/ai-usage-log-list';
import { AiWorkflowTools } from '@/components/ai-center/ai-workflow-tools';
import type { AiCenterData } from '@/server/ai/queries';

type AiCenterDashboardProps = Readonly<{
  readonly data: AiCenterData;
}>;

export function AiCenterDashboard({ data }: AiCenterDashboardProps): React.JSX.Element {
  return (
    <div className="ai-center-dashboard">
      <AiMetricGrid metrics={data.metrics} />
      <AiWorkflowTools leads={data.leads} projects={data.projects} />
      <AiLeadReviewList leads={data.leads} />
      <AiDraftReviewList contentDrafts={data.contentDrafts} projectPlans={data.projectPlans} />
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">USAGE LOGS</p>
            <h2>最近调用</h2>
          </div>
          <Link className="admin-secondary-button" href="/admin/ai/logs">
            查看全部日志
          </Link>
        </div>
        <div className="admin-panel-body">
          <AiUsageLogList logs={data.logs} />
        </div>
      </section>
    </div>
  );
}
