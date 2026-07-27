import { ArrowUpRight } from 'lucide-react';
import type { KeyboardEvent, Ref } from 'react';

import type { SkillGroup } from '@/types/skill';
import type { SkillsUiCopy } from '@/data/skills';

export type SkillGroupCardProps = Readonly<{
  buttonRef: Ref<HTMLButtonElement>;
  group: SkillGroup;
  labels: SkillsUiCopy;
  isActive: boolean;
  onActivate: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}>;

export function SkillGroupCard({
  buttonRef,
  group,
  labels,
  isActive,
  onActivate,
  onKeyDown,
}: SkillGroupCardProps): React.JSX.Element {
  return (
    <button
      aria-controls={`skills-panel-${group.id}`}
      aria-selected={isActive}
      className="skills-group-card"
      data-accent={group.accent}
      data-state={isActive ? 'active' : 'inactive'}
      id={`skills-tab-${group.id}`}
      onClick={onActivate}
      onFocus={onActivate}
      onKeyDown={onKeyDown}
      ref={buttonRef}
      role="tab"
      tabIndex={isActive ? 0 : -1}
      type="button"
    >
      <span className="skills-group-card-topline">
        <span className="skills-group-card-number">{group.number}</span>
        <span className="skills-group-card-status">
          <span aria-hidden="true" className="skills-group-card-status-dot" />
          {isActive ? labels.active : labels.module}
        </span>
      </span>
      <span className="skills-group-card-title-row">
        <span aria-level={3} className="skills-group-card-title" role="heading">
          {group.title}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="skills-group-card-arrow"
          size={20}
          strokeWidth={1.5}
        />
      </span>
      <span className="skills-group-card-footer">
        <span className="skills-group-card-count">
          {group.skills.length} {labels.countSuffix}
        </span>
      </span>
    </button>
  );
}
