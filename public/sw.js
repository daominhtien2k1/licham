// Service Worker for Lịch Âm PWA
// Strategy: Network-first for everything EXCEPT push notifications
// This prevents stale chunk issues during development

const CACHE_NAME = 'licham-v2';

// Only cache truly static assets (icons, manifest)
const PRECACHE_URLS = ['/manifest.json', '/icons/icon-192x192.png', '/icons/icon-512x512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS.filter(url => {
      // Don't fail install if icons don't exist
      return true;
    })).catch(() => { }))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Clear ALL old caches
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // NEVER cache Next.js JS chunks, API routes, or _next assets
  // These change every rebuild — always fetch from network
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.json')
  ) {
    // Network only — no caching
    return;
  }

  // For icons and static images: cache-first
  if (url.pathname.startsWith('/icons/') || url.pathname.match(/\.(png|jpg|svg|ico|webp)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // For everything else (navigation): network-first, no caching
  // This ensures fresh HTML on every page load
  event.respondWith(fetch(event.request).catch(() => caches.match('/')));
});

// ── Push notification handler ──
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data?.json() || {};
  } catch {
    data = { title: '🗓️ Lịch Âm', body: event.data?.text() || '' };
  }

  const {
    title = '🗓️ Lịch Âm Nhắc Nhở',
    body = '',
    icon = '/icons/icon-192x192.png',
    badge = '/icons/icon-72x72.png',
    tag = 'licham',
    data: extraData = {},
  } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      vibrate: [200, 100, 200],
      data: extraData,
      actions: [
        { action: 'open', title: '📅 Xem Lịch' },
        { action: 'close', title: 'Đóng' },
      ],
    })
  );
});

// ── Notification click handler ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
    })
  );
});
