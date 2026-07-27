'use client';

import { Check, LoaderCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ApprovalDecision = 'approve' | 'reject';

type AiApprovalActionsProps = Readonly<{
  readonly approvalId: string;
  readonly organizationSlug: string;
}>;

export function AiApprovalActions({
  approvalId,
  organizationSlug,
}: AiApprovalActionsProps): React.JSX.Element {
  const router = useRouter();
  const [pendingDecision, setPendingDecision] = useState<ApprovalDecision | undefined>();
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  async function resolveApproval(decision: ApprovalDecision): Promise<void> {
    if (
      decision === 'reject' &&
      !window.confirm('拒绝后将结束此任务。不会执行任何外部业务写入，确定继续吗？')
    ) {
      return;
    }

    setPendingDecision(decision);
    setStatusMessage(undefined);

    try {
      const response = await fetch(
        `/api/v1/agent/approvals/${encodeURIComponent(approvalId)}?organization=${encodeURIComponent(organizationSlug)}`,
        {
          body: JSON.stringify({ decision }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        },
      );

      if (!response.ok) {
        setStatusMessage('审批未能更新，请确认管理权限后重试。');
        return;
      }

      setStatusMessage(
        decision === 'approve'
          ? '审批已记录。当前未配置外部业务工具，因此不会执行外部写入。'
          : '已拒绝该 AIOS 操作。',
      );
      router.refresh();
    } catch (error) {
      if (error instanceof TypeError) {
        setStatusMessage('网络连接不可用，请稍后重试。');
        return;
      }

      throw error;
    } finally {
      setPendingDecision(undefined);
    }
  }

  return (
    <div className="aios-approval-actions">
      <div>
        <button
          className="saas-primary-button"
          disabled={pendingDecision !== undefined}
          onClick={() => void resolveApproval('approve')}
          type="button"
        >
          {pendingDecision === 'approve' ? (
            <LoaderCircle aria-hidden="true" className="saas-inline-spinner" size={15} />
          ) : (
            <Check aria-hidden="true" size={15} />
          )}
          <span>批准</span>
        </button>
        <button
          className="saas-secondary-button"
          disabled={pendingDecision !== undefined}
          onClick={() => void resolveApproval('reject')}
          type="button"
        >
          {pendingDecision === 'reject' ? (
            <LoaderCircle aria-hidden="true" className="saas-inline-spinner" size={15} />
          ) : (
            <X aria-hidden="true" size={15} />
          )}
          <span>拒绝</span>
        </button>
      </div>
      {statusMessage === undefined ? null : (
        <p aria-live="polite" className="aios-inline-message" role="status">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
