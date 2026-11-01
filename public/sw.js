// Service worker de Rikki (ADR 0004) : l'app reste utilisable hors-ligne.
// Navigation : réseau d'abord, sinon la dernière version en cache.
// Fichiers statiques (noms hachés par Vite) : cache d'abord.
// Les appels externes (Gemini, Supabase) ne sont jamais mis en cache.
// Reçoit aussi les notifications (rappels personnels, émotes), ADR 0006.

const CACHE = 'rikki-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './manifest.webmanifest', './icon.svg'])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((rep) => {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put('./', copie));
          return rep;
        })
        .catch(() => caches.match('./')),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(
      (enCache) =>
        enCache ||
        fetch(req).then((rep) => {
          if (rep.ok) {
            const copie = rep.clone();
            caches.open(CACHE).then((c) => c.put(req, copie));
          }
          return rep;
        }),
    ),
  );
});

self.addEventListener('push', (event) => {
  let charge = { titre: 'Rikki', corps: '🐿️', tag: 'rikki' };
  try {
    charge = { ...charge, ...event.data.json() };
  } catch {
    /* charge vide */
  }
  event.waitUntil(
    self.registration.showNotification(charge.titre, {
      body: charge.corps,
      tag: charge.tag,
      icon: './icon-192.png',
      badge: './icon-192.png',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((fenetres) => {
      const ouverte = fenetres.find((f) => 'focus' in f);
      return ouverte ? ouverte.focus() : self.clients.openWindow('./');
    }),
  );
});
