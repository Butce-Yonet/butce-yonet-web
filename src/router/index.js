import { createRouter, createWebHistory } from "vue-router"
import authService from "@/services/auth.service";
import state from '@/store'

let consentCheckInProgress = false;

import Body from '@/components/body.vue';
import Default from '@/pages/dashboard/index.vue';
import Reports from '@/pages/reports/index.vue';
import Transactions from '@/pages/transactions/index.vue';
import Labels from '@/pages/labels/index.vue';
import Callback from '@/pages/auth/callback.vue';
import Error401 from '@/pages/error/error401.vue';
import Error404 from '@/pages/error/error404.vue';

const routes = [
  {
    path: '/',
    component: Body,

    children: [
      {
        path: '',
        name: 'dashboard',
        component: Default,
      },
      {
        path: '/transactions',
        name: 'transactions',
        component: Transactions,
      },
      {
        path: '/reports',
        name: 'reports',
        component: Reports,
      },
      {
        path: '/labels',
        name: 'labels',
        component: Labels,
      },
      {
        path: '/auth/callback',
        name: 'auth-callback',
        component: Callback
      },
    ]
  },
  {
    path: '/auth/failed',
    name: 'auth-failed',
    component: Error401
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: Error404
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

const whiteList = [
  '/auth/callback',
  '/auth/failed'
]

router.beforeEach(async (to, from, next) => {
  if (!whiteList.includes(to.path)) {
    if (!authService.isAuthenticated()) {
      authService.redirectToLogin();
      return;
    }

    if (!consentCheckInProgress && state.getters['consent/hasPending'] === false) {
      consentCheckInProgress = true;
      try {
        const language = localStorage.getItem('currentLanguage') || 'en';
        const [res1, res2, res4] = await Promise.all([
          authService.checkConsent(1, language),
          authService.checkConsent(2, language),
          authService.checkConsent(4, language),
        ]);

        const outdated = [];
        if (res1?.isSuccess && res1.data && !res1.data.isUpToDate) {
          outdated.push({ type: 1, content: res1.data.content, language });
        }
        if (res2?.isSuccess && res2.data && !res2.data.isUpToDate) {
          outdated.push({ type: 2, content: res2.data.content, language });
        }
        if (res4?.isSuccess && res4.data && !res4.data.isUpToDate) {
          outdated.push({ type: 4, content: res4.data.content, language });
        }

        if (outdated.length > 0) {
          state.dispatch('consent/setPending', { consents: outdated, total: outdated.length });
        }
      } catch {
        // consent check hatası navigasyonu engellemesin
      } finally {
        consentCheckInProgress = false;
      }
    }
  }

  next();
});


export default router