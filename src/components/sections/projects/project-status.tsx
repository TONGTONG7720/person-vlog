import { getProjectLabels } from '@/config/project';
import type { Locale } from '@/types/i18n';
import type { ProjectStatus as ProjectStatusType } from '@/types/project';

export type ProjectStatusProps = Readonly<{
  locale: Locale;
  status: ProjectStatusType;
}>;

export function ProjectStatus({ locale, status }: ProjectStatusProps): React.JSX.Element {
  return (
    <span className="projects-feature-status" data-status={status}>
      <span aria-hidden="true" className="projects-feature-status-dot" />
      {getProjectLabels(locale).status[status]}
    </span>
  );
}
