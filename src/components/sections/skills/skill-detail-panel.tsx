'use client';

import { motion } from 'framer-motion';

import { SkillItem } from '@/components/sections/skills/skill-item';
import { SkillsSystemMap } from '@/components/sections/skills/skills-system-map';
import { useMotionPreference } from '@/components/providers/motion-provider';
import type { SkillsUiCopy } from '@/data/skills';
import { useMounted } from '@/hooks/use-mounted';
import type { SkillGroup, SkillLevel } from '@/types/skill';

export type SkillDetailPanelProps = Readonly<{
  group: SkillGroup;
  levelLabels: Readonly<Record<SkillLevel, string>>;
  ui: SkillsUiCopy;
}>;

export function SkillDetailPanel({
  group,
  levelLabels,
  ui,
}: SkillDetailPanelProps): React.JSX.Element {
  const hasMounted = useMounted();
  const prefersReducedMotion = useMotionPreference();
  const duration = prefersReducedMotion ? 0 : 0.36;
  const shouldAnimate = hasMounted && !prefersReducedMotion;

  return (
    <div
      aria-labelledby={`skills-tab-${group.id}`}
      className="skills-detail-panel"
      data-accent={group.accent}
      id={`skills-panel-${group.id}`}
      role="tabpanel"
      tabIndex={0}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="skills-detail-panel-content"
        initial={shouldAnimate ? { opacity: 0, y: 8 } : false}
        key={group.id}
        transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="skills-detail-panel-header">
          <div>
            <p className="skills-detail-panel-meta">
              <span>{group.number}</span>
              <span>{group.shortTitle}</span>
            </p>
            <h3>{group.title}</h3>
          </div>
          <span className="skills-detail-panel-active">{ui.active}</span>
        </div>
        <p className="skills-detail-panel-description">{group.description}</p>
        <div className="skills-detail-panel-capabilities">
          <p>{ui.capabilities}</p>
          <ul>
            {group.capabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        </div>
        <SkillsSystemMap group={group} ui={ui} />
        <div className="skills-detail-panel-skills">
          <p>{ui.technologyScope}</p>
          <ul>
            {group.skills.map((skill) => (
              <SkillItem key={skill.id} levelLabels={levelLabels} showDescription skill={skill} />
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
