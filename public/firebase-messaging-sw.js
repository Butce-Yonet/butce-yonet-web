/* global importScripts, firebase */
// Firebase Cloud Messaging service worker.
// public/ altındaki dosyalar build'den geçmediği için process.env okunamaz;
// Firebase yapılandırması kayıt sırasında query string ile iletilir (bkz. src/services/firebase.service.js).
importScripts('https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging-compat.js');

const params = new URL(self.location).searchParams;

firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
});

const messaging = firebase.messaging();

// "notification" alanı olan mesajları FCM kendisi gösterir.
// Yalnızca "data" içeren mesajlar için bildirimi burada oluşturuyoruz.
messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;

  const data = payload.data || {};
  self.registration.showNotification(data.title || 'Bütçe Yönet', {
    body: data.body,
    icon: data.icon || '/favicon.png',
    data: { link: data.link || '/' },
  });
});

self.addEventListener('notificationclick', (event) => {
  const link = event.notification.data && event.notification.data.link;
  if (!link) return;

  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const target = new URL(link, self.location.origin).href;
      const existing = clientList.find((client) => client.url === target);
      return existing ? existing.focus() : self.clients.openWindow(target);
    })
  );
});
