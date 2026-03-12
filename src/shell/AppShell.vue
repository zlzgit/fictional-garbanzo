<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { ROUTE_PREFIX } from '../router'

type NavItem = {
  to: string
  label: string
  desc: string
}

const navItems: NavItem[] = [
  { to: `${ROUTE_PREFIX}/dashboard`, label: '概览', desc: '关键指标总览' },
  { to: `${ROUTE_PREFIX}/models`, label: '模型库', desc: '模型与参数' },
  { to: `${ROUTE_PREFIX}/evaluate`, label: '评估', desc: '执行评估与对比' },
  { to: `${ROUTE_PREFIX}/history`, label: '历史', desc: '评估记录追踪' },
  { to: `${ROUTE_PREFIX}/settings`, label: '设置', desc: '偏好与阈值' },
]

const route = useRoute()
const activeLabel = computed(() => navItems.find((i) => route.path.startsWith(i.to))?.label ?? '模型质量评估')
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <div class="brand__mark" aria-hidden="true" />
        <div class="brand__text">
          <div class="brand__name">模型 Q</div>
          <div class="brand__sub">质量控制</div>
        </div>
      </div>

      <div class="topbar__title">
        <div class="topbar__titleText">{{ activeLabel }}</div>
        <div class="topbar__hint">全部数据为 Mock 演示，可离线预览</div>
      </div>

      <div class="topbar__actions">
        <a class="ghostLink" href="https://vuejs.org/" target="_blank" rel="noreferrer">Vue 3</a>
        <a class="ghostLink" href="https://vite.dev/" target="_blank" rel="noreferrer">Vite</a>
      </div>
    </header>

    <div class="frame">
      <aside class="sidenav" aria-label="页面导航">
        <nav class="nav">
          <RouterLink v-for="item in navItems" :key="item.to" class="nav__item" :to="item.to">
            <div class="nav__label">{{ item.label }}</div>
            <div class="nav__desc">{{ item.desc }}</div>
          </RouterLink>
        </nav>
      </aside>

      <main class="content">
        <RouterView />
      </main>
    </div>

    <footer class="footer">
      <div class="footer__left">模型质量评估控制平台 · Mock 演示</div>
      <div class="footer__right">路径统一以 /model_q 开头</div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  background: var(--c-bg);
  color: var(--c-text);
  display: flex;
  flex-direction: column;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 240px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 14px 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.74));
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand__mark {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background:
    radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.85), rgba(34, 211, 238, 0.65)),
    radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.55), rgba(99, 102, 241, 0.2));
  box-shadow:
    0 10px 26px rgba(99, 102, 241, 0.28),
    inset 0 0 0 1px rgba(255, 255, 255, 0.55);
}

.brand__name {
  font-weight: 760;
  letter-spacing: 0.3px;
}

.brand__sub {
  font-size: 12px;
  color: var(--c-muted);
}

.topbar__titleText {
  font-weight: 720;
  letter-spacing: 0.2px;
}

.topbar__hint {
  margin-top: 2px;
  font-size: 12px;
  color: var(--c-muted);
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ghostLink {
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.6);
  color: rgba(2, 6, 23, 0.88);
  font-size: 12px;
  text-decoration: none;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.ghostLink:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.35);
  box-shadow: 0 10px 18px rgba(2, 6, 23, 0.06);
}

.frame {
  flex: 1;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 18px;
  padding: 18px;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.sidenav {
  align-self: start;
}

.nav {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 20px 38px rgba(2, 6, 23, 0.05);
}

.nav__item {
  display: block;
  padding: 10px 12px;
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(2, 6, 23, 0);
  background: linear-gradient(180deg, rgba(99, 102, 241, 0), rgba(34, 211, 238, 0));
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease, background 240ms ease;
}

.nav__item:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.25);
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.08), rgba(34, 211, 238, 0.06));
  box-shadow: 0 16px 24px rgba(2, 6, 23, 0.06);
}

.nav__item.router-link-active {
  border-color: rgba(99, 102, 241, 0.5);
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.14), rgba(236, 72, 153, 0.08));
  box-shadow: 0 18px 30px rgba(99, 102, 241, 0.12);
}

.nav__label {
  font-weight: 700;
}

.nav__desc {
  margin-top: 2px;
  font-size: 12px;
  color: var(--c-muted);
}

.content {
  width: 100%;
  min-width: 0;
  overflow-y: auto;
  padding-bottom: 18px;
}

.footer {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  color: var(--c-muted);
  font-size: 12px;
  border-top: 1px solid rgba(2, 6, 23, 0.08);
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.7));
}

@media (max-width: 960px) {
  .topbar {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .frame {
    grid-template-columns: 1fr;
  }

  .sidenav {
    position: static;
  }
}
</style>
