import { describe, expect, it } from 'vitest';

import { resolvePwaInstallMode } from '@/lib/pwa-install';

describe('PWA install entry', () => {
  it('uses the browser install prompt only after the browser makes it available', () => {
    expect(
      resolvePwaInstallMode({
        hasDeferredPrompt: true,
        isIosSafari: false,
        isStandalone: false,
      }),
    ).toBe('native-prompt');
  });

  it('shows iPhone instructions without trying to request notification permissions', () => {
    expect(
      resolvePwaInstallMode({
        hasDeferredPrompt: false,
        isIosSafari: true,
        isStandalone: false,
      }),
    ).toBe('ios-instructions');
  });

  it('hides the entry after installation or when the browser cannot install the app', () => {
    expect(
      resolvePwaInstallMode({
        hasDeferredPrompt: true,
        isIosSafari: false,
        isStandalone: true,
      }),
    ).toBe('unavailable');
    expect(
      resolvePwaInstallMode({
        hasDeferredPrompt: false,
        isIosSafari: false,
        isStandalone: false,
      }),
    ).toBe('unavailable');
  });
});
