import type { ReactNode } from 'react';
import { Resend } from 'resend';

import { ContactReceivedEmail } from '@/emails/contact-received';
import { LeadCreatedEmail } from '@/emails/lead-created';
import { ProjectUpdateEmail } from '@/emails/project-update';
import { logger } from '@/lib/logger';

type CrmEmailConfiguration = Readonly<{
  readonly apiKey: string;
  readonly from: string;
}>;

type EmailDeliveryResult = 'failed' | 'sent' | 'skipped';

type SendCrmEmailInput = Readonly<{
  readonly category: 'admin_notification' | 'contact_confirmation' | 'project_update';
  readonly content: ReactNode;
  readonly subject: string;
  readonly to: string;
}>;

export type NewLeadNotificationInput = Readonly<{
  readonly budget?: string;
  readonly company?: string;
  readonly email: string;
  readonly leadId: string;
  readonly name: string;
  readonly sendAdminNotification: boolean;
  readonly sendContactConfirmation: boolean;
  readonly service?: string;
  readonly source?: string;
}>;

export type NewLeadNotificationResult = Readonly<{
  readonly admin: EmailDeliveryResult;
  readonly contact: EmailDeliveryResult;
}>;

export function isCrmEmailConfigured(): boolean {
  return getCrmEmailConfiguration() !== undefined;
}

export async function sendNewLeadNotifications(
  input: NewLeadNotificationInput,
): Promise<NewLeadNotificationResult> {
  const adminRecipient = process.env['CONTACT_EMAIL']?.trim();
  const contact = input.sendContactConfirmation
    ? sendCrmEmail({
        category: 'contact_confirmation',
        content: LeadCreatedEmail({
          name: input.name,
          ...(input.service === undefined ? {} : { service: input.service }),
        }),
        subject: '已收到你的合作咨询',
        to: input.email,
      })
    : Promise.resolve<EmailDeliveryResult>('skipped');
  const admin =
    input.sendAdminNotification && adminRecipient !== undefined && adminRecipient !== ''
      ? sendCrmEmail({
          category: 'admin_notification',
          content: ContactReceivedEmail({
            email: input.email,
            leadId: input.leadId,
            name: input.name,
            ...(input.budget === undefined ? {} : { budget: input.budget }),
            ...(input.company === undefined ? {} : { company: input.company }),
            ...(input.service === undefined ? {} : { service: input.service }),
            ...(input.source === undefined ? {} : { source: input.source }),
          }),
          subject: `新的合作线索：${input.name}`,
          to: adminRecipient,
        })
      : Promise.resolve<EmailDeliveryResult>('skipped');
  const [contactResult, adminResult] = await Promise.all([contact, admin]);

  return { admin: adminResult, contact: contactResult };
}

export async function sendProjectUpdateNotification(
  input: Readonly<{
    readonly email: string;
    readonly name: string;
    readonly projectTitle: string;
    readonly statusLabel: string;
  }>,
): Promise<EmailDeliveryResult> {
  return sendCrmEmail({
    category: 'project_update',
    content: ProjectUpdateEmail({
      name: input.name,
      projectTitle: input.projectTitle,
      statusLabel: input.statusLabel,
    }),
    subject: `项目进度更新：${input.projectTitle}`,
    to: input.email,
  });
}

async function sendCrmEmail(input: SendCrmEmailInput): Promise<EmailDeliveryResult> {
  const configuration = getCrmEmailConfiguration();

  if (configuration === undefined) {
    return 'skipped';
  }

  try {
    const resend = new Resend(configuration.apiKey);
    const result = await resend.emails.send({
      from: configuration.from,
      react: input.content,
      subject: input.subject,
      to: input.to,
    });

    if (result.error !== null) {
      logger.warn('crm.email.delivery_failed', { category: input.category });

      return 'failed';
    }

    logger.info('crm.email.delivery_completed', { category: input.category });

    return 'sent';
  } catch (error) {
    if (error instanceof Error) {
      logger.warn('crm.email.delivery_failed', {
        category: input.category,
        errorName: error.name,
      });

      return 'failed';
    }

    throw error;
  }
}

function getCrmEmailConfiguration(): CrmEmailConfiguration | undefined {
  const apiKey = process.env['RESEND_API_KEY']?.trim();
  const from = process.env['CRM_EMAIL_FROM']?.trim();

  if (apiKey === undefined || apiKey === '' || from === undefined || from === '') {
    return undefined;
  }

  return { apiKey, from };
}
