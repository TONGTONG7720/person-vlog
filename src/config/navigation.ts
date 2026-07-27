import type { NavigationItem } from '@/types/navigation';

export const mainNavigation = [
  { href: '/', id: 'home' },
  { href: '/about', id: 'about' },
  { href: '/projects', id: 'projects' },
  { href: '/services', id: 'services' },
  { href: '/blog', id: 'blog' },
  { href: '/marketplace', id: 'marketplace' },
  { href: '/contact', id: 'contact' },
] as const satisfies readonly NavigationItem[];
