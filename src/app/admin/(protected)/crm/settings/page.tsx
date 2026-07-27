import { updateCrmAutomationRule } from '@/actions/admin/crm';
import { CrmNavigation } from '@/components/crm/crm-navigation';
import {
  AdminEmptyState,
  AdminFormFeedback,
  AdminPageHeader,
  AdminSetupNotice,
} from '@/components/admin/admin-page-primitives';
import { isCmsDatabaseConfigured } from '@/server/cms/database';
import { isCrmEmailConfigured } from '@/server/crm/email';
import { getCrmAutomationRules } from '@/server/crm/queries';

type CrmSettingsPageProps = Readonly<{
  readonly searchParams: Promise<Readonly<Record<string, string | string[] | undefined>>>;
}>;

const automationRuleCopy = {
  newLeadAdminNotification: {
    description: '新线索写入 CRM 后，向管理员接收邮箱发送一封通知。',
    title: '管理员新线索通知',
  },
  newLeadContactConfirmation: {
    description: '向访客发送已收到咨询的确认邮件，不包含营销或重复触达内容。',
    title: '访客咨询确认',
  },
  newLeadFollowUp: {
    description: '为新线索创建一项 24 小时后的内部跟进任务，不自动发送催促邮件。',
    title: '24 小时内部跟进提醒',
  },
} as const;

function getAutomationRuleCopy(
  name: string,
): Readonly<{ readonly description: string; readonly title: string }> {
  switch (name) {
    case 'new-lead-admin-notification':
      return automationRuleCopy.newLeadAdminNotification;
    case 'new-lead-contact-confirmation':
      return automationRuleCopy.newLeadContactConfirmation;
    case 'new-lead-follow-up':
      return automationRuleCopy.newLeadFollowUp;
    default:
      return { description: '用于 CRM 跟进流程的自动化规则。', title: name };
  }
}

export default async function CrmSettingsPage({
  searchParams,
}: CrmSettingsPageProps): Promise<React.JSX.Element> {
  const [rules, databaseConfigured, query] = await Promise.all([
    getCrmAutomationRules(),
    Promise.resolve(isCmsDatabaseConfigured()),
    searchParams,
  ]);
  const emailConfigured = isCrmEmailConfigured();

  return (
    <>
      <AdminPageHeader
        description="首期自动化仅负责确认、通知和一次内部提醒，确保获客流程有节奏但不会打扰访客。"
        eyebrow="CRM / AUTOMATION"
        title="自动化设置"
      />
      <CrmNavigation current="/admin/crm/settings" />
      <AdminFormFeedback error={query['error']} success={query['success']} />
      {!databaseConfigured ? <AdminSetupNotice /> : null}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">EMAIL DELIVERY</p>
            <h2>邮件发送状态</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          <p className="crm-help-text">
            {emailConfigured
              ? 'Resend 与 CRM 发件人已配置，启用规则后会按设置投递事务邮件。'
              : '尚未配置邮件发送。设置 RESEND_API_KEY、CRM_EMAIL_FROM 与 CONTACT_EMAIL 后，启用的邮件规则才会实际投递。'}
          </p>
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <p className="admin-kicker">RULES</p>
            <h2>新线索规则</h2>
          </div>
        </div>
        <div className="admin-panel-body">
          {rules.length === 0 ? (
            <AdminEmptyState>数据库连接后会自动初始化首期 CRM 规则。</AdminEmptyState>
          ) : (
            <ul className="crm-automation-list">
              {rules.map((rule) => {
                const copy = getAutomationRuleCopy(rule.name);

                return (
                  <li key={rule.id}>
                    <div>
                      <strong>{copy.title}</strong>
                      <p>{copy.description}</p>
                    </div>
                    <form action={updateCrmAutomationRule} className="crm-automation-toggle">
                      <input name="id" type="hidden" value={rule.id} />
                      <label>
                        <input defaultChecked={rule.enabled} name="enabled" type="checkbox" />
                        <span>{rule.enabled ? '已启用' : '已暂停'}</span>
                      </label>
                      <button className="admin-secondary-button" type="submit">
                        保存
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
