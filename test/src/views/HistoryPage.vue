<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import PanelCard from '../components/ui/PanelCard.vue'

import type { DatasetInfo, EvaluationRun, ModelInfo } from '../mock/types'
import { listDatasets, listModels, listRuns } from '../mock/service'
import { formatMs, formatNumber, formatScore } from '../utils/format'

const keyword = ref('')

const isLoading = ref(true)
const rows = ref<EvaluationRun[]>([])
const models = ref<ModelInfo[]>([])
const datasets = ref<DatasetInfo[]>([])

const detailDialog = ref<HTMLDialogElement | null>(null)
const active = ref<EvaluationRun | null>(null)

function openDetail(r: EvaluationRun) {
  active.value = r
  detailDialog.value?.showModal()
}

function closeDetail() {
  detailDialog.value?.close()
}

function modelLabel(modelId: string) {
  const m = models.value.find((x) => x.id === modelId)
  return m ? `${m.name} ${m.version}` : modelId
}

function datasetLabel(datasetId: string) {
  const d = datasets.value.find((x) => x.id === datasetId)
  return d ? d.name : datasetId
}

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return rows.value
  return rows.value.filter((r) =>
    [r.id, r.modelId, r.datasetId, modelLabel(r.modelId), datasetLabel(r.datasetId), r.status]
      .map((v) => String(v).toLowerCase())
      .some((v) => v.includes(kw)),
  )
})

function statusLabel(s: EvaluationRun['status']) {
  if (s === 'passed') return '通过'
  if (s === 'failed') return '失败'
  return '运行中'
}

onMounted(async () => {
  isLoading.value = true
  try {
    const [ms, ds, rs] = await Promise.all([listModels(), listDatasets(), listRuns()])
    models.value = ms
    datasets.value = ds
    rows.value = rs
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="page">
    <PanelCard title="评估历史" subtitle="记录、筛选与回放（Mock 数据）">
      <div class="toolbar">
        <label class="search">
          <span class="search__label">搜索</span>
          <input v-model="keyword" class="search__input" placeholder="run id / 模型 / 数据集 / 状态" />
        </label>
        <div class="toolbar__hint">{{ isLoading ? '加载中…' : `共 ${filtered.length} 条记录` }}</div>
      </div>

      <div class="list">
        <div v-for="r in filtered" :key="r.id" class="row">
          <div class="row__left">
            <div class="row__id">{{ r.id }}</div>
            <div class="row__meta">{{ r.createdAt }} · {{ modelLabel(r.modelId) }} · {{ datasetLabel(r.datasetId) }}</div>
          </div>
          <div class="row__mid">
            <span class="badge" :class="`badge--${r.status}`">{{ statusLabel(r.status) }}</span>
          </div>
          <div class="row__right">
            <div class="metric">
              <div class="metric__k">F1</div>
              <div class="metric__v">{{ r.status === 'running' ? '—' : formatScore(r.metrics.f1) }}</div>
            </div>
            <div class="metric">
              <div class="metric__k">AUC</div>
              <div class="metric__v">{{ r.status === 'running' ? '—' : formatScore(r.metrics.auc) }}</div>
            </div>
            <div class="metric">
              <div class="metric__k">p95</div>
              <div class="metric__v">{{ r.status === 'running' ? '—' : formatMs(r.metrics.p95LatencyMs) }}</div>
            </div>
            <button class="textBtn" @click="openDetail(r)">查看</button>
          </div>
        </div>
        <div v-if="!isLoading && filtered.length === 0" class="empty">暂无记录</div>
      </div>
    </PanelCard>

    <dialog ref="detailDialog" class="dialog" @click.self="closeDetail">
      <div class="dialog__card">
        <div class="dialog__top">
          <div>
            <div class="dialog__title">评估详情</div>
            <div class="dialog__sub">{{ active?.id }} · {{ active?.createdAt }}</div>
          </div>
          <button class="iconBtn" @click="closeDetail" aria-label="关闭">×</button>
        </div>

        <div class="dialog__grid">
          <div class="kv">
            <div class="kv__k">模型</div>
            <div class="kv__v">{{ active ? modelLabel(active.modelId) : '—' }}</div>
          </div>
          <div class="kv">
            <div class="kv__k">数据集</div>
            <div class="kv__v">{{ active ? datasetLabel(active.datasetId) : '—' }}</div>
          </div>
          <div class="kv">
            <div class="kv__k">状态</div>
            <div class="kv__v">
              <span v-if="active" class="badge" :class="`badge--${active.status}`">{{ statusLabel(active.status) }}</span>
            </div>
          </div>
        </div>

        <div v-if="active" class="metrics">
          <div class="metrics__title">核心指标</div>
          <div class="metrics__grid">
            <div class="m">
              <div class="m__k">准确率</div>
              <div class="m__v">{{ formatScore(active.metrics.accuracy) }}</div>
            </div>
            <div class="m">
              <div class="m__k">精确率</div>
              <div class="m__v">{{ formatScore(active.metrics.precision) }}</div>
            </div>
            <div class="m">
              <div class="m__k">召回率</div>
              <div class="m__v">{{ formatScore(active.metrics.recall) }}</div>
            </div>
            <div class="m">
              <div class="m__k">F1</div>
              <div class="m__v">{{ formatScore(active.metrics.f1) }}</div>
            </div>
            <div class="m">
              <div class="m__k">AUC</div>
              <div class="m__v">{{ formatScore(active.metrics.auc) }}</div>
            </div>
            <div class="m">
              <div class="m__k">漂移</div>
              <div class="m__v">{{ formatScore(active.metrics.drift) }}</div>
            </div>
            <div class="m">
              <div class="m__k">公平性 (DI)</div>
              <div class="m__v">{{ formatScore(active.metrics.fairnessDI) }}</div>
            </div>
            <div class="m">
              <div class="m__k">p95 延迟</div>
              <div class="m__v">{{ formatMs(active.metrics.p95LatencyMs) }}</div>
            </div>
            <div class="m">
              <div class="m__k">吞吐 (QPS)</div>
              <div class="m__v">{{ formatNumber(active.metrics.throughputQps) }}</div>
            </div>
            <div class="m">
              <div class="m__k">内存</div>
              <div class="m__v">{{ formatNumber(active.metrics.memoryMb) }}MB</div>
            </div>
          </div>
        </div>

        <div v-if="active" class="notes">
          <div class="notes__title">备注 / 告警</div>
          <ul class="notes__list">
            <li v-for="n in active.notes" :key="n">{{ n }}</li>
          </ul>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.search {
  display: grid;
  gap: 8px;
}

.search__label {
  font-size: 12px;
  font-weight: 740;
  color: rgba(2, 6, 23, 0.62);
}

.search__input {
  width: min(560px, 100%);
  border-radius: 14px;
  border: 1px solid rgba(2, 6, 23, 0.12);
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 12px;
  font-size: 13px;
  outline: none;
  transition: box-shadow 180ms ease, border-color 180ms ease;
}

.search__input:focus {
  border-color: rgba(34, 211, 238, 0.6);
  box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.14);
}

.toolbar__hint {
  color: var(--c-muted);
  font-size: 12px;
}

.list {
  display: grid;
  gap: 10px;
}

.row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px 12px;
  border-radius: 16px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.74);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.row:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.28);
  box-shadow: 0 18px 34px rgba(2, 6, 23, 0.06);
}

