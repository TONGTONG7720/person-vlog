import { SkillsClosing } from '@/components/sections/skills/skills-closing';
import { SkillsDesktopExplorer } from '@/components/sections/skills/skills-desktop-explorer';
import { SkillsHashAnchor } from '@/components/sections/skills/skills-hash-anchor';
import { SkillsMobileList } from '@/components/sections/skills/skills-mobile-list';
import { SkillsOverview } from '@/components/sections/skills/skills-overview';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/typography/section-heading';
import {
  getSkillGroups,
  getSkillLevelLabels,
  getSkillsSectionContent,
  getSkillsUiCopy,
} from '@/data/skills';
import { getRequestLocale } from '@/i18n/server';

export async function SkillsSection(): Promise<React.JSX.Element> {
  const locale = await getRequestLocale();
  const content = getSkillsSectionContent(locale);
  const groups = getSkillGroups(locale);
  const levelLabels = getSkillLevelLabels(locale);
  const ui = getSkillsUiCopy(locale);

  return (
    <section aria-labelledby="skills-heading" className="skills-section" id="skills">
      <SkillsHashAnchor />
      <Container size="content">
        <div className="skills-intro">
          <SectionHeading
            animated
            description={content.description}
            eyebrow={content.eyebrow}
            id="skills-heading"
            number={content.number}
            size="lg"
            title={content.title}
          />
        </div>
        <SkillsOverview content={content} ui={ui} />
        <SkillsDesktopExplorer groups={groups} levelLabels={levelLabels} ui={ui} />
        <SkillsMobileList groups={groups} levelLabels={levelLabels} ui={ui} />
        <SkillsClosing actionLabel={ui.viewProjects} lines={content.closingLines} />
      </Container>
    </section>
  );
}
