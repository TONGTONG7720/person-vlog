'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';

import { resolvePwaInstallMode } from '@/lib/pwa-install';

type PwaInstallChoice = Readonly<{
  readonly outcome: 'accepted' | 'dismissed';
  readonly platform: string;
}>;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  readonly userChoice: Promise<PwaInstallChoice>;
}

type NavigatorWithStandaloneFlag = Navigator &
  Readonly<{
    readonly standalone?: boolean;
  }>;

function hasStandaloneFlag(navigator: Navigator): navigator is NavigatorWithStandaloneFlag {
  return 'standalone' in navigator;
}

function isBeforeInstallPromptEvent(event: Event): event is BeforeInstallPromptEvent {
  return Reflect.has(event, 'userChoice') && typeof Reflect.get(event, 'prompt') === 'function';
}

function isStandaloneApp(): boolean {
  const standaloneDisplayMode =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  const standaloneNavigator =
    hasStandaloneFlag(window.navigator) && window.navigator.standalone === true;

  return standaloneDisplayMode || standaloneNavigator;
}

function isIosSafari(): boolean {
  const userAgent = window.navigator.userAgent;
  const iosDevice =
    /iPad|iPhone|iPod/u.test(userAgent) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const embeddedOrAlternateBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/u.test(userAgent);

  return iosDevice && !embeddedOrAlternateBrowser;
}

export function PwaInstallButton(): React.JSX.Element {
  const t = useTranslations('pwa');
  const instructionsId = useId();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIosBrowser, setIsIosBrowser] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    const syncCapabilities = (): void => {
      setIsInstalled(isStandaloneApp());
      setIsIosBrowser(isIosSafari());
    };
    const handleBeforeInstallPrompt = (event: Event): void => {
      if (!isBeforeInstallPromptEvent(event)) {
        return;
      }

      event.preventDefault();
      setDeferredPrompt(event);
    };
    const handleAppInstalled = (): void => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setShowIosInstructions(false);
    };

    syncCapabilities();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installMode = resolvePwaInstallMode({
    hasDeferredPrompt: deferredPrompt !== null,
    isIosSafari: isIosBrowser,
    isStandalone: isInstalled,
  });
  const isVisible = installMode !== 'unavailable';

  const handleInstall = async (): Promise<void> => {
    if (installMode === 'ios-instructions') {
      setShowIosInstructions(true);
      return;
    }

    if (deferredPrompt === null) {
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
    } catch (error) {
      if (error instanceof DOMException) {
        setDeferredPrompt(null);
        return;
      }

      throw error;
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="pwa-install-entry" data-visible={isVisible ? 'true' : 'false'}>
      {isVisible ? (
        <>
          <div aria-hidden="true" className="pwa-mobile-install-spacer" />
          <div className="pwa-mobile-install-action">
            <div className="pwa-mobile-install-inner">
              <button
                {...(installMode === 'ios-instructions'
                  ? { 'aria-describedby': instructionsId, 'aria-expanded': showIosInstructions }
                  : {})}
                className="pwa-install-button"
                disabled={isInstalling}
                onClick={() => {
                  void handleInstall();
                }}
                type="button"
              >
                <Download aria-hidden="true" className="size-4" />
                <span>{isInstalling ? t('installing') : t('addToHomeScreen')}</span>
              </button>
              {installMode === 'ios-instructions' && showIosInstructions ? (
                <p className="pwa-install-instructions" id={instructionsId} role="status">
                  {t('iosInstructions')}
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
