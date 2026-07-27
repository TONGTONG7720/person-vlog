import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

type AdminLayoutProps = Readonly<{
  readonly children: ReactNode;
}>;

export default function AdminLayout({ children }: AdminLayoutProps): React.JSX.Element {
  return <>{children}</>;
}
