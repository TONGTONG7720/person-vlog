import {
  AutomationRuleAction,
  CrmTaskStatus,
  LeadActivityType,
  LeadPriority,
  LeadStatus,
  type PrismaClient,
} from '@/generated/prisma/client';
import { logger } from '@/lib/logger';
import { scheduleLeadWorkflow } from '@/ai/workflows/lead-workflow';
import { getEnabledLeadCreatedAutomationActions } from '@/server/crm/automation';
import { sendNewLeadNotifications } from '@/server/crm/email';
import { calculateLeadScore, createLeadTags, inferLeadPriority } from '@/server/crm/lead-scoring';
import type { ContactFormData } from '@/types/contact';
import type { CrmLeadPriority } from '@/types/crm';

const leadPriorityByValue = {
  high: LeadPriority.HIGH,
  low: LeadPriority.LOW,
  medium: LeadPriority.MEDIUM,
} as const satisfies Readonly<Record<CrmLeadPriority, LeadPriority>>;

export type ContactLeadCreationResult = Readonly<{
  readonly leadId: string;
}>;

export async function createCrmLeadFromContact(
  database: PrismaClient,
  submission: ContactFormData,
): Promise<ContactLeadCreationResult> {
  const automationActions = await getEnabledLeadCreatedAutomationActions(database);
  const shouldCreateFollowUpTask = automationActions.includes(
    AutomationRuleAction.CREATE_FOLLOW_UP_TASK,
  );
  const score = calculateLeadScore(submission);
  const priority = inferLeadPriority(score);
  const tags = createLeadTags(submission);
  const followUpScheduledAt = shouldCreateFollowUpTask
    ? new Date(Date.now() + 24 * 60 * 60 * 1_000)
    : undefined;

  const lead = await database.$transaction(async (transaction) => {
    const message = await transaction.message.create({
      data: {
        budget: submission.budget ?? null,
        company: submission.company ?? null,
        email: submission.email,
        message: submission.message,
        name: submission.name,
        service: submission.service,
        timeline: submission.timeline ?? null,
      },
    });
    const createdLead = await transaction.lead.create({
      data: {
        budget: submission.budget ?? null,
        company: submission.company ?? null,
        email: submission.email,
        followUpScheduledAt: followUpScheduledAt ?? null,
        messageId: message.id,
        name: submission.name,
        priority: leadPriorityByValue[priority],
        score,
        service: submission.service,
        source: submission.source ?? null,
        status: LeadStatus.NEW,
        tags: [...tags],
        timeline: submission.timeline ?? null,
      },
    });

    await transaction.leadActivity.create({
      data: {
        content: '通过官网联系表单创建线索',
        leadId: createdLead.id,
        type: LeadActivityType.STATUS_CHANGE,
      },
    });

    if (followUpScheduledAt !== undefined) {
      await transaction.crmTask.create({
        data: {
          dueDate: followUpScheduledAt,
          leadId: createdLead.id,
          status: CrmTaskStatus.TODO,
          title: `跟进新线索：${submission.name}`,
        },
      });
    }

    return createdLead;
  });

  const emailResults = await sendNewLeadNotifications({
    email: submission.email,
    leadId: lead.id,
    name: submission.name,
    sendAdminNotification: automationActions.includes(AutomationRuleAction.SEND_ADMIN_NOTIFICATION),
    sendContactConfirmation: automationActions.includes(
      AutomationRuleAction.SEND_CONTACT_CONFIRMATION,
    ),
    ...(submission.budget === undefined ? {} : { budget: submission.budget }),
    ...(submission.company === undefined ? {} : { company: submission.company }),
    ...(submission.service === undefined ? {} : { service: submission.service }),
    ...(submission.source === undefined ? {} : { source: submission.source }),
  });

  await recordEmailActivities(database, lead.id, emailResults);
  scheduleLeadWorkflow(database, lead.id);

  return { leadId: lead.id };
}

async function recordEmailActivities(
  database: PrismaClient,
  leadId: string,
  results: Awaited<ReturnType<typeof sendNewLeadNotifications>>,
): Promise<void> {
  const activityData = [
    ...(results.contact === 'sent'
      ? [
          {
            content: '已向客户发送咨询确认邮件',
            leadId,
            type: LeadActivityType.EMAIL,
          },
        ]
      : []),
    ...(results.admin === 'sent'
      ? [
          {
            content: '已向管理员发送新线索通知',
            leadId,
            type: LeadActivityType.EMAIL,
          },
        ]
      : []),
  ];

  if (activityData.length === 0) {
    return;
  }

  try {
    await database.leadActivity.createMany({ data: activityData });
  } catch (error) {
    if (error instanceof Error) {
      logger.warn('crm.email_activity.persistence_failed', { errorName: error.name, leadId });

      return;
    }

    throw error;
  }
}
