export const pwaInstallModes = ['native-prompt', 'ios-instructions', 'unavailable'] as const;

export type PwaInstallMode = (typeof pwaInstallModes)[number];

export type PwaInstallCapabilities = Readonly<{
  readonly hasDeferredPrompt: boolean;
  readonly isIosSafari: boolean;
  readonly isStandalone: boolean;
}>;

export function resolvePwaInstallMode({
  hasDeferredPrompt,
  isIosSafari,
  isStandalone,
}: PwaInstallCapabilities): PwaInstallMode {
  if (isStandalone) {
    return 'unavailable';
  }

  if (hasDeferredPrompt) {
    return 'native-prompt';
  }

  return isIosSafari ? 'ios-instructions' : 'unavailable';
}
