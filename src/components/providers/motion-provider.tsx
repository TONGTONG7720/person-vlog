'use client';

import { createContext, useContext, type PropsWithChildren } from 'react';

import { MotionConfig } from 'framer-motion';

type MotionProviderProps = PropsWithChildren<{
  readonly prefersReducedMotion: boolean;
}>;

const MotionPreferenceContext = createContext(false);

export function useMotionPreference(): boolean {
  return useContext(MotionPreferenceContext);
}

export function MotionProvider({
  children,
  prefersReducedMotion,
}: MotionProviderProps): React.JSX.Element {
  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'never'}>
      <MotionPreferenceContext.Provider value={prefersReducedMotion}>
        {children}
      </MotionPreferenceContext.Provider>
    </MotionConfig>
  );
}
