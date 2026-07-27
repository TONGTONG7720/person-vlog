import {
  CrmProjectStatus,
  CrmTaskStatus,
  LeadActivityType,
  LeadPriority,
  LeadStatus,
  ProposalStatus,
} from '@/generated/prisma/client';
import type {
  CrmLeadActivityType,
  CrmLeadPriority,
  CrmLeadStatus,
  CrmProjectStatus as CrmProjectStatusValue,
  CrmProposalStatus,
  CrmTaskStatus as CrmTaskStatusValue,
} from '@/types/crm';

export const crmLeadStatusToPrisma = {
  contacted: LeadStatus.CONTACTED,
  discovery: LeadStatus.DISCOVERY,
  lost: LeadStatus.LOST,
  negotiation: LeadStatus.NEGOTIATION,
  new: LeadStatus.NEW,
  proposal: LeadStatus.PROPOSAL,
  won: LeadStatus.WON,
} as const satisfies Readonly<Record<CrmLeadStatus, LeadStatus>>;

export const crmLeadStatusFromPrisma = {
  [LeadStatus.CONTACTED]: 'contacted',
  [LeadStatus.DISCOVERY]: 'discovery',
  [LeadStatus.LOST]: 'lost',
  [LeadStatus.NEGOTIATION]: 'negotiation',
  [LeadStatus.NEW]: 'new',
  [LeadStatus.PROPOSAL]: 'proposal',
  [LeadStatus.WON]: 'won',
} as const satisfies Readonly<Record<LeadStatus, CrmLeadStatus>>;

export const crmLeadPriorityToPrisma = {
  high: LeadPriority.HIGH,
  low: LeadPriority.LOW,
  medium: LeadPriority.MEDIUM,
} as const satisfies Readonly<Record<CrmLeadPriority, LeadPriority>>;

export const crmLeadPriorityFromPrisma = {
  [LeadPriority.HIGH]: 'high',
  [LeadPriority.LOW]: 'low',
  [LeadPriority.MEDIUM]: 'medium',
} as const satisfies Readonly<Record<LeadPriority, CrmLeadPriority>>;

export const crmLeadActivityTypeToPrisma = {
  call: LeadActivityType.CALL,
  email: LeadActivityType.EMAIL,
  meeting: LeadActivityType.MEETING,
  note: LeadActivityType.NOTE,
  status_change: LeadActivityType.STATUS_CHANGE,
} as const satisfies Readonly<Record<CrmLeadActivityType, LeadActivityType>>;

export const crmLeadActivityTypeFromPrisma = {
  [LeadActivityType.CALL]: 'call',
  [LeadActivityType.EMAIL]: 'email',
  [LeadActivityType.MEETING]: 'meeting',
  [LeadActivityType.NOTE]: 'note',
  [LeadActivityType.STATUS_CHANGE]: 'status_change',
} as const satisfies Readonly<Record<LeadActivityType, CrmLeadActivityType>>;

export const crmTaskStatusToPrisma = {
  cancelled: CrmTaskStatus.CANCELLED,
  completed: CrmTaskStatus.COMPLETED,
  in_progress: CrmTaskStatus.IN_PROGRESS,
  todo: CrmTaskStatus.TODO,
} as const satisfies Readonly<Record<CrmTaskStatusValue, CrmTaskStatus>>;

export const crmTaskStatusFromPrisma = {
  [CrmTaskStatus.CANCELLED]: 'cancelled',
  [CrmTaskStatus.COMPLETED]: 'completed',
  [CrmTaskStatus.IN_PROGRESS]: 'in_progress',
  [CrmTaskStatus.TODO]: 'todo',
} as const satisfies Readonly<Record<CrmTaskStatus, CrmTaskStatusValue>>;

export const crmProjectStatusToPrisma = {
  completed: CrmProjectStatus.COMPLETED,
  deploy: CrmProjectStatus.DEPLOY,
  design: CrmProjectStatus.DESIGN,
  development: CrmProjectStatus.DEVELOPMENT,
  planning: CrmProjectStatus.PLANNING,
  testing: CrmProjectStatus.TESTING,
} as const satisfies Readonly<Record<CrmProjectStatusValue, CrmProjectStatus>>;

export const crmProjectStatusFromPrisma = {
  [CrmProjectStatus.COMPLETED]: 'completed',
  [CrmProjectStatus.DEPLOY]: 'deploy',
  [CrmProjectStatus.DESIGN]: 'design',
  [CrmProjectStatus.DEVELOPMENT]: 'development',
  [CrmProjectStatus.PLANNING]: 'planning',
  [CrmProjectStatus.TESTING]: 'testing',
} as const satisfies Readonly<Record<CrmProjectStatus, CrmProjectStatusValue>>;

export const crmProposalStatusToPrisma = {
  accepted: ProposalStatus.ACCEPTED,
  draft: ProposalStatus.DRAFT,
  rejected: ProposalStatus.REJECTED,
  sent: ProposalStatus.SENT,
} as const satisfies Readonly<Record<CrmProposalStatus, ProposalStatus>>;

export const crmProposalStatusFromPrisma = {
  [ProposalStatus.ACCEPTED]: 'accepted',
  [ProposalStatus.DRAFT]: 'draft',
  [ProposalStatus.REJECTED]: 'rejected',
  [ProposalStatus.SENT]: 'sent',
} as const satisfies Readonly<Record<ProposalStatus, CrmProposalStatus>>;
