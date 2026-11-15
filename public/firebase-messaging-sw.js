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

const BUDGET_TYPES = ['BudgetThresholdReached', 'BudgetExceeded'];

// Bütçe bildirimleri tıklanınca ilgili bütçenin detay sayfasına gider.
function linkFromData(data) {
  if (data && BUDGET_TYPES.includes(data.type) && /^\d+$/.test(data.budgetId || '')) return '/budgets/' + data.budgetId;
  return (data && data.link) || null;
}

function openLink(link) {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    const target = new URL(link, self.location.origin).href;
    const existing = clientList.find((client) => client.url === target);
    return existing ? existing.focus() : self.clients.openWindow(target);
  });
}

// FCM'in kendi gösterdiği ("notification" alanlı) bildirimlerde veri FCM_MSG altındadır ve tıklamayı
// Firebase'in dinleyicisi yakalayıp yayılımı durdurur. Bütçe bildirimleri için bu dinleyici
// Firebase'den ÖNCE kaydedilir ki tıklama bütçe detayına gitsin.
self.addEventListener('notificationclick', (event) => {
  const fcmMsg = event.notification.data && event.notification.data.FCM_MSG;
  const data = fcmMsg && fcmMsg.data;
  if (event.action || !data || !BUDGET_TYPES.includes(data.type)) return;
  const link = linkFromData(data);
  if (!link) return;

  event.stopImmediatePropagation();
  event.notification.close();
  event.waitUntil(openLink(link));
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
    data: { link: linkFromData(data) || '/' },
  });
});

self.addEventListener('notificationclick', (event) => {
  const link = event.notification.data && event.notification.data.link;
  if (!link) return;

  event.notification.close();
  event.waitUntil(openLink(link));
});
