import { Reveal } from '@/components/animation/reveal';
import type { SkillsUiCopy } from '@/data/skills';
import type { SkillsSectionContent } from '@/types/skill';

export type SkillsOverviewProps = Readonly<{
  content: SkillsSectionContent;
  ui: SkillsUiCopy;
}>;

export function SkillsOverview({ content, ui }: SkillsOverviewProps): React.JSX.Element {
  return (
    <Reveal className="skills-overview" distance={16}>
      <p className="skills-overview-title">{content.overviewTitle}</p>
      <ol aria-label={ui.overviewFlowAriaLabel} className="skills-overview-flow">
        {content.flow.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </Reveal>
  );
}
