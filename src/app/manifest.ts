import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#050505',
    categories: ['business', 'developer', 'productivity'],
    description: 'Java, Python, Vue and AI Developer',
    display: 'standalone',
    id: '/',
    icons: [
      {
        sizes: '192x192',
        src: '/icons/icon-192.png',
        type: 'image/png',
      },
      {
        sizes: '512x512',
        src: '/icons/icon-512.png',
        type: 'image/png',
      },
      {
        purpose: 'maskable',
        sizes: '512x512',
        src: '/icons/maskable-icon.png',
        type: 'image/png',
      },
    ],
    lang: 'zh-CN',
    name: 'Tong - Full Stack Developer',
    orientation: 'portrait-primary',
    scope: '/',
    short_name: 'Tong',
    start_url: '/',
    theme_color: '#050505',
  };
}
