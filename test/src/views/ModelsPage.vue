<script setup lang="ts">
import { onMounted, ref } from 'vue'

import PanelCard from '../components/ui/PanelCard.vue'
import NeonButton from '../components/ui/NeonButton.vue'

import type { ModelInfo } from '../mock/types'
import { listModels } from '../mock/service'

const isLoading = ref(true)
const rows = ref<ModelInfo[]>([])

function taskTypeLabel(v: ModelInfo['taskType']) {
  if (v === 'CV') return '视觉'
  if (v === 'NLP') return '文本'
  if (v === 'Tabular') return '表格'
  return '图'
}

const detailDialog = ref<HTMLDialogElement | null>(null)
const active = ref<ModelInfo | null>(null)

function openDetail(m: ModelInfo) {
  active.value = m
  detailDialog.value?.showModal()
}

function closeDetail() {
  detailDialog.value?.close()
}

onMounted(async () => {
  isLoading.value = true
  try {
    rows.value = await listModels()
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="page">
    <PanelCard title="模型库" subtitle="模型版本、框架、Owner 与参数概览（Mock 数据）">
      <template #actions>
        <NeonButton as="a" href="/model_q/evaluate" size="sm">去评估</NeonButton>
      </template>

      <div class="tableWrap">
        <table class="table">
          <thead>
            <tr>
              <th>模型</th>
              <th>版本</th>
              <th>类型</th>
              <th>框架</th>
              <th>负责人</th>
              <th>更新时间</th>
              <th style="width: 120px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td>
                <div class="name">
                  <div class="name__main">{{ r.name }}</div>
                  <div class="name__sub">{{ r.id }}</div>
                </div>
              </td>
              <td>
                <span class="pill">{{ r.version }}</span>
              </td>
              <td>{{ taskTypeLabel(r.taskType) }}</td>
              <td>{{ r.framework }}</td>
              <td>{{ r.owner }}</td>
              <td class="muted">{{ r.updatedAt }}</td>
              <td>
                <button class="textBtn" @click="openDetail(r)">详情</button>
                <button class="textBtn textBtn--danger">下线</button>
              </td>
            </tr>
            <tr v-if="!isLoading && rows.length === 0">
              <td colspan="7" class="empty">暂无模型</td>
            </tr>
          </tbody>
        </table>
      </div>
    </PanelCard>

    <dialog ref="detailDialog" class="dialog" @click.self="closeDetail">
      <div class="dialog__card">
        <div class="dialog__top">
          <div>
            <div class="dialog__title">{{ active?.name ?? '—' }}</div>
            <div class="dialog__sub">{{ active?.id }} · {{ active?.version }} · {{ active?.framework }}</div>
          </div>
          <button class="iconBtn" @click="closeDetail" aria-label="关闭">×</button>
        </div>

        <div class="dialog__grid">
          <div class="kv">
            <div class="kv__k">任务类型</div>
            <div class="kv__v">{{ active ? taskTypeLabel(active.taskType) : '—' }}</div>
          </div>
          <div class="kv">
            <div class="kv__k">负责人</div>
            <div class="kv__v">{{ active?.owner ?? '—' }}</div>
          </div>
          <div class="kv">
            <div class="kv__k">创建时间</div>
            <div class="kv__v">{{ active?.createdAt ?? '—' }}</div>
          </div>
          <div class="kv">
            <div class="kv__k">更新时间</div>
            <div class="kv__v">{{ active?.updatedAt ?? '—' }}</div>
          </div>
        </div>

        <div class="params">
          <div class="params__title">模型参数</div>
          <div class="params__grid">
            <div v-for="(v, k) in active?.params ?? {}" :key="k" class="param">
              <div class="param__k">{{ k }}</div>
              <div class="param__v">{{ v }}</div>
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
}

.tableWrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.78);
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
}

th,
td {
  padding: 12px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(2, 6, 23, 0.06);
  font-size: 13px;
}

th {
  font-size: 12px;
  color: rgba(2, 6, 23, 0.64);
  font-weight: 740;
  letter-spacing: 0.2px;
}

tbody tr:hover {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.08), rgba(34, 211, 238, 0.04), rgba(255, 255, 255, 0));
}

.name__main {
  font-weight: 760;
}

.name__sub {
  margin-top: 2px;
  font-size: 12px;
  color: var(--c-muted);
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.28);
  background: rgba(99, 102, 241, 0.1);
  font-weight: 700;
  font-size: 12px;
}

.muted {
  color: var(--c-muted);
}

.textBtn {
  appearance: none;
  background: transparent;
  border: none;
  color: rgba(2, 6, 23, 0.82);
  cursor: pointer;
  font-weight: 700;
  padding: 6px 8px;
  border-radius: 10px;
  transition: background 160ms ease, transform 160ms ease;
}

.textBtn:hover {
  background: rgba(2, 6, 23, 0.06);
  transform: translateY(-1px);
}

.textBtn--danger {
  color: rgba(225, 29, 72, 0.9);
}

.empty {
  padding: 24px 12px;
  text-align: center;
  color: var(--c-muted);
}

.dialog {
  width: min(860px, calc(100vw - 28px));
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.params {
  margin-top: 14px;
}

.params__title {
  font-weight: 820;
  margin-bottom: 10px;
}

.params__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.param {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(2, 6, 23, 0.08);
  background: rgba(255, 255, 255, 0.7);
}

.param__k {
  font-size: 12px;
  color: var(--c-muted);
}

.param__v {
  margin-top: 6px;
  font-weight: 820;
}

@media (max-width: 980px) {
  .dialog__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .params__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .params__grid {
    grid-template-columns: 1fr;
  }
}
</style>
