import { createSerwistRoute } from '@serwist/turbopack';

import { PWA_CACHE_VERSION, PWA_OFFLINE_PATH } from '@/lib/pwa';

export const { dynamic, dynamicParams, generateStaticParams, GET, revalidate } = createSerwistRoute(
  {
    additionalPrecacheEntries: [
      {
        revision: PWA_CACHE_VERSION,
        url: PWA_OFFLINE_PATH,
      },
    ],
    swSrc: 'src/sw.ts',
    useNativeEsbuild: true,
  },
);
