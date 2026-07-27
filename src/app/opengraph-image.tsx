import { ImageResponse } from 'next/og';

import { OpenGraphCard } from '@/components/seo/open-graph-card';
import { defaultLocale } from '@/i18n/config';

export const alt = '瞳瞳 · Full Stack Developer · Java · Python · AI';

export const size = {
  height: 630,
  width: 1200,
} as const;

export const contentType = 'image/png';

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(<OpenGraphCard locale={defaultLocale} />, size);
}
