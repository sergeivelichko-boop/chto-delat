const CACHE = "chto-delat-v2-3";

const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES))
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});


// Настоящие Web Push уведомления
self.addEventListener("push", (event) => {
  let data = {
    title: "Что делать?",
    body: "У вас есть напоминание"
  };

  if (event.data) {
    try {
      data = {
        ...data,
        ...event.data.json()
      };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    tag: data.tag || "chto-delat-reminder",
    renotify: true,
    data: {
      url: data.url || "./"
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});


// Нажатие на уведомление открывает приложение
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification.data?.url || "./";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {

      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});
