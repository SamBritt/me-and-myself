import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/journals' },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue'),
      meta: { public: true },
    },
    {
      path: '/journals',
      name: 'journals-list',
      component: () => import('../views/JournalsListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/journals/:journalId',
      name: 'journal-list',
      component: () => import('../views/JournalListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/journals/:journalId/new',
      name: 'journal-new',
      component: () => import('../views/JournalEditorView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/journals/:journalId/:entryId',
      name: 'journal-editor',
      component: () => import('../views/JournalEditorView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/insights',
      name: 'insights',
      component: () => import('../views/InsightsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.public && auth.isAuthenticated) {
    return { name: 'journals-list' }
  }
  return true
})

export default router
