<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import PanelCard from '../components/ui/PanelCard.vue'
import NeonButton from '../components/ui/NeonButton.vue'

import type { DatasetInfo, EvaluationRun, ModelInfo } from '../mock/types'
import { listDatasets, listModels, listRuns, runEvaluation as runEvaluationMock } from '../mock/service'
import { formatMs, formatNumber, formatPercent, formatScore } from '../utils/format'

const isLoading = ref(true)
const models = ref<ModelInfo[]>([])
const datasets = ref<DatasetInfo[]>([])

const selectedModel = ref('')
const selectedDataset = ref('')
const isRunning = ref(false)
const lastRun = ref<EvaluationRun | null>(null)
const compareDialog = ref<HTMLDialogElement | null>(null)
const baseline = ref<EvaluationRun | null>(null)

const runLabel = computed(() => {
  const m = models.value.find((x) => x.id === selectedModel.value)
  const d = datasets.value.find((x) => x.id === selectedDataset.value)
  const mLabel = m ? `${m.name} ${m.version}` : selectedModel.value || '—'
  const dLabel = d ? d.name : selectedDataset.value || '—'
  return `${mLabel} · ${dLabel}`
})

function statusLabel(s: EvaluationRun['status']) {
  if (s === 'passed') return '通过'
  if (s === 'failed') return '失败'
  return '运行中'
}

function cmLabel(v: string) {
  if (v === 'negative') return '负类'
  if (v === 'positive') return '正类'
  return v
}

async function runEvaluation() {
  isRunning.value = true
  try {
    lastRun.value = await runEvaluationMock({ modelId: selectedModel.value, datasetId: selectedDataset.value })
  } finally {
    isRunning.value = false
  }
}

async function openCompare() {
  if (!lastRun.value) return
  const runs = await listRuns()
  baseline.value =
    runs.find((r) => r.id !== lastRun.value?.id && r.modelId === lastRun.value?.modelId && r.datasetId === lastRun.value?.datasetId) ??
    runs.find((r) => r.id !== lastRun.value?.id && r.modelId === lastRun.value?.modelId) ??
    null
  compareDialog.value?.showModal()
}

function closeCompare() {
  compareDialog.value?.close()
}

const deltas = computed(() => {
  if (!lastRun.value || !baseline.value) return null
  const a = lastRun.value.metrics
  const b = baseline.value.metrics
  return {
    f1: a.f1 - b.f1,
    auc: a.auc - b.auc,
    drift: a.drift - b.drift,
    fairnessDI: a.fairnessDI - b.fairnessDI,
    p95LatencyMs: a.p95LatencyMs - b.p95LatencyMs,
  }
})

const alerts = computed(() => {
  if (!lastRun.value) return ['选择模型与数据集后开始评估', '结果将以 Mock 数据生成，可用于 UI 演示与联调前开发']
  if (lastRun.value.notes.length > 0) return lastRun.value.notes
  return []
})

