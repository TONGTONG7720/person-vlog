import { mainNavigation } from '@/config/navigation';
import { isNavigationItemActive } from '@/lib/navigation';
import { useTranslations } from 'next-intl';

import { NavigationLink } from '@/components/navigation/navigation-link';

export type DesktopNavigationProps = Readonly<{
  pathname: string;
}>;

const desktopNavigationItems = mainNavigation.filter((item) => item.href !== '/contact');

export function DesktopNavigation({ pathname }: DesktopNavigationProps): React.JSX.Element {
  const t = useTranslations('nav');

  return (
    <nav aria-label={t('primary')} className="hidden items-center gap-1 lg:flex">
      {desktopNavigationItems.map((item) => (
        <NavigationLink
          active={isNavigationItemActive(item.href, pathname)}
          href={item.href}
          key={item.href}
        >
          {t(item.id)}
        </NavigationLink>
      ))}
    </nav>
  );
}
