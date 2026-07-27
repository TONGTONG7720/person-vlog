'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';

import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { NavigationLink } from '@/components/navigation/navigation-link';
import { mainNavigation } from '@/config/navigation';
import { getEnabledSocialLinks } from '@/config/social';
import { usePathname } from '@/i18n/navigation';
import { isNavigationItemActive } from '@/lib/navigation';

type MobileNavigationDialogProps = Readonly<{
  onOpenChange?: (isOpen: boolean) => void;
  pathname: string;
}>;

function MobileNavigationDialog({
  onOpenChange,
  pathname,
}: MobileNavigationDialogProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const availableSocialLinks = getEnabledSocialLinks();
  const t = useTranslations('nav');
  const handleOpenChange = (nextIsOpen: boolean): void => {
    setIsOpen(nextIsOpen);
    onOpenChange?.(nextIsOpen);
  };

  return (
    <Dialog.Root onOpenChange={handleOpenChange} open={isOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-controls={contentId}
          aria-label={isOpen ? t('closeMenu') : t('openMenu')}
          className="text-ink hover:bg-raised-hover inline-flex size-11 items-center justify-center rounded-sm border border-transparent transition-colors duration-[var(--motion-fast)] focus-visible:outline-offset-2 lg:hidden"
          type="button"
        >
          {isOpen ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
          <span className="sr-only">{isOpen ? t('closeMenu') : t('openMenu')}</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="mobile-menu-overlay bg-overlay fixed inset-0 z-[var(--z-overlay)]" />
        <Dialog.Content
          aria-describedby="mobile-menu-description"
          className="mobile-menu-content bg-canvas-subtle fixed inset-0 z-[var(--z-modal)] flex min-h-dvh flex-col overflow-y-auto px-5 pt-[calc(var(--navigation-height)+var(--space-8))] pb-8 sm:px-8 lg:hidden"
          id={contentId}
        >
          <Dialog.Title className="sr-only">{t('menuTitle')}</Dialog.Title>
          <Dialog.Description className="sr-only" id="mobile-menu-description">
            {t('menuDescription')}
          </Dialog.Description>
          <nav aria-label={t('mobile')} className="flex-1 pt-10">
            <ol className="space-y-2">
              {mainNavigation.map((item, index) => (
                <li key={item.href}>
                  <Dialog.Close asChild>
                    <NavigationLink
                      active={isNavigationItemActive(item.href, pathname)}
                      className="mobile-menu-link w-full justify-between py-2 text-[length:var(--type-navigation)] leading-none after:inset-x-0 after:-bottom-0.5"
                      href={item.href}
                    >
                      <span className="text-subtle font-mono text-xs tracking-normal">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{t(item.id)}</span>
                    </NavigationLink>
                  </Dialog.Close>
                </li>
              ))}
            </ol>
          </nav>

          <div className="border-border-subtle mt-12 border-t pt-5">
            <LanguageSwitcher className="mb-5 flex items-center gap-2" />
            {availableSocialLinks.length > 0 ? (
              <ul className="flex flex-wrap gap-x-5 gap-y-3">
                {availableSocialLinks.map((link) => (
                  <li key={link.id}>
                    <NavigationLink external href={link.url}>
                      {link.name}
                    </NavigationLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="type-body-sm text-subtle">{t('contactPending')}</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type MobileNavigationProps = Readonly<{
  onOpenChange?: (isOpen: boolean) => void;
}>;

export function MobileNavigation({ onOpenChange }: MobileNavigationProps): React.JSX.Element {
  const pathname = usePathname();
  const dialogProps = onOpenChange ? { onOpenChange } : {};

  return <MobileNavigationDialog key={pathname} pathname={pathname} {...dialogProps} />;
}
