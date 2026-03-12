export type ModelTaskType = 'CV' | 'NLP' | 'Tabular' | 'Graph'

export type ModelFramework = 'PyTorch' | 'TensorFlow' | 'ONNXRuntime' | 'XGBoost'

export type ModelInfo = {
  id: string
  name: string
  version: string
  taskType: ModelTaskType
  framework: ModelFramework
  owner: string
  createdAt: string
  updatedAt: string
  params: Record<string, string | number | boolean>
}

export type DatasetInfo = {
  id: string
  name: string
  sampleCount: number
  featureCount: number
  updatedAt: string
}

export type RunStatus = 'passed' | 'failed' | 'running'

export type QualityMetrics = {
  accuracy: number
  precision: number
  recall: number
  f1: number
  auc: number
  drift: number
  fairnessDI: number
  p95LatencyMs: number
  throughputQps: number
  memoryMb: number
}

export type ConfusionMatrix = {
  labels: string[]
  matrix: number[][]
}

export type EvaluationRun = {
  id: string
  createdAt: string
  modelId: string
  datasetId: string
  status: RunStatus
  metrics: QualityMetrics
  confusionMatrix: ConfusionMatrix
  notes: string[]
}

export type DashboardSummary = {
  kpis: Array<{ label: string; value: string; hint: string }>
  radar: Array<{ name: string; value: number }>
  trend: Array<{ t: string; f1: number; auc: number; p95: number; drift: number }>
  recentRuns: Array<Pick<EvaluationRun, 'id' | 'createdAt' | 'status' | 'modelId' | 'datasetId'>>
}

