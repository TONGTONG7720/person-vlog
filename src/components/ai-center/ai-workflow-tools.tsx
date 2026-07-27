import {
  runAiContentDraft,
  runAiKnowledgeDraft,
  runAiLeadAnalysis,
  runAiMeetingSummary,
  runAiProjectPlan,
  runAiProposalDraft,
} from '@/actions/admin/ai-workflows';
import type { AiCenterData } from '@/server/ai/queries';

type AiWorkflowToolsProps = Readonly<{
  readonly leads: AiCenterData['leads'];
  readonly projects: AiCenterData['projects'];
}>;

export function AiWorkflowTools({ leads, projects }: AiWorkflowToolsProps): React.JSX.Element {
  return (
    <section aria-labelledby="ai-tools-title" className="ai-workflow-tools">
      <div className="ai-section-heading">
        <p className="admin-kicker">AI TOOLS</p>
        <h2 id="ai-tools-title">生成待审核草稿</h2>
        <p>AI 只提供分析、建议和草稿。报价、周期、发送、发布、签约与最终交付始终由人工决定。</p>
      </div>
      <div className="ai-tool-grid">
        <ToolCard description="分析客户目标、复杂度、服务建议和待确认问题。" title="分析客户需求">
          <form action={runAiLeadAnalysis} className="admin-resource-form">
            <LeadSelect leads={leads} name="leadId" />
            <button className="admin-primary-button" type="submit">
              生成需求分析
            </button>
          </form>
        </ToolCard>
        <ToolCard description="按服务方向生成仅供人工审核的初版技术方案。" title="生成项目方案">
          <form action={runAiProposalDraft} className="admin-resource-form">
            <LeadSelect leads={leads} name="leadId" />
            <button className="admin-primary-button" type="submit">
              生成方案草稿
            </button>
          </form>
        </ToolCard>
        <ToolCard
          description="生成标题、大纲、SEO 描述与社交内容方向；不会自动发布。"
          title="内容辅助生产"
        >
          <form action={runAiContentDraft} className="admin-resource-form">
            <label>
              内容主题
              <input name="topic" placeholder="例如：企业 RAG 知识库的资料治理" required />
            </label>
            <button className="admin-primary-button" type="submit">
              生成内容草稿
            </button>
          </form>
        </ToolCard>
        <ToolCard
          description="把会议记录整理为客户目标、确认项、待确认项和下一步行动。"
          title="总结会议记录"
        >
          <form action={runAiMeetingSummary} className="admin-resource-form">
            <LeadSelect allowEmpty leads={leads} name="leadId" />
            <label>
              会议记录
              <textarea name="content" placeholder="粘贴经过人工整理的会议记录" required rows={5} />
            </label>
            <button className="admin-primary-button" type="submit">
              生成会议总结
            </button>
          </form>
        </ToolCard>
        <ToolCard
          description="按现有客户项目生成任务建议；确认后才会创建 CRM 任务。"
          title="生成项目计划"
        >
          <form action={runAiProjectPlan} className="admin-resource-form">
            <ProjectSelect projects={projects} />
            <button className="admin-primary-button" type="submit">
              生成任务建议
            </button>
          </form>
        </ToolCard>
        <ToolCard
          description="从客户项目生成未启用的知识草稿，管理员审核后才能供网站助手使用。"
          title="维护知识库"
        >
          <form action={runAiKnowledgeDraft} className="admin-resource-form">
            <ProjectSelect projects={projects} />
            <button className="admin-primary-button" type="submit">
              生成知识草稿
            </button>
          </form>
        </ToolCard>
      </div>
    </section>
  );
}

function ToolCard({
  children,
  description,
  title,
}: Readonly<{
  readonly children: React.ReactNode;
  readonly description: string;
  readonly title: string;
}>): React.JSX.Element {
  return (
    <article className="admin-panel ai-tool-card">
      <div className="admin-panel-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="admin-panel-body">{children}</div>
    </article>
  );
}

function LeadSelect({
  allowEmpty = false,
  leads,
  name,
}: Readonly<{
  readonly allowEmpty?: boolean;
  readonly leads: AiCenterData['leads'];
  readonly name: string;
}>): React.JSX.Element {
  return (
    <label>
      CRM 线索
      <select defaultValue="" name={name} required={!allowEmpty}>
        <option disabled={!allowEmpty} value="">
          {allowEmpty ? '不关联具体线索' : '请选择线索'}
        </option>
        {leads.map((lead) => (
          <option key={lead.id} value={lead.id}>
            {lead.name} {lead.service === null ? '' : `— ${lead.service}`}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProjectSelect({
  projects,
}: Readonly<{ readonly projects: AiCenterData['projects'] }>): React.JSX.Element {
  return (
    <label>
      客户项目
      <select defaultValue="" name="projectId" required>
        <option disabled value="">
          请选择客户项目
        </option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.title}
          </option>
        ))}
      </select>
    </label>
  );
}
