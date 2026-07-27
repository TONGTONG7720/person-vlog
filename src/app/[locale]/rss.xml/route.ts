import { defaultLocale, isLocale } from '@/i18n/config';
import { createRssResponse } from '@/lib/rss';

export const revalidate = 3_600;

type LocalizedRssRouteProps = Readonly<{
  params: Promise<{
    locale: string;
  }>;
}>;

export async function GET(_: Request, { params }: LocalizedRssRouteProps): Promise<Response> {
  const { locale: requestedLocale } = await params;

  return createRssResponse(isLocale(requestedLocale) ? requestedLocale : defaultLocale);
}
