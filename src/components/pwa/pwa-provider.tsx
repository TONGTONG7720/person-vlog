'use client';

import { SerwistProvider } from '@serwist/turbopack/react';
import type { PropsWithChildren } from 'react';

export function PwaProvider({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <SerwistProvider
      cacheOnNavigation
      disable={process.env.NODE_ENV !== 'production'}
      reloadOnOnline={false}
      swUrl="/serwist/sw.js"
    >
      {children}
    </SerwistProvider>
  );
}
