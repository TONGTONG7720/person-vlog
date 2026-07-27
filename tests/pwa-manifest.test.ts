import { describe, expect, it } from 'vitest';

import createManifest from '@/app/manifest';

describe('PWA web app manifest', () => {
  it('describes Tong as a standalone, installable dark-mode application', () => {
    const manifest = createManifest();

    expect(manifest).toMatchObject({
      background_color: '#050505',
      display: 'standalone',
      name: 'Tong - Full Stack Developer',
      short_name: 'Tong',
      start_url: '/',
      theme_color: '#050505',
    });
  });

  it('provides regular and maskable raster icons for mobile launchers', () => {
    const manifest = createManifest();

    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sizes: '192x192',
          src: '/icons/icon-192.png',
          type: 'image/png',
        }),
        expect.objectContaining({
          sizes: '512x512',
          src: '/icons/icon-512.png',
          type: 'image/png',
        }),
        expect.objectContaining({
          purpose: 'maskable',
          sizes: '512x512',
          src: '/icons/maskable-icon.png',
          type: 'image/png',
        }),
      ]),
    );
  });
});
