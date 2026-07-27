'use client';

import { useEffect, useState } from 'react';

export function usePageVisibility(): boolean {
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    const updatePageVisibility = (): void => {
      setIsPageVisible(document.visibilityState !== 'hidden');
    };

    updatePageVisibility();
    document.addEventListener('visibilitychange', updatePageVisibility);

    return () => {
      document.removeEventListener('visibilitychange', updatePageVisibility);
    };
  }, []);

  return isPageVisible;
}
