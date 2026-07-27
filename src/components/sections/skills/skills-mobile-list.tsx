import { ChevronDown } from 'lucide-react';

import { SkillItem } from '@/components/sections/skills/skill-item';
import type { SkillsUiCopy } from '@/data/skills';
import { cn } from '@/lib/utils';
import type { SkillGroup, SkillLevel } from '@/types/skill';

export type SkillsMobileListProps = Readonly<{
  className?: string;
  groups: readonly SkillGroup[];
  levelLabels: Readonly<Record<SkillLevel, string>>;
  ui: SkillsUiCopy;
}>;

export function SkillsMobileList({
  className,
  groups,
  levelLabels,
  ui,
}: SkillsMobileListProps): React.JSX.Element {
  return (
    <div className={cn('skills-mobile-list', className)}>
      {groups.map((group, index) => (
        <article
          aria-labelledby={`skills-mobile-title-${group.id}`}
          className="skills-mobile-group"
          data-accent={group.accent}
          key={group.id}
        >
          <details open={index === 0}>
            <summary className="skills-mobile-group-summary">
              <span>
                <span className="skills-mobile-group-meta">
                  <span>{group.number}</span>
                  <span>{group.shortTitle}</span>
                </span>
                <span
                  aria-level={3}
                  className="skills-mobile-group-title"
                  id={`skills-mobile-title-${group.id}`}
                  role="heading"
                >
                  {group.title}
                </span>
              </span>
              <ChevronDown aria-hidden="true" className="skills-mobile-group-chevron" size={20} />
            </summary>
            <div className="skills-mobile-group-content">
              <p className="skills-mobile-group-description">{group.description}</p>
              <div className="skills-mobile-group-capabilities">
                <p>{ui.capabilities}</p>
                <ul>
                  {group.capabilities.map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
              </div>
              <div className="skills-mobile-group-skills">
                <p>{ui.technologyScope}</p>
                <ul>
                  {group.skills.map((skill) => (
                    <SkillItem key={skill.id} levelLabels={levelLabels} skill={skill} />
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </article>
      ))}
    </div>
  );
}
