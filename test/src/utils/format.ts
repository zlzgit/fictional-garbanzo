export function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

export function formatPercent(v: number, digits = 1) {
  const n = clamp01(v) * 100
  return `${n.toFixed(digits)}%`
}

export function formatScore(v: number, digits = 3) {
  return clamp01(v).toFixed(digits)
}

export function formatMs(v: number) {
  if (!Number.isFinite(v)) return '—'
  return `${Math.round(v)}ms`
}

export function formatNumber(v: number) {
  if (!Number.isFinite(v)) return '—'
  return new Intl.NumberFormat('zh-CN').format(v)
}