onMounted(async () => {
  isLoading.value = true
  try {
    const [ms, ds] = await Promise.all([listModels(), listDatasets()])
    models.value = ms
    datasets.value = ds
    selectedModel.value = ms[0]?.id ?? ''
    selectedDataset.value = ds[0]?.id ?? ''
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="page">
    <PanelCard title="执行评估" subtitle="选择模型与数据集，生成评估结果（Mock 数据流程）">
      <div class="form">
        <label class="field">
          <div class="field__label">模型</div>
          <select v-model="selectedModel" class="field__control">
            <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }} {{ m.version }}</option>
          </select>
        </label>
        <label class="field">
          <div class="field__label">数据集</div>
          <select v-model="selectedDataset" class="field__control">
            <option v-for="d in datasets" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </label>

        <div class="field field--actions">
          <div class="field__label">操作</div>
          <div class="actions">
            <NeonButton :disabled="isRunning" @click="runEvaluation">
              {{ isRunning ? '评估中…' : '开始评估' }}
            </NeonButton>
            <NeonButton variant="ghost" :disabled="isRunning || !lastRun" @click="openCompare">生成对比报告</NeonButton>
          </div>
        </div>
      </div>
    </PanelCard>

    <div class="grid">
      <PanelCard title="结果概览" :subtitle="runLabel">
        <div v-if="!lastRun" class="placeholder">
          <div class="placeholder__title">{{ isLoading ? '加载中…' : '尚未生成结果' }}</div>
          <div class="placeholder__sub">点击“开始评估”生成一次 Mock 评估结果。</div>
        </div>

        <div v-else class="result">
          <div class="result__kpis">
            <div class="metricCard">
              <div class="metricCard__k">准确率</div>
              <div class="metricCard__v">{{ formatPercent(lastRun.metrics.accuracy, 2) }}</div>
            </div>
            <div class="metricCard">
              <div class="metricCard__k">F1</div>
              <div class="metricCard__v">{{ formatScore(lastRun.metrics.f1) }}</div>
            </div>
            <div class="metricCard">
              <div class="metricCard__k">AUC</div>
              <div class="metricCard__v">{{ formatScore(lastRun.metrics.auc) }}</div>
            </div>
            <div class="metricCard">
              <div class="metricCard__k">漂移</div>
              <div class="metricCard__v">{{ formatScore(lastRun.metrics.drift) }}</div>
            </div>
            <div class="metricCard">
              <div class="metricCard__k">公平性 (DI)</div>
              <div class="metricCard__v">{{ formatScore(lastRun.metrics.fairnessDI) }}</div>
            </div>
            <div class="metricCard">
              <div class="metricCard__k">p95 延迟</div>
              <div class="metricCard__v">{{ formatMs(lastRun.metrics.p95LatencyMs) }}</div>
            </div>
            <div class="metricCard">
              <div class="metricCard__k">吞吐 (QPS)</div>
              <div class="metricCard__v">{{ formatNumber(lastRun.metrics.throughputQps) }}</div>
            </div>
            <div class="metricCard">
              <div class="metricCard__k">内存</div>
              <div class="metricCard__v">{{ formatNumber(lastRun.metrics.memoryMb) }}MB</div>
            </div>
          </div>

          <div class="result__split">
            <div class="cm">
              <div class="cm__title">混淆矩阵</div>
              <div class="cm__tableWrap">
                <table class="cm__table">
                  <thead>
                    <tr>
                      <th />
                      <th v-for="l in lastRun.confusionMatrix.labels" :key="l">预测 {{ cmLabel(l) }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in lastRun.confusionMatrix.matrix" :key="i">
                      <td class="cm__rowHead">真实 {{ cmLabel(lastRun.confusionMatrix.labels[i] ?? '') }}</td>
                      <td v-for="(cell, j) in row" :key="j">{{ formatNumber(cell) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="meta">
              <div class="meta__title">本次评估</div>
              <div class="meta__kv">
                <div class="meta__k">运行 ID</div>
                <div class="meta__v">{{ lastRun.id }}</div>
              </div>
              <div class="meta__kv">
                <div class="meta__k">时间</div>
                <div class="meta__v">{{ lastRun.createdAt }}</div>
              </div>
              <div class="meta__kv">
                <div class="meta__k">状态</div>
                <div class="meta__v">
                  <span class="badge" :class="`badge--${lastRun.status}`">{{ statusLabel(lastRun.status) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PanelCard>
      <PanelCard title="异常与告警" subtitle="阈值策略命中：漂移 / 延迟 / 偏差">
        <ul class="alerts">
          <li v-for="a in alerts" :key="a" class="alerts__item">
            <span class="dot" :class="lastRun?.status === 'failed' ? 'dot--bad' : lastRun ? 'dot--ok' : 'dot--warn'" aria-hidden="true" />
            {{ a }}
          </li>
        </ul>
      </PanelCard>
    </div>

    <dialog ref="compareDialog" class="dialog" @click.self="closeCompare">
      <div class="dialog__card">
        <div class="dialog__top">
          <div>
            <div class="dialog__title">对比报告</div>
            <div class="dialog__sub">同模型（优先同数据集）的最近一次历史记录作为基线</div>
          </div>
          <button class="iconBtn" @click="closeCompare" aria-label="关闭">×</button>
        </div>

        <div class="compare">
          <div class="compare__col">
            <div class="compare__head">当前</div>
            <div class="compare__id">{{ lastRun?.id ?? '—' }}</div>
            <div class="compare__meta">{{ lastRun?.createdAt ?? '—' }}</div>
          </div>
          <div class="compare__col">
            <div class="compare__head">基线</div>
            <div class="compare__id">{{ baseline?.id ?? '暂无' }}</div>
            <div class="compare__meta">{{ baseline?.createdAt ?? '—' }}</div>
          </div>
        </div>

        <div v-if="!baseline" class="compareEmpty">暂无可对比的历史记录。请先在同一模型下多跑几次评估。</div>

        <div v-else class="deltaGrid">
          <div class="delta">
            <div class="delta__k">F1 变化</div>
            <div class="delta__v" :class="deltas && deltas.f1 >= 0 ? 'delta__v--up' : 'delta__v--down'">
              {{ deltas ? deltas.f1.toFixed(3) : '—' }}
            </div>
          </div>
          <div class="delta">
            <div class="delta__k">AUC 变化</div>
            <div class="delta__v" :class="deltas && deltas.auc >= 0 ? 'delta__v--up' : 'delta__v--down'">
              {{ deltas ? deltas.auc.toFixed(3) : '—' }}
            </div>
          </div>
          <div class="delta">
            <div class="delta__k">漂移 变化</div>
            <div class="delta__v" :class="deltas && deltas.drift <= 0 ? 'delta__v--up' : 'delta__v--down'">
              {{ deltas ? deltas.drift.toFixed(3) : '—' }}
            </div>
          </div>
          <div class="delta">
            <div class="delta__k">DI 变化</div>
            <div class="delta__v" :class="deltas && deltas.fairnessDI >= 0 ? 'delta__v--up' : 'delta__v--down'">
              {{ deltas ? deltas.fairnessDI.toFixed(3) : '—' }}
            </div>
          </div>
          <div class="delta">
            <div class="delta__k">p95 变化</div>
            <div class="delta__v" :class="deltas && deltas.p95LatencyMs <= 0 ? 'delta__v--up' : 'delta__v--down'">
              {{ deltas ? `${Math.round(deltas.p95LatencyMs)}ms` : '—' }}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  display: grid;
  gap: 14px;
}

.form {
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
  border-color: rgba(99, 102, 241, 0.55);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.14);
}

.field--actions {
  display: grid;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 14px;
}

.placeholder {
  display: grid;
  place-items: center;
  min-height: 320px;
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

.result {
  display: grid;
  gap: 14px;
}

.result__kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.metricCard {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.72);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.metricCard:hover {
  transform: translateY(-1px);
  border-color: rgba(34, 211, 238, 0.45);
  box-shadow: 0 18px 34px rgba(2, 6, 23, 0.06);
}

.metricCard__k {
  font-size: 12px;
  color: var(--c-muted);
}

.metricCard__v {
  margin-top: 8px;
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 0.2px;
}

.result__split {
  display: grid;
  grid-template-columns: 1.4fr 0.6fr;
  gap: 10px;
}

.cm {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.72);
}

.cm__title {
  font-weight: 820;
  margin-bottom: 10px;
}

.cm__tableWrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 14px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.78);
}

.cm__table {
  width: 100%;
  border-collapse: collapse;
  min-width: 420px;
}

.cm__table th,
.cm__table td {
  padding: 10px 10px;
  border-bottom: 1px solid rgba(2, 6, 23, 0.06);
  font-size: 13px;
}

.cm__table th {
  font-size: 12px;
  color: rgba(2, 6, 23, 0.64);
  font-weight: 740;
}

.cm__rowHead {
  font-weight: 760;
}

.meta {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.72);
}

.meta__title {
  font-weight: 820;
  margin-bottom: 10px;
}

.meta__kv {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 14px;
  border: 1px solid rgba(2, 6, 23, 0.06);
  background: rgba(255, 255, 255, 0.74);
  margin-bottom: 10px;
}

.meta__kv:last-child {
  margin-bottom: 0;
}

.meta__k {
  color: var(--c-muted);
  font-size: 12px;
  font-weight: 740;
}

.meta__v {
  font-weight: 800;
  font-size: 12px;
  text-align: right;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 860;
  border: 1px solid rgba(2, 6, 23, 0.12);
  background: rgba(255, 255, 255, 0.8);
}

.badge--passed {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.12);
}

