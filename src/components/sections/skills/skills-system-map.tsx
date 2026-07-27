'use client';

import { motion } from 'framer-motion';

import { useMotionPreference } from '@/components/providers/motion-provider';
import type { SkillsUiCopy } from '@/data/skills';
import type { SkillGroup, SkillGroupId } from '@/types/skill';

const systemNodes = [
  { id: 'backend', name: 'BACKEND' },
  { id: 'frontend', name: 'FRONTEND' },
  { id: 'data', name: 'DATA' },
  { id: 'ai', name: 'AI' },
] as const satisfies readonly Readonly<{
  id: SkillGroupId;
  name: string;
}>[];

export type SkillsSystemMapProps = Readonly<{
  group: SkillGroup;
  ui: SkillsUiCopy;
}>;

export function SkillsSystemMap({ group, ui }: SkillsSystemMapProps): React.JSX.Element {
  const prefersReducedMotion = useMotionPreference();
  const transition = {
    duration: prefersReducedMotion ? 0 : 0.36,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  return (
    <div aria-hidden="true" className="skills-system-map" data-active-group={group.id}>
      <svg className="skills-system-map-connections" viewBox="0 0 320 220">
        <path
          className="skills-system-map-connection"
          data-connection="backend"
          d="M160 112L160 44"
        />
        <path
          className="skills-system-map-connection"
          data-connection="frontend"
          d="M160 112L272 112"
        />
        <path
          className="skills-system-map-connection"
          data-connection="data"
          d="M160 112L160 178"
        />
        <path className="skills-system-map-connection" data-connection="ai" d="M160 112L48 112" />
      </svg>
      <motion.span className="skills-system-map-product" transition={transition}>
        <span>PRODUCT</span>
        <small>{ui.productLabel}</small>
      </motion.span>
      {systemNodes.map((node) => {
        const isActive = node.id === group.id;

        return (
          <motion.span
            animate={{ opacity: isActive ? 1 : 0.58, scale: isActive ? 1.04 : 1 }}
            className="skills-system-map-node"
            data-node={node.id}
            key={node.id}
            transition={transition}
          >
            <span>{node.name}</span>
            <small>{ui.systemNodes[node.id]}</small>
          </motion.span>
        );
      })}
    </div>
  );
}
