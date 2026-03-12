<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import PanelCard from '../components/ui/PanelCard.vue'
import NeonButton from '../components/ui/NeonButton.vue'
import EChart from '../components/charts/EChart.vue'

import type { EChartsOption } from 'echarts'

import type { DashboardSummary } from '../mock/types'
import { getDashboardSummary } from '../mock/service'

const isLoading = ref(true)
const summary = ref<DashboardSummary | null>(null)

function statusLabel(s: 'passed' | 'failed' | 'running') {
  if (s === 'passed') return '通过'
  if (s === 'failed') return '失败'
  return '运行中'
}

const radarOption = computed((): EChartsOption => {
  const radar = summary.value?.radar ?? []
  return {
    radar: {
      radius: '62%',
      indicator: radar.map((d) => ({ name: d.name, max: 100 })),
      splitNumber: 4,
      axisName: { color: 'rgba(2,6,23,0.72)', fontWeight: 700 },
      splitLine: { lineStyle: { color: 'rgba(2,6,23,0.08)' } },
      splitArea: { areaStyle: { color: ['rgba(99,102,241,0.06)', 'rgba(34,211,238,0.04)'] } },
      axisLine: { lineStyle: { color: 'rgba(2,6,23,0.10)' } },
    },
    tooltip: { trigger: 'item' as const },
    series: [
      {
        type: 'radar' as const,
        symbol: 'circle',
        symbolSize: 5,
        data: [
          {
            value: radar.map((d) => Number(d.value.toFixed(1))),
            name: '当前版本',
            areaStyle: { color: 'rgba(99,102,241,0.22)' },
            lineStyle: { width: 2, color: 'rgba(99,102,241,0.95)' },
            itemStyle: { color: 'rgba(236,72,153,0.95)' },
          },
        ],
      },
    ],
  }
})

