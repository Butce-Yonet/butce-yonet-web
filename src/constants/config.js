export const defaultLocale = 'en';
export const localeOptions = [
  { id: 'tr', name: 'Türkçe', icon: 'flag-icon-tr', short: '(TR)' },
  { id: 'en', name: 'English', icon: 'flag-icon-us', short: '(US)' },
];

// Environment Configuration
export const env = process.env.VUE_APP_ENV || 'development';

// Auth Server Configuration
export const authServerUrl = process.env.VUE_APP_AUTH_SERVER_URL || 'http://localhost:5100';
export const authServerRedirectUrl = process.env.VUE_APP_AUTH_SERVER_REDIRECT_URL || 'http://localhost:8080/auth/callback';

// API Configuration
export const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:5100/api';

// Firebase Configuration
export const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID,
};

// Firebase Cloud Messaging web push certificate (Firebase Console > Project settings > Cloud Messaging)
export const firebaseVapidKey = process.env.VUE_APP_FIREBASE_VAPID_KEY;
