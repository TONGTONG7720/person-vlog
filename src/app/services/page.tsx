import { ServicesSection } from '@/components/sections/services/services-section';
import { getServicesSectionCopy } from '@/data/services';
import { getRequestLocale } from '@/i18n/server';
import { createMetadata } from '@/lib/metadata';

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const content = getServicesSectionCopy(locale).content;

  return createMetadata({
    description: content.description,
    locale,
    path: '/services',
    title: content.title,
  });
}

export const dynamic = 'force-dynamic';

export default function ServicesPage(): React.JSX.Element {
  return <ServicesSection />;
}
