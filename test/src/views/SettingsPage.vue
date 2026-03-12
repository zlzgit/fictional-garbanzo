<script setup lang="ts">
import { onMounted, ref } from 'vue'

import PanelCard from '../components/ui/PanelCard.vue'
import NeonButton from '../components/ui/NeonButton.vue'

const STORAGE_KEY = 'model_q.thresholds'

const defaults = {
  drift: 0.15,
  p95: 250,
  fairnessDI: 0.9,
}

const thresholdDrift = ref(defaults.drift)
const thresholdP95 = ref(defaults.p95)
const thresholdFairness = ref(defaults.fairnessDI)

const notice = ref('')
let noticeTimer: number | null = null

function pushNotice(text: string) {
  notice.value = text
  if (noticeTimer) window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => {
    notice.value = ''
    noticeTimer = null
  }, 1800)
}

function saveSettings() {
  const payload = {
    drift: Number(thresholdDrift.value),
    p95: Number(thresholdP95.value),
    fairnessDI: Number(thresholdFairness.value),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  pushNotice('已保存到本地（localStorage）')
}

function resetDefaults() {
  thresholdDrift.value = defaults.drift
  thresholdP95.value = defaults.p95
  thresholdFairness.value = defaults.fairnessDI
  localStorage.removeItem(STORAGE_KEY)
  pushNotice('已恢复默认值')
}

onMounted(() => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return
  try {
    const parsed = JSON.parse(raw) as Partial<{ drift: number; p95: number; fairnessDI: number }>
    if (typeof parsed.drift === 'number') thresholdDrift.value = parsed.drift
    if (typeof parsed.p95 === 'number') thresholdP95.value = parsed.p95
    if (typeof parsed.fairnessDI === 'number') thresholdFairness.value = parsed.fairnessDI
    pushNotice('已从本地加载上次保存的阈值')
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
})
</script>

<template>
  <div class="page">
    <PanelCard title="阈值策略" subtitle="阈值仅用于 Mock 演示，不会写入后端">
      <div class="grid">
        <label class="field">
          <div class="field__label">漂移阈值</div>
          <input v-model.number="thresholdDrift" class="field__control" type="number" min="0" max="1" step="0.01" />
          <div class="field__hint">建议 0.10 ~ 0.20，越小越敏感</div>
        </label>
        <label class="field">
          <div class="field__label">p95 延迟阈值 (ms)</div>
          <input v-model.number="thresholdP95" class="field__control" type="number" min="50" step="1" />
          <div class="field__hint">建议 180 ~ 300，结合 SLA 调整</div>
        </label>
        <label class="field">
          <div class="field__label">公平性阈值 (DI)</div>
          <input
            v-model.number="thresholdFairness"
            class="field__control"
            type="number"
            min="0"
            max="1"
            step="0.01"
          />
          <div class="field__hint">1.0 越接近越公平</div>
        </label>
      </div>

      <div class="actions">
        <NeonButton size="sm" @click="saveSettings">保存设置</NeonButton>
        <NeonButton variant="ghost" size="sm" @click="resetDefaults">恢复默认</NeonButton>
      </div>
      <div v-if="notice" class="notice">{{ notice }}</div>
    </PanelCard>

    <PanelCard title="体验偏好" subtitle="控制交互效果与渲染策略">
      <div class="tips">
        <div class="tips__item">已启用路由懒加载，首屏更快</div>
        <div class="tips__item">图表组件将按需渲染，并自动适配尺寸</div>
        <div class="tips__item">页面滚动使用浏览器原生滚动轴</div>
      </div>
    </PanelCard>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  display: grid;
  gap: 14px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.field__label {
  font-size: 12px;
  font-weight: 740;
  color: rgba(2, 6, 23, 0.62);
  margin-bottom: 8px;
}

.field__control {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(2, 6, 23, 0.12);
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 12px;
  font-size: 13px;
  outline: none;
  transition: box-shadow 180ms ease, border-color 180ms ease;
}

.field__control:focus {
  border-color: rgba(236, 72, 153, 0.6);
  box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.14);
}

.field__hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--c-muted);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.notice {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(34, 211, 238, 0.28);
  background: rgba(34, 211, 238, 0.12);
  font-weight: 740;
  color: rgba(2, 6, 23, 0.84);
}

.tips {
  display: grid;
  gap: 10px;
}

.tips__item {
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.72);
  font-weight: 700;
}

@media (max-width: 1100px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
