'use client';

import { useCallback, useRef, useState, type KeyboardEvent } from 'react';

import { SkillDetailPanel } from '@/components/sections/skills/skill-detail-panel';
import { SkillGroupCard } from '@/components/sections/skills/skill-group-card';
import type { SkillsUiCopy } from '@/data/skills';
import type { SkillGroup, SkillGroupId, SkillLevel } from '@/types/skill';

function getNextGroupIndex(index: number, direction: number, groupCount: number): number {
  return (index + direction + groupCount) % groupCount;
}

export type SkillsDesktopExplorerProps = Readonly<{
  groups: readonly SkillGroup[];
  levelLabels: Readonly<Record<SkillLevel, string>>;
  ui: SkillsUiCopy;
}>;

export function SkillsDesktopExplorer({
  groups,
  levelLabels,
  ui,
}: SkillsDesktopExplorerProps): React.JSX.Element | null {
  const initialGroup = groups[0];
  const [activeGroupId, setActiveGroupId] = useState<SkillGroupId | null>(initialGroup?.id ?? null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activateGroup = useCallback((groupId: SkillGroupId): void => {
    setActiveGroupId(groupId);
  }, []);

  const focusGroup = useCallback(
    (index: number): void => {
      const nextGroup = groups[index];

      if (nextGroup === undefined) {
        return;
      }

      activateGroup(nextGroup.id);
      tabRefs.current[index]?.focus();
    },
    [activateGroup, groups],
  );

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          focusGroup(getNextGroupIndex(index, 1, groups.length));
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          focusGroup(getNextGroupIndex(index, -1, groups.length));
          break;
        case 'End':
          event.preventDefault();
          focusGroup(groups.length - 1);
          break;
        case 'Home':
          event.preventDefault();
          focusGroup(0);
          break;
        default:
          break;
      }
    },
    [focusGroup, groups.length],
  );

  if (initialGroup === undefined || activeGroupId === null) {
    return null;
  }

  const activeGroup = groups.find((group) => group.id === activeGroupId) ?? initialGroup;

  return (
    <div className="skills-desktop-explorer">
      <div className="skills-desktop-layout">
        <div
          aria-label={ui.module}
          aria-orientation="vertical"
          className="skills-group-tablist"
          role="tablist"
        >
          {groups.map((group, index) => (
            <SkillGroupCard
              buttonRef={(element) => {
                tabRefs.current[index] = element;
              }}
              group={group}
              isActive={group.id === activeGroup.id}
              key={group.id}
              labels={ui}
              onActivate={() => activateGroup(group.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            />
          ))}
        </div>
        <SkillDetailPanel group={activeGroup} levelLabels={levelLabels} ui={ui} />
      </div>
    </div>
  );
}
