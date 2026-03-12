import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import AppShell from '../shell/AppShell.vue'

// 所有业务页面统一挂载在 /model_q 下，保证访问路径前缀一致。
export const ROUTE_PREFIX = '/model_q'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: `${ROUTE_PREFIX}/dashboard` },
  {
    path: ROUTE_PREFIX,
    component: AppShell,
    children: [
      { path: '', redirect: 'dashboard' },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardPage.vue'),
        meta: { title: '概览' },
      },
      {
        path: 'models',
        name: 'models',
        component: () => import('../views/ModelsPage.vue'),
        meta: { title: '模型库' },
      },
      {
        path: 'evaluate',
        name: 'evaluate',
        component: () => import('../views/EvaluatePage.vue'),
        meta: { title: '评估' },
      },
      {
        path: 'history',
        name: 'history',
        component: () => import('../views/HistoryPage.vue'),
        meta: { title: '历史' },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/SettingsPage.vue'),
        meta: { title: '设置' },
      },
      {
        path: '404',
        name: 'not-found',
        component: () => import('../views/NotFoundPage.vue'),
        meta: { title: '未找到' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: `${ROUTE_PREFIX}/404` },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0 }
  },
})

router.afterEach((to) => {
  const baseTitle = '模型质量评估控制平台'
  const pageTitle = typeof to.meta?.title === 'string' ? `${to.meta.title} · ${baseTitle}` : baseTitle
  document.title = pageTitle
})
