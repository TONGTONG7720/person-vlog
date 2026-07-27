'use client';

import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { useState } from 'react';

import { AssistantButton } from '@/components/assistant/assistant-button';

const AssistantWindow = dynamic(
  () => import('@/components/assistant/assistant-window').then((module) => module.AssistantWindow),
  { ssr: false },
);

export function AssistantLauncher(): React.JSX.Element {
  const locale = useLocale();
  const [hasOpened, setHasOpened] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (nextIsOpen: boolean): void => {
    if (nextIsOpen) {
      setHasOpened(true);
    }

    setIsOpen(nextIsOpen);
  };

  return (
    <>
      <AssistantButton isOpen={isOpen} onClick={() => handleOpenChange(!isOpen)} />
      {hasOpened ? (
        <AssistantWindow isOpen={isOpen} key={locale} onOpenChange={handleOpenChange} />
      ) : null}
    </>
  );
}
