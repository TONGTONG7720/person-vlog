import type { SkillItem as SkillItemData } from '@/types/skill';
import type { SkillLevel } from '@/types/skill';

export type SkillItemProps = Readonly<{
  skill: SkillItemData;
  levelLabels: Readonly<Record<SkillLevel, string>>;
  showDescription?: boolean;
}>;

export function SkillItem({
  levelLabels,
  showDescription = false,
  skill,
}: SkillItemProps): React.JSX.Element {
  return (
    <li className="skills-skill-item">
      <div className="skills-skill-item-heading">
        <span className="skills-skill-item-name" translate="no">
          {skill.name}
        </span>
        <span className="skills-skill-level" data-level={skill.level}>
          {levelLabels[skill.level]}
        </span>
      </div>
      {showDescription ? (
        <p className="skills-skill-item-description">{skill.description}</p>
      ) : null}
    </li>
  );
}
