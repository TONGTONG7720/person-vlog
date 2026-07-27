'use client';

import { BrandLogo } from '@/components/navigation/brand-logo';
import { ContactNavigationButton } from '@/components/navigation/contact-navigation-button';
import { DesktopNavigation } from '@/components/navigation/desktop-navigation';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { MobileNavigation } from '@/components/navigation/mobile-navigation';
import { Container } from '@/components/ui/container';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { usePathname } from '@/i18n/navigation';

import { useState } from 'react';

export function SiteHeader(): React.JSX.Element {
  const pathname = usePathname();
  const { direction, isScrolled } = useScrollDirection();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHidden = !isMenuOpen && isScrolled && direction === 'down';

  return (
    <header
      className="site-header fixed inset-x-0 top-0 border-b"
      data-hidden={isHidden}
      data-menu-open={isMenuOpen}
      data-scrolled={isScrolled}
    >
      <Container
        className="flex h-[var(--navigation-height)] items-center justify-between gap-4"
        size="content"
      >
        <BrandLogo />
        <div className="flex items-center gap-3">
          <DesktopNavigation pathname={pathname} />
          <LanguageSwitcher className="hidden items-center gap-1 lg:flex" />
          <ContactNavigationButton />
          <MobileNavigation onOpenChange={setIsMenuOpen} />
        </div>
      </Container>
    </header>
  );
}
