import {
  contentCategoryLabels,
  contentPlanPriorityLabels,
  contentPlanStatusLabels,
  normalizeContentCategory,
  normalizeContentPlanPriority,
  normalizeContentPlanStatus,
} from '@/config/content';
import type { AdminContentPlanItem } from '@/server/cms/content-growth-queries';

type ContentCalendarProps = Readonly<{
  readonly plans: readonly AdminContentPlanItem[];
}>;

export function ContentCalendar({ plans }: ContentCalendarProps): React.JSX.Element {
  const scheduledPlans = plans.filter((plan) => plan.publishDate !== null);

  if (scheduledPlans.length === 0) {
    return (
      <p className="admin-empty-state">
        还没有排期内容。先把一个选题放到日历中，建立稳定更新节奏。
      </p>
    );
  }

  return (
    <ol aria-label="内容日历" className="content-calendar">
      {scheduledPlans.map((plan) => {
        const category = normalizeContentCategory(plan.category);
        const status = normalizeContentPlanStatus(plan.status);
        const priority = normalizeContentPlanPriority(plan.priority);

        return (
          <li className="content-calendar-item" data-priority={priority} key={plan.id}>
            <time dateTime={plan.publishDate?.toISOString()}>
              {formatCalendarDate(plan.publishDate)}
            </time>
            <div>
              <strong>{plan.title}</strong>
              <p>
                {contentCategoryLabels[category]} · {contentPlanStatusLabels[status]} ·{' '}
                {contentPlanPriorityLabels[priority]}
              </p>
              {plan.keyword === null ? null : <span>{plan.keyword}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function formatCalendarDate(value: Date | null): string {
  if (value === null) {
    return '未排期';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    day: 'numeric',
    month: 'short',
  }).format(value);
}
