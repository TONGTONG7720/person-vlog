import {
  AutomationRuleAction,
  AutomationRuleTrigger,
  type PrismaClient,
} from '@/generated/prisma/client';

const defaultCrmAutomationRules = [
  {
    action: AutomationRuleAction.CREATE_FOLLOW_UP_TASK,
    delayHours: 24,
    name: 'new-lead-follow-up',
    trigger: AutomationRuleTrigger.LEAD_CREATED,
  },
  {
    action: AutomationRuleAction.SEND_CONTACT_CONFIRMATION,
    delayHours: 0,
    name: 'new-lead-contact-confirmation',
    trigger: AutomationRuleTrigger.LEAD_CREATED,
  },
  {
    action: AutomationRuleAction.SEND_ADMIN_NOTIFICATION,
    delayHours: 0,
    name: 'new-lead-admin-notification',
    trigger: AutomationRuleTrigger.LEAD_CREATED,
  },
] as const;

export async function ensureCrmAutomationRules(database: PrismaClient): Promise<void> {
  await Promise.all(
    defaultCrmAutomationRules.map(async (rule) => {
      await database.automationRule.upsert({
        create: { ...rule, enabled: true },
        update: {},
        where: { name: rule.name },
      });
    }),
  );
}

export async function getEnabledLeadCreatedAutomationActions(
  database: PrismaClient,
): Promise<readonly AutomationRuleAction[]> {
  await ensureCrmAutomationRules(database);

  const rules = await database.automationRule.findMany({
    select: { action: true },
    where: { enabled: true, trigger: AutomationRuleTrigger.LEAD_CREATED },
  });

  return rules.map((rule) => rule.action);
}

export { defaultCrmAutomationRules };
