import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, setDefaultHandler, setCatchHandler } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { base_url } from '../config';

// DO PRECACHING
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Offline Fallback
setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return workbox.precaching.matchPrecache('index.html');
  }
  return Response.error();
});

// Runtime caching
registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
  })
);

registerRoute(
  ({ url }) =>
    url.origin === 'https://cdnjs.cloudflare.com' || url.origin === 'fontawesome',
  new CacheFirst({
    cacheName: 'fontawesome',
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://ui-avatars.com',
  new CacheFirst({
    cacheName: 'avatars-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(base_url);
    return baseUrl.origin === url.origin && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'newsapp-api',
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(base_url);
    return baseUrl.origin === url.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'newsapp-api-images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.origin.includes('maptiler'),
  new CacheFirst({
    cacheName: 'maptiler-api',
  })
);

// PUSH NOTIFICATION HANDLER
self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');

  const chainPromise = async () => {
    await self.registration.showNotification('Ada laporan baru untuk anda!', {
      body: 'Silahkan dibuka untuk informasi lebih lanjut...',
    });
  };

  event.waitUntil(chainPromise());
});

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing (dev mode)...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating (dev mode)...');
  event.waitUntil(self.clients.claim());
});