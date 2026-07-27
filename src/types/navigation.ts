export const navigationItemIds = [
  'home',
  'about',
  'projects',
  'services',
  'blog',
  'marketplace',
  'contact',
] as const;

export type NavigationItemId = (typeof navigationItemIds)[number];

export type NavigationItem = {
  readonly href: string;
  readonly id: NavigationItemId;
  readonly external?: boolean;
};