.badge--failed {
  border-color: rgba(244, 63, 94, 0.4);
  background: rgba(244, 63, 94, 0.12);
}

.badge--running {
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(59, 130, 246, 0.12);
}

.alerts {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.alerts__item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.72);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.25);
  box-shadow: 0 0 0 3px rgba(2, 6, 23, 0.06);
}

.dot--ok {
  background: rgba(34, 197, 94, 1);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.14);
}

.dot--warn {
  background: rgba(245, 158, 11, 1);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.16);
}

.dot--bad {
  background: rgba(244, 63, 94, 1);
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.14);
}

.dialog {
  width: min(920px, calc(100vw - 28px));
  border: none;
  padding: 0;
  background: transparent;
}

.dialog::backdrop {
  background: rgba(2, 6, 23, 0.4);
}

.dialog__card {
  border-radius: 22px;
  border: 1px solid rgba(2, 6, 23, 0.12);
  background:
    radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.16), transparent 46%),
    radial-gradient(circle at 100% 0%, rgba(34, 211, 238, 0.16), transparent 50%),
    rgba(255, 255, 255, 0.9);
  box-shadow: 0 40px 90px rgba(2, 6, 23, 0.16);
  padding: 18px;
}

.dialog__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.dialog__title {
  font-weight: 860;
  font-size: 18px;
}

