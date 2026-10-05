// UltCast service worker
// Only job: show "X is live" notifications and open the right cast when tapped.
// It deliberately does NOT cache anything, so every GitHub update shows up straight away.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: 'UltCast', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'UltCast';
  const options = {
    body: data.body || 'A caster you follow is live now',
    icon: '/icon-192.png',
    badge: '/badge-96.png',
    tag: data.tag || 'ultcast-live',
    renotify: true,
    data: { url: data.url || '/demo' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/demo', self.location.origin).href;
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Reuse an open UltCast window if there is one
    for (const w of wins) {
      if (w.url.includes('/demo')) {
        try { await w.focus(); } catch (e) {}
        try { w.postMessage({ type: 'uc-open', url: target }); return; } catch (e) {}
      }
    }
    await self.clients.openWindow(target);
  })());
});
