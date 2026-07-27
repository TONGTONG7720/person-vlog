import { ImageResponse } from 'next/og';

import { OpenGraphCard } from '@/components/seo/open-graph-card';
import { defaultLocale, isLocale } from '@/i18n/config';

export const size = {
  height: 630,
  width: 1200,
} as const;

export const contentType = 'image/png';

type OpenGraphImageProps = Readonly<{
  params: Promise<{
    locale: string;
  }>;
}>;

export default async function LocalizedOpenGraphImage({
  params,
}: OpenGraphImageProps): Promise<ImageResponse> {
  const { locale: requestedLocale } = await params;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return new ImageResponse(<OpenGraphCard locale={locale} />, size);
}
