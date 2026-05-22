self.addEventListener('push', (event) => {
  const fallback = {
    title: 'Punto de Inflexion',
    body: 'Tienes una nueva notificacion.',
    url: '/dashboard',
  };
  const data = event.data ? event.data.json() : fallback;
  const title = data.title || fallback.title;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || fallback.body,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: data.tag || 'punto-de-inflexion-notification',
      data: { url: data.url || fallback.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const url = new URL(targetUrl, self.location.origin).href;
      for (const client of clients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
