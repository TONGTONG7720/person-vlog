import {
  crmLeadPriorityLabels,
  crmLeadStatusLabels,
  crmProjectStatusLabels,
  crmProposalStatusLabels,
  crmTaskStatusLabels,
} from '@/types/crm';
import type {
  CrmLeadPriority,
  CrmLeadStatus,
  CrmProjectStatus,
  CrmProposalStatus,
  CrmTaskStatus,
} from '@/types/crm';

export function CrmLeadStatusBadge({
  status,
}: Readonly<{ readonly status: CrmLeadStatus }>): React.JSX.Element {
  return (
    <span className="crm-status-badge" data-status={status}>
      {crmLeadStatusLabels[status]}
    </span>
  );
}

export function CrmPriorityBadge({
  priority,
}: Readonly<{ readonly priority: CrmLeadPriority }>): React.JSX.Element {
  return (
    <span className="crm-priority-badge" data-priority={priority}>
      {crmLeadPriorityLabels[priority]}
    </span>
  );
}

export function CrmTaskStatusBadge({
  status,
}: Readonly<{ readonly status: CrmTaskStatus }>): React.JSX.Element {
  return (
    <span className="crm-status-badge" data-status={status}>
      {crmTaskStatusLabels[status]}
    </span>
  );
}

export function CrmProjectStatusBadge({
  status,
}: Readonly<{ readonly status: CrmProjectStatus }>): React.JSX.Element {
  return (
    <span className="crm-status-badge" data-status={status}>
      {crmProjectStatusLabels[status]}
    </span>
  );
}

export function CrmProposalStatusBadge({
  status,
}: Readonly<{ readonly status: CrmProposalStatus }>): React.JSX.Element {
  return (
    <span className="crm-status-badge" data-status={status}>
      {crmProposalStatusLabels[status]}
    </span>
  );
}