.row__id {
  font-weight: 780;
}

.row__meta {
  margin-top: 3px;
  font-size: 12px;
  color: var(--c-muted);
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 760;
  border: 1px solid rgba(2, 6, 23, 0.1);
  background: rgba(255, 255, 255, 0.7);
}

.badge--passed {
  border-color: rgba(34, 197, 94, 0.28);
  background: rgba(34, 197, 94, 0.1);
}

.badge--failed {
  border-color: rgba(244, 63, 94, 0.3);
  background: rgba(244, 63, 94, 0.1);
}

.badge--running {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.1);
}

.row__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metric {
  min-width: 76px;
}

.metric__k {
  font-size: 11px;
  color: var(--c-muted);
}

.metric__v {
  margin-top: 3px;
  font-weight: 800;
}

.textBtn {
  appearance: none;
  background: transparent;
  border: 1px solid rgba(2, 6, 23, 0.12);
  color: rgba(2, 6, 23, 0.84);
  cursor: pointer;
  font-weight: 800;
  padding: 8px 10px;
  border-radius: 12px;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.textBtn:hover {
  transform: translateY(-1px);
  border-color: rgba(34, 211, 238, 0.5);
  box-shadow: 0 12px 24px rgba(2, 6, 23, 0.06);
}

.empty {
  padding: 18px 12px;
  border-radius: 16px;
  border: 1px dashed rgba(2, 6, 23, 0.16);
  color: var(--c-muted);
  text-align: center;
}

.dialog {
  width: min(980px, calc(100vw - 28px));
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

.dialog__grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.kv {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.7);
}

.kv__k {
  font-size: 12px;
  color: var(--c-muted);
}

.kv__v {
  margin-top: 6px;
  font-weight: 800;
}

.metrics {
  margin-top: 14px;
}

.metrics__title {
  font-weight: 820;
  margin-bottom: 10px;
}

.metrics__grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.m {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.7);
}

.m__k {
  font-size: 12px;
  color: var(--c-muted);
}

.m__v {
  margin-top: 6px;
  font-weight: 880;
}

.notes {
  margin-top: 14px;
}

.notes__title {
  font-weight: 820;
  margin-bottom: 10px;
}

.notes__list {
  margin: 0;
  padding-left: 18px;
  color: rgba(2, 6, 23, 0.8);
  line-height: 1.65;
}

@media (max-width: 960px) {
  .row {
    grid-template-columns: 1fr;
    align-items: start;
  }
  .row__right {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .dialog__grid {
    grid-template-columns: 1fr;
  }

  .metrics__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
