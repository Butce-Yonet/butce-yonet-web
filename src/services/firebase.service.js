import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent as firebaseLogEvent } from 'firebase/analytics';
import {
  getMessaging,
  getToken,
  deleteToken,
  onMessage,
  isSupported as isMessagingSupported,
} from 'firebase/messaging';
import { firebaseConfig, firebaseVapidKey } from '@/constants/config';
import authService from '@/services/auth.service';

// Token last acknowledged by the auth server (/api/fcm/tokens). Set only after a successful register.
const FCM_TOKEN_KEY = 'fcm_token_registered';
// Stable per-browser id; lets the server retire this device's old token when FCM rotates it.
const FCM_DEVICE_ID_KEY = 'fcm_device_id';
// Set when the user turns the mobile notification channel off; stops silent re-registration on app start.
const PUSH_OPTED_OUT_KEY = 'push_opted_out';

// Notification settings channel (Profile > Notifications) that controls push notifications.
export const MOBILE_NOTIFICATION_CHANNEL = 'MobileNotification';

const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;

// Analytics stays null when the browser does not support it (e.g. cookies/IndexedDB disabled).
// Page views of the SPA are collected automatically by GA4 enhanced measurement (history changes).
const analyticsPromise = app
  ? isSupported().then((supported) => (supported ? getAnalytics(app) : null)).catch(() => null)
  : Promise.resolve(null);

// Messaging needs a service worker, the Push API, the Notification API and a VAPID key.
const messagingPromise = app && firebaseVapidKey
  ? isMessagingSupported().then((supported) => (supported ? getMessaging(app) : null)).catch(() => null)
  : Promise.resolve(null);

export async function logEvent(eventName, params) {
  const analytics = await analyticsPromise;
  if (analytics) firebaseLogEvent(analytics, eventName, params);
}

export async function isPushSupported() {
  return (await messagingPromise) != null;
}

export function getNotificationPermission() {
  return typeof Notification !== 'undefined' ? Notification.permission : 'denied';
}

function registerMessagingServiceWorker() {
  // The service worker cannot read process.env, so the config is passed via the query string.
  const params = new URLSearchParams({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params}`);
}

async function fetchToken(messaging) {
  const serviceWorkerRegistration = await registerMessagingServiceWorker();
  const token = await getToken(messaging, { vapidKey: firebaseVapidKey, serviceWorkerRegistration });

  if (token && token !== getStoredPushToken()) {
    const res = await authService.registerFcmToken(token, getDeviceId());
    if (!res.ok) throw new Error(`FCM token register failed (${res.status})`);
    setStoredPushToken(token);
  }
  return token;
}

// Must be called from a user gesture (button click), otherwise browsers may block the prompt.
// On success the mobile notification channel is switched on as well, unless syncChannel is false
// (the settings toggle saves the channel itself).
export async function enablePushNotifications({ syncChannel = true } = {}) {
  const messaging = await messagingPromise;
  if (!messaging) return { status: 'unsupported' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { status: permission };

  writeStorage(PUSH_OPTED_OUT_KEY, null);
  const token = await fetchToken(messaging);

  let channelEnabled = false;
  if (syncChannel) {
    const res = await authService.updateNotificationSettings([
      { name: MOBILE_NOTIFICATION_CHANNEL, isEnabled: true },
    ]);
    channelEnabled = res.ok;
  }
  return { status: 'granted', token, channelEnabled };
}

// Called when the mobile notification channel is turned off: unregisters this browser's token
// and keeps it from being registered again on the next app start. Never throws.
export async function disablePushNotifications() {
  writeStorage(PUSH_OPTED_OUT_KEY, '1');
  await unregisterPushToken();
}

// Silently refreshes the token when permission was granted before (FCM tokens can rotate).
export async function refreshPushToken() {
  const messaging = await messagingPromise;
  if (!messaging || getNotificationPermission() !== 'granted') return null;
  if (readStorage(PUSH_OPTED_OUT_KEY)) return null;
  return fetchToken(messaging);
}

// While the app is open (foreground) messages arrive here instead of the service worker.
export async function onForegroundMessage(callback) {
  const messaging = await messagingPromise;
  return messaging ? onMessage(messaging, callback) : () => {};
}

// Deactivates this device's token on the auth server (/api/fcm/tokens/unregister) and in Firebase.
// Call before the auth token is cleared (e.g. on logout). Never throws.
export async function unregisterPushToken() {
  const token = getStoredPushToken();
  if (!token) return;
  // _authJson never throws; on failure we still clear locally so the next login registers again.
  await authService.unregisterFcmToken(token);
  try {
    const messaging = await messagingPromise;
    if (messaging) await deleteToken(messaging);
  } catch {
    // ignore
  }
  setStoredPushToken(null);
}

// Shows an OS-level notification through the messaging service worker. Used for foreground
// messages that arrive while this tab is in the background, where an in-app card would go unseen.
// Returns true when the notification was shown. Never throws.
export async function showSystemNotification({ title, body, link }) {
  if (getNotificationPermission() !== 'granted' || !('serviceWorker' in navigator)) return false;
  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) return false;
    await registration.showNotification(title || 'Bütçe Yönet', {
      body,
      icon: '/favicon.png',
      data: { link: link || '/' },
    });
    return true;
  } catch {
    return false;
  }
}

export function getStoredPushToken() {
  return readStorage(FCM_TOKEN_KEY);
}

function setStoredPushToken(token) {
  writeStorage(FCM_TOKEN_KEY, token);
}

function getDeviceId() {
  let id = readStorage(FCM_DEVICE_ID_KEY);
  if (!id) {
    id = window.crypto?.randomUUID?.()
      || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    writeStorage(FCM_DEVICE_ID_KEY, id);
  }
  return id;
}

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    // storage unavailable
  }
}

export default app;
