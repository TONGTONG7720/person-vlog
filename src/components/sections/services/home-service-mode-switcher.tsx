'use client';

import { ArrowUpRight } from 'lucide-react';
import { useCallback, useRef, useState, type KeyboardEvent } from 'react';

import type { HomeServiceMode, HomeServiceModeId } from '@/data/home-preview';
import { Link } from '@/i18n/navigation';

function nextIndex(index: number, direction: number, itemCount: number): number {
  return (index + direction + itemCount) % itemCount;
}

export type HomeServiceModeSwitcherProps = Readonly<{
  readonly actionLabel: string;
  readonly ariaLabel: string;
  readonly modes: readonly HomeServiceMode[];
  readonly panelLabel: string;
}>;

export function HomeServiceModeSwitcher({
  actionLabel,
  ariaLabel,
  modes,
  panelLabel,
}: HomeServiceModeSwitcherProps): React.JSX.Element | null {
  const initialMode = modes[0];
  const [activeModeId, setActiveModeId] = useState<HomeServiceModeId | null>(
    initialMode?.id ?? null,
  );
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activateMode = useCallback((modeId: HomeServiceModeId): void => {
    setActiveModeId(modeId);
  }, []);

  const focusMode = useCallback(
    (index: number): void => {
      const mode = modes[index];

      if (mode === undefined) {
        return;
      }

      activateMode(mode.id);
      tabRefs.current[index]?.focus();
    },
    [activateMode, modes],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          focusMode(nextIndex(index, 1, modes.length));
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          focusMode(nextIndex(index, -1, modes.length));
          break;
        case 'End':
          event.preventDefault();
          focusMode(modes.length - 1);
          break;
        case 'Home':
          event.preventDefault();
          focusMode(0);
          break;
        default:
          break;
      }
    },
    [focusMode, modes.length],
  );

  if (initialMode === undefined || activeModeId === null) {
    return null;
  }

  const activeMode = modes.find((mode) => mode.id === activeModeId) ?? initialMode;

  return (
    <div className="home-service-mode-switcher">
      <div aria-label={ariaLabel} className="home-service-mode-tablist" role="tablist">
        {modes.map((mode, index) => (
          <button
            aria-controls={`home-service-panel-${mode.id}`}
            aria-selected={mode.id === activeMode.id}
            className="home-service-mode-tab"
            data-state={mode.id === activeMode.id ? 'active' : 'inactive'}
            id={`home-service-tab-${mode.id}`}
            key={mode.id}
            onClick={() => activateMode(mode.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            tabIndex={mode.id === activeMode.id ? 0 : -1}
            type="button"
          >
            <span>{mode.number}</span>
            <strong>{mode.title}</strong>
            <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`home-service-tab-${activeMode.id}`}
        className="home-service-mode-panel"
        id={`home-service-panel-${activeMode.id}`}
        role="tabpanel"
        tabIndex={0}
      >
        <p className="home-preview-kicker">{panelLabel}</p>
        <h3>{activeMode.title}</h3>
        <p className="home-service-mode-description">{activeMode.description}</p>
        <ul>
          {activeMode.signals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
        <Link
          className="home-preview-link home-service-mode-action"
          href={`/contact?service=${activeMode.contactService}`}
        >
          <span>{actionLabel}</span>
          <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
