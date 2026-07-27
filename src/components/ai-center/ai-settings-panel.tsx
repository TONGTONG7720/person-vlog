import {
  saveAiModelConfig,
  updateAiModelEnabled,
  updateAiNotificationChannel,
} from '@/actions/admin/ai-settings';
import type { AiCenterData } from '@/server/ai/queries';

type AiSettingsPanelProps = Readonly<{
  readonly modelConfigs: AiCenterData['modelConfigs'];
  readonly notificationChannels: AiCenterData['notificationChannels'];
}>;

const channelLabels: Readonly<Record<string, string>> = {
  EMAIL: 'Email',
  TELEGRAM: 'Telegram（预留）',
  WECHAT: '微信（预留）',
};

export function AiSettingsPanel({
  modelConfigs,
  notificationChannels,
}: AiSettingsPanelProps): React.JSX.Element {
  return (
    <div className="ai-settings-layout">
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">MODEL CONFIG</p>
            <h2>模型与 Token 上限</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <p className="admin-inline-note">
            API Key 始终只从服务端环境变量读取，不会保存到数据库或显示在后台。
          </p>
          <form action={saveAiModelConfig} className="admin-resource-form">
            <div className="admin-field-grid">
              <label>
                Provider
                <select defaultValue="local" name="provider">
                  <option value="local">OpenAI Compatible</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Gemini</option>
                </select>
              </label>
              <label>
                模型名称
                <input name="model" placeholder="例如：gpt-5.6-luna" required />
              </label>
              <label>
                优先级
                <input defaultValue="100" min="1" name="priority" required type="number" />
              </label>
              <label>
                单次最大 Token
                <input defaultValue="1200" min="128" name="maxTokens" required type="number" />
              </label>
              <label>
                每日 Token 上限（可选）
                <input min="1000" name="dailyLimit" type="number" />
              </label>
              <label>
                每月 Token 上限（可选）
                <input min="1000" name="monthlyLimit" type="number" />
              </label>
            </div>
            <button className="admin-primary-button" type="submit">
              保存模型配置
            </button>
          </form>
          <ModelConfigList modelConfigs={modelConfigs} />
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">NOTIFICATIONS</p>
            <h2>自动通知渠道</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <p className="admin-inline-note">
            Email 复用 CRM 的事务邮件配置；微信和 Telegram 仅保留未来适配位置，不会实际投递。
          </p>
          <ul className="ai-toggle-list">
            {notificationChannels.map((channel) => (
              <li key={channel.id}>
                <span>{channelLabels[channel.type] ?? channel.type}</span>
                <form action={updateAiNotificationChannel} className="ai-inline-toggle">
                  <input name="id" type="hidden" value={channel.id} />
                  <label>
                    <input defaultChecked={channel.enabled} name="enabled" type="checkbox" />
                    启用
                  </label>
                  <button className="admin-secondary-button" type="submit">
                    保存
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function ModelConfigList({
  modelConfigs,
}: Readonly<{ readonly modelConfigs: AiCenterData['modelConfigs'] }>): React.JSX.Element {
  if (modelConfigs.length === 0) {
    return (
      <p className="admin-empty-state">
        尚未保存数据库模型配置，将在环境变量可用时使用运行时模型。
      </p>
    );
  }

  return (
    <ul className="ai-toggle-list">
      {modelConfigs.map((config) => (
        <li key={config.id}>
          <div>
            <strong>{config.model}</strong>
            <span>
              {config.provider} · 优先级 {config.priority} · 单次 {config.maxTokens} Token
            </span>
          </div>
          <form action={updateAiModelEnabled} className="ai-inline-toggle">
            <input name="id" type="hidden" value={config.id} />
            <label>
              <input defaultChecked={config.enabled} name="enabled" type="checkbox" />
              启用
            </label>
            <button className="admin-secondary-button" type="submit">
              保存
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
