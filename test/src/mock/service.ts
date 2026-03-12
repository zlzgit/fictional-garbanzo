import type { DashboardSummary, DatasetInfo, EvaluationRun, ModelInfo, QualityMetrics, RunStatus } from './types'

import { addDaysIsoLocal, nowIsoLocal } from '../utils/time'

// Mock 数据服务：用内存 store 模拟后端接口，页面刷新后会重置（适合纯前端演示/联调前开发）。
type Store = {
  models: ModelInfo[]
  datasets: DatasetInfo[]
  runs: EvaluationRun[]
}

let store: Store | null = null

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function randBetween(rnd: () => number, min: number, max: number) {
  return min + (max - min) * rnd()
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function genMetrics(rnd: () => number): QualityMetrics {
  const accuracy = clamp01(randBetween(rnd, 0.86, 0.99))
  const precision = clamp01(accuracy - randBetween(rnd, 0.01, 0.05))
  const recall = clamp01(accuracy - randBetween(rnd, 0.02, 0.07))
  const f1 = clamp01((2 * precision * recall) / (precision + recall + 1e-6))
  const auc = clamp01(randBetween(rnd, 0.92, 0.995))
  const drift = clamp01(randBetween(rnd, 0.05, 0.22))
  const fairnessDI = clamp01(randBetween(rnd, 0.82, 0.99))
  const p95LatencyMs = Math.round(randBetween(rnd, 160, 340))
  const throughputQps = Math.round(randBetween(rnd, 80, 380))
  const memoryMb = Math.round(randBetween(rnd, 320, 1240))
  return {
    accuracy,
    precision,
    recall,
    f1,
    auc,
    drift,
    fairnessDI,
    p95LatencyMs,
    throughputQps,
    memoryMb,
  }
}

function genStatus(metrics: QualityMetrics): RunStatus {
  const failed = metrics.drift > 0.15 || metrics.p95LatencyMs > 250 || metrics.fairnessDI < 0.9 || metrics.f1 < 0.9
  return failed ? 'failed' : 'passed'
}

function ensureStore(): Store {
  if (store) return store

  const rnd = mulberry32(20260211)

  const models: ModelInfo[] = [
    {
      id: 'm_001',
      name: 'RiskScore-GNN',
      version: 'v2.4.1',
      taskType: 'Graph',
      framework: 'PyTorch',
      owner: 'MLOps',
      createdAt: '2025-12-18 14:12',
      updatedAt: '2026-02-01 18:40',
      params: { layers: 8, hidden: 256, dropout: 0.15, lr: 0.0008, quantized: false },
    },
    {
      id: 'm_002',
      name: 'Fraud-Transformer',
      version: 'v1.9.0',
      taskType: 'NLP',
      framework: 'TensorFlow',
      owner: 'NLP Lab',
      createdAt: '2025-11-02 09:31',
      updatedAt: '2026-02-09 09:12',
      params: { layers: 12, heads: 12, dim: 768, lr: 0.0002, fp16: true },
    },
    {
      id: 'm_003',
      name: 'Vision-DefectNet',
      version: 'v3.1.2',
      taskType: 'CV',
      framework: 'ONNXRuntime',
      owner: 'Vision',
      createdAt: '2025-10-07 20:06',
      updatedAt: '2026-02-10 21:36',
      params: { backbone: 'ConvNeXt-T', inputSize: 512, batch: 32, int8: true },
    },
    {
      id: 'm_004',
      name: 'CreditTabular-XGB',
      version: 'v5.0.0',
      taskType: 'Tabular',
      framework: 'XGBoost',
      owner: 'Risk',
      createdAt: '2025-09-18 16:09',
      updatedAt: '2026-01-22 10:04',
      params: { maxDepth: 7, nEstimators: 1200, subsample: 0.78, colsample: 0.82 },
    },
  ]

  const datasets: DatasetInfo[] = [
    { id: 'prod_7d', name: 'prod_7d', sampleCount: 2_400_000, featureCount: 128, updatedAt: '2026-02-11 07:20' },
    { id: 'shadow_traffic', name: 'shadow_traffic', sampleCount: 780_000, featureCount: 156, updatedAt: '2026-02-10 23:10' },
    { id: 'offline_benchmark_v5', name: 'offline_benchmark_v5', sampleCount: 120_000, featureCount: 96, updatedAt: '2026-02-09 12:05' },
  ]

  const runs: EvaluationRun[] = []
  const base = new Date()
  for (let i = 13; i >= 1; i--) {
    const model = models[Math.floor(rnd() * models.length)]!
    const dataset = datasets[Math.floor(rnd() * datasets.length)]!
    const metrics = genMetrics(rnd)
    const status = genStatus(metrics)
    const createdAt = `${addDaysIsoLocal(base, -i)} ${String(Math.floor(randBetween(rnd, 8, 22))).padStart(2, '0')}:${String(
      Math.floor(randBetween(rnd, 0, 59)),
    ).padStart(2, '0')}`

    const matrix = [
      [Math.floor(randBetween(rnd, 2400, 4200)), Math.floor(randBetween(rnd, 40, 180))],
      [Math.floor(randBetween(rnd, 60, 230)), Math.floor(randBetween(rnd, 1800, 3600))],
    ]

    runs.push({
      id: `run_${createdAt.replace(/[- :]/g, '')}_${String(i).padStart(3, '0')}`,
      createdAt,
      modelId: model.id,
      datasetId: dataset.id,
      status,
      metrics,
      confusionMatrix: { labels: ['negative', 'positive'], matrix },
      notes: status === 'failed' ? ['命中阈值策略：请关注漂移/延迟/公平性'] : ['评估通过：可用于上线/灰度'],
    })
  }

  store = { models, datasets, runs }
  return store
}

export async function listModels() {
  await delay(220)
  return ensureStore().models
}

export async function listDatasets() {
  await delay(180)
  return ensureStore().datasets
}

export async function listRuns() {
  await delay(240)
  return [...ensureStore().runs].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function getRunDetail(runId: string) {
  await delay(200)
  const run = ensureStore().runs.find((r) => r.id === runId)
  if (!run) throw new Error('run not found')
  return run
}

export async function runEvaluation(input: { modelId: string; datasetId: string }) {
  await delay(650)

  const s = ensureStore()
  const rnd = mulberry32(Date.now() % 1_000_000)
  const metrics = genMetrics(rnd)
  const status = genStatus(metrics)
  const createdAt = nowIsoLocal()

  const matrix = [
    [Math.floor(randBetween(rnd, 1800, 4200)), Math.floor(randBetween(rnd, 40, 220))],
    [Math.floor(randBetween(rnd, 80, 360)), Math.floor(randBetween(rnd, 1400, 3600))],
  ]

  const notes: string[] = []
  if (metrics.drift > 0.15) notes.push(`漂移 ${metrics.drift.toFixed(3)} 超过阈值 0.15`)
  if (metrics.p95LatencyMs > 250) notes.push(`p95 延迟 ${metrics.p95LatencyMs}ms 超过阈值 250ms`)
  if (metrics.fairnessDI < 0.9) notes.push(`公平性 DI ${metrics.fairnessDI.toFixed(3)} 低于阈值 0.90`)
  if (notes.length === 0) notes.push('评估通过：指标满足阈值策略')

  const run: EvaluationRun = {
    id: `run_${createdAt.replace(/[- :]/g, '')}_${String(Math.floor(rnd() * 900) + 100)}`,
    createdAt,
    modelId: input.modelId,
    datasetId: input.datasetId,
    status,
    metrics,
    confusionMatrix: { labels: ['negative', 'positive'], matrix },
    notes,
  }

  s.runs.unshift(run)
  return run
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await delay(180)
  const s = ensureStore()
  const runs = [...s.runs].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  const recentRuns = runs.slice(0, 6).map((r) => ({ id: r.id, createdAt: r.createdAt, status: r.status, modelId: r.modelId, datasetId: r.datasetId }))

  const passed = runs.filter((r) => r.status === 'passed').length
  const fail = runs.filter((r) => r.status === 'failed').length
  const passRate = runs.length ? passed / runs.length : 0

  const latest = runs[0]?.metrics
  const radar = [
    { name: '准确性', value: (latest?.accuracy ?? 0.93) * 100 },
    { name: '鲁棒性', value: (1 - (latest?.drift ?? 0.12)) * 100 },
    { name: '稳定性', value: (latest?.auc ?? 0.97) * 100 },
    { name: '效率', value: Math.max(0, 100 - ((latest?.p95LatencyMs ?? 220) - 120) * 0.4) },
    { name: '公平性', value: (latest?.fairnessDI ?? 0.93) * 100 },
  ]

  const trend = runs
    .slice(0, 14)
    .reverse()
    .map((r) => ({
      t: r.createdAt.slice(5, 10),
      f1: r.metrics.f1,
      auc: r.metrics.auc,
      p95: r.metrics.p95LatencyMs,
      drift: r.metrics.drift,
    }))

  return {
    kpis: [
      { label: '当前模型数量', value: String(s.models.length), hint: '包含生产 / 灰度 / 预发布' },
      { label: '近 14 天评估', value: String(runs.length), hint: '自动 + 手动触发' },
      { label: '失败/告警', value: String(fail), hint: '漂移 / 延迟 / 偏差等阈值命中' },
      { label: '通过率', value: `${(passRate * 100).toFixed(1)}%`, hint: '阈值策略生效中' },
    ],
    radar,
    trend,
    recentRuns,
  }
}

export async function getModelById(modelId: string) {
  await delay(60)
  return ensureStore().models.find((m) => m.id === modelId) ?? null
}

export async function getDatasetById(datasetId: string) {
  await delay(60)
  return ensureStore().datasets.find((d) => d.id === datasetId) ?? null
}
