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
