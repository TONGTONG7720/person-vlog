import { createAiPromptVersion, updateAiPromptEnabled } from '@/actions/admin/ai-settings';
import { formatAdminDate } from '@/components/admin/admin-page-primitives';
import type { AiCenterData } from '@/server/ai/queries';

type AiPromptManagerProps = Readonly<{
  readonly prompts: AiCenterData['prompts'];
}>;

export function AiPromptManager({ prompts }: AiPromptManagerProps): React.JSX.Element {
  return (
    <div className="ai-prompt-layout">
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">PROMPT VERSION</p>
            <h2>新增 Agent 指令版本</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <p className="admin-inline-note">
            基础安全规则固定在服务端。这里的内容只补充经管理员审核的 Agent 工作说明。
          </p>
          <form action={createAiPromptVersion} className="admin-resource-form">
            <label>
              Agent 名称
              <select defaultValue="lead-agent" name="name">
                <option value="lead-agent">lead-agent</option>
                <option value="proposal-agent">proposal-agent</option>
                <option value="content-agent">content-agent</option>
                <option value="knowledge-agent">knowledge-agent</option>
                <option value="project-agent">project-agent</option>
                <option value="meeting-agent">meeting-agent</option>
              </select>
            </label>
            <label>
              管理员审核的补充指令
              <textarea name="content" required rows={8} />
            </label>
            <button className="admin-primary-button" type="submit">
              保存新版本
            </button>
          </form>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">ACTIVE PROMPTS</p>
            <h2>Prompt 版本记录</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          {prompts.length === 0 ? (
            <p className="admin-empty-state">没有保存的 Prompt。服务端仍会使用内置安全规则。</p>
          ) : (
            <ul className="ai-prompt-list">
              {prompts.map((prompt) => (
                <li key={prompt.id}>
                  <div>
                    <strong>
                      {prompt.name} / v{prompt.version}
                    </strong>
                    <p>{prompt.content}</p>
                    <time dateTime={prompt.createdAt.toISOString()}>
                      {formatAdminDate(prompt.createdAt)}
                    </time>
                  </div>
                  <form action={updateAiPromptEnabled} className="ai-inline-toggle">
                    <input name="id" type="hidden" value={prompt.id} />
                    <label>
                      <input defaultChecked={prompt.enabled} name="enabled" type="checkbox" />
                      启用
                    </label>
                    <button className="admin-secondary-button" type="submit">
                      保存
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
