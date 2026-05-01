import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DoomSaver',
    short_name: 'DoomSaver',
    description: 'Plan and track your family finances together with DoomSaver',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F2EDE4',
    theme_color: '#1A1B22',
    categories: ['finance', 'productivity', 'utilities'],
    lang: 'en-US',
    icons: [
      {
        src: '/icon.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
