/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { CacheFirst, cacheNames, ExpirationPlugin, NetworkFirst, Serwist } from 'serwist';
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from 'serwist';

import {
  getPwaRuntimeCacheKind,
  isManagedPwaCacheName,
  PWA_CACHE_NAMES,
  PWA_CACHE_VERSION,
  PWA_OFFLINE_PATH,
} from './lib/pwa';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const cacheExpiration = {
  images: new ExpirationPlugin({
    maxAgeSeconds: 30 * 24 * 60 * 60,
    maxEntries: 80,
    maxAgeFrom: 'last-used',
  }),
  pages: new ExpirationPlugin({
    maxAgeSeconds: 7 * 24 * 60 * 60,
    maxEntries: 40,
    maxAgeFrom: 'last-used',
  }),
  static: new ExpirationPlugin({
    maxAgeSeconds: 30 * 24 * 60 * 60,
    maxEntries: 96,
    maxAgeFrom: 'last-used',
  }),
} as const;

const runtimeCaching: RuntimeCaching[] = [
  {
    handler: new CacheFirst({
      cacheName: PWA_CACHE_NAMES.static,
      plugins: [cacheExpiration.static],
    }),
    matcher: ({ request, sameOrigin, url }) =>
      sameOrigin &&
      getPwaRuntimeCacheKind({
        destination: request.destination,
        method: request.method,
        mode: request.mode,
        pathname: url.pathname,
        rsc: request.headers.get('RSC') === '1',
      }) === 'static',
  },
  {
    handler: new CacheFirst({
      cacheName: PWA_CACHE_NAMES.images,
      plugins: [cacheExpiration.images],
    }),
    matcher: ({ request, sameOrigin, url }) =>
      sameOrigin &&
      getPwaRuntimeCacheKind({
        destination: request.destination,
        method: request.method,
        mode: request.mode,
        pathname: url.pathname,
        rsc: request.headers.get('RSC') === '1',
      }) === 'images',
  },
  {
    handler: new NetworkFirst({
      cacheName: PWA_CACHE_NAMES.pages,
      networkTimeoutSeconds: 3,
      plugins: [cacheExpiration.pages],
    }),
    matcher: ({ request, sameOrigin, url }) =>
      sameOrigin &&
      getPwaRuntimeCacheKind({
        destination: request.destination,
        method: request.method,
        mode: request.mode,
        pathname: url.pathname,
        rsc: request.headers.get('RSC') === '1',
      }) === 'pages',
  },
];

const serwist = new Serwist({
  cacheId: PWA_CACHE_VERSION,
  clientsClaim: true,
  disableDevLogs: true,
  fallbacks: {
    entries: [
      {
        matcher: ({ request }) => request.destination === 'document',
        url: PWA_OFFLINE_PATH,
      },
    ],
  },
  navigationPreload: true,
  ...(self.__SW_MANIFEST === undefined ? {} : { precacheEntries: self.__SW_MANIFEST }),
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  runtimeCaching,
  skipWaiting: false,
});

const currentCacheNames = new Set([...Object.values(PWA_CACHE_NAMES), cacheNames.precache]);

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.caches
      .keys()
      .then((cacheNamesToInspect) =>
        Promise.all(
          cacheNamesToInspect
            .filter(
              (cacheName) => isManagedPwaCacheName(cacheName) && !currentCacheNames.has(cacheName),
            )
            .map((cacheName) => self.caches.delete(cacheName)),
        ),
      ),
  );
});

serwist.addEventListeners();