const trendOption = computed((): EChartsOption => {
  const t = summary.value?.trend ?? []
  return {
    grid: { left: 40, right: 18, top: 28, bottom: 36 },
    tooltip: { trigger: 'axis' as const },
    legend: { top: 0, left: 0, textStyle: { color: 'rgba(2,6,23,0.72)', fontWeight: 700 } },
    xAxis: {
      type: 'category' as const,
      data: t.map((x) => x.t),
      axisLine: { lineStyle: { color: 'rgba(2,6,23,0.14)' } },
      axisLabel: { color: 'rgba(2,6,23,0.56)' },
    },
    yAxis: [
      {
        type: 'value' as const,
        min: 0.8,
        max: 1,
        axisLabel: { color: 'rgba(2,6,23,0.56)' },
        splitLine: { lineStyle: { color: 'rgba(2,6,23,0.06)' } },
      },
      {
        type: 'value' as const,
        axisLabel: { color: 'rgba(2,6,23,0.56)' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'F1',
        type: 'line' as const,
        smooth: true,
        showSymbol: false,
        data: t.map((x) => Number(x.f1.toFixed(3))),
        lineStyle: { width: 2, color: 'rgba(99,102,241,0.95)' },
        areaStyle: { color: 'rgba(99,102,241,0.12)' },
      },
      {
        name: 'AUC',
        type: 'line' as const,
        smooth: true,
        showSymbol: false,
        data: t.map((x) => Number(x.auc.toFixed(3))),
        lineStyle: { width: 2, color: 'rgba(34,211,238,0.95)' },
        areaStyle: { color: 'rgba(34,211,238,0.10)' },
      },
      {
        name: '漂移',
        type: 'bar' as const,
        yAxisIndex: 1,
        data: t.map((x) => Number(x.drift.toFixed(3))),
        itemStyle: { color: 'rgba(236,72,153,0.55)', borderRadius: [8, 8, 0, 0] },
      },
    ],
  }
})

onMounted(async () => {
  isLoading.value = true
  try {
    summary.value = await getDashboardSummary()
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="page">
    <div class="hero">
      <div class="hero__left">
        <div class="hero__title">模型质量评估 · 控制台</div>
        <div class="hero__sub">
          全链路指标可视化、历史追踪与阈值策略。无需后端服务即可体验完整流程（Mock 数据）。
        </div>
      </div>
      <div class="hero__right">
        <NeonButton as="a" href="/model_q/evaluate">开始评估</NeonButton>
        <NeonButton as="a" variant="ghost" href="/model_q/models">浏览模型库</NeonButton>
      </div>
    </div>

    <div class="kpiGrid">
      <PanelCard v-for="k in summary?.kpis ?? []" :key="k.label">
        <div class="kpi">
          <div class="kpi__label">{{ k.label }}</div>
          <div class="kpi__value">{{ k.value }}</div>
          <div class="kpi__hint">{{ k.hint }}</div>
        </div>
      </PanelCard>
      <PanelCard v-if="isLoading">
        <div class="kpi">
          <div class="kpi__label">加载中</div>
          <div class="kpi__value">…</div>
          <div class="kpi__hint">正在生成 Mock 数据</div>
        </div>
      </PanelCard>
    </div>

    <div class="grid">
      <PanelCard title="质量维度雷达" subtitle="准确性、鲁棒性、稳定性、效率、公平性等多维汇总">
        <div v-if="!summary" class="placeholder">
          <div class="placeholder__title">{{ isLoading ? '加载中…' : '暂无数据' }}</div>
          <div class="placeholder__sub">Mock 数据会在加载完成后生成。</div>
        </div>
        <EChart v-else :option="radarOption" :height="320" />
      </PanelCard>

      <PanelCard title="趋势洞察" subtitle="关键指标随时间变化（滚动窗口 / 版本对比）">
        <div v-if="!summary" class="placeholder">
          <div class="placeholder__title">{{ isLoading ? '加载中…' : '暂无数据' }}</div>
          <div class="placeholder__sub">Mock 数据会在加载完成后生成。</div>
        </div>
        <EChart v-else :option="trendOption" :height="320" />
      </PanelCard>
    </div>

    <PanelCard title="最近评估" subtitle="快速查看最新运行结果">
      <div class="recent">
        <div v-if="!summary" class="recent__empty">{{ isLoading ? '加载中…' : '暂无记录' }}</div>
        <div v-else class="recent__list">
          <div v-for="r in summary.recentRuns" :key="r.id" class="recent__row">
            <div class="recent__id">{{ r.id }}</div>
            <div class="recent__meta">{{ r.createdAt }} · {{ r.modelId }} · {{ r.datasetId }}</div>
            <div class="recent__status" :class="`recent__status--${r.status}`">{{ statusLabel(r.status) }}</div>
          </div>
        </div>
      </div>
    </PanelCard>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  display: grid;
  gap: 18px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background:
    radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.14), transparent 42%),
    radial-gradient(circle at 100% 0%, rgba(34, 211, 238, 0.16), transparent 50%),
    radial-gradient(circle at 70% 100%, rgba(236, 72, 153, 0.12), transparent 46%),
    rgba(255, 255, 255, 0.72);
  box-shadow: 0 28px 70px rgba(2, 6, 23, 0.08);
}

.hero__title {
  font-size: 22px;
  font-weight: 840;
  letter-spacing: 0.2px;
}

.hero__sub {
  margin-top: 8px;
  color: var(--c-muted);
  max-width: 64ch;
  line-height: 1.65;
}

.hero__right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.kpiGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.kpi__label {
  font-size: 12px;
  color: var(--c-muted);
}

.kpi__value {
  margin-top: 10px;
  font-weight: 860;
  font-size: 22px;
  letter-spacing: 0.2px;
}

.kpi__hint {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(2, 6, 23, 0.64);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.placeholder {
  display: grid;
  place-items: center;
  min-height: 280px;
  border-radius: 16px;
  border: 1px dashed rgba(2, 6, 23, 0.16);
  background: rgba(255, 255, 255, 0.35);
}

.placeholder__title {
  font-weight: 760;
}

.placeholder__sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--c-muted);
}

.recent {
  width: 100%;
}

.recent__empty {
  padding: 18px 12px;
  border-radius: 16px;
  border: 1px dashed rgba(2, 6, 23, 0.16);
  color: var(--c-muted);
  text-align: center;
}

.recent__list {
  display: grid;
  gap: 10px;
}

.recent__row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  border-radius: 16px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.72);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.recent__row:hover {
  transform: translateY(-1px);
  border-color: rgba(34, 211, 238, 0.45);
  box-shadow: 0 18px 34px rgba(2, 6, 23, 0.06);
}

.recent__id {
  font-weight: 820;
}

.recent__meta {
  font-size: 12px;
  color: var(--c-muted);
}

.recent__status {
  padding: 8px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 860;
  border: 1px solid rgba(2, 6, 23, 0.12);
  background: rgba(255, 255, 255, 0.8);
}

.recent__status--passed {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.12);
}

.recent__status--failed {
  border-color: rgba(244, 63, 94, 0.4);
  background: rgba(244, 63, 94, 0.12);
}

.recent__status--running {
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(59, 130, 246, 0.12);
}

@media (max-width: 1100px) {
  .kpiGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .hero__right {
    width: 100%;
    justify-content: flex-start;
  }
  .kpiGrid {
    grid-template-columns: 1fr;
  }
}
</style>