.dialog__sub {
  margin-top: 4px;
  color: var(--c-muted);
  font-size: 12px;
}

.iconBtn {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(2, 6, 23, 0.12);
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.iconBtn:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.35);
  box-shadow: 0 16px 26px rgba(2, 6, 23, 0.08);
}

.compare {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.compare__col {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.72);
}

.compare__head {
  font-size: 12px;
  color: var(--c-muted);
  font-weight: 760;
}

.compare__id {
  margin-top: 8px;
  font-weight: 860;
}

.compare__meta {
  margin-top: 4px;
  color: var(--c-muted);
  font-size: 12px;
}

.compareEmpty {
  margin-top: 12px;
  padding: 14px 12px;
  border-radius: 16px;
  border: 1px dashed rgba(2, 6, 23, 0.16);
  color: var(--c-muted);
}

.deltaGrid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.delta {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.72);
}

.delta__k {
  font-size: 12px;
  color: var(--c-muted);
}

.delta__v {
  margin-top: 8px;
  font-weight: 920;
  font-size: 18px;
}

.delta__v--up {
  color: rgba(34, 197, 94, 1);
}

.delta__v--down {
  color: rgba(244, 63, 94, 1);
}

@media (max-width: 1100px) {
  .form {
    grid-template-columns: 1fr;
  }
  .grid {
    grid-template-columns: 1fr;
  }

  .result__kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .result__split {
    grid-template-columns: 1fr;
  }

  .deltaGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .compare {
    grid-template-columns: 1fr;
  }
}
</style>
