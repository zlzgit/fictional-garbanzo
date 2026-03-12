<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { ECharts, EChartsOption } from 'echarts'

const props = withDefaults(
  defineProps<{
    option: EChartsOption
    height?: number
  }>(),
  {
    height: 320,
  },
)

const el = ref<HTMLDivElement | null>(null)
let chart: ECharts | null = null
let ro: ResizeObserver | null = null
let echartsMod: typeof import('echarts') | null = null
let renderToken = 0

async function ensureECharts() {
  if (echartsMod) return echartsMod
  echartsMod = await import('echarts')
  return echartsMod
}

async function render() {
  if (!el.value) return
  const token = ++renderToken
  const echarts = await ensureECharts()
  if (!el.value) return
  if (token !== renderToken) return
  if (!chart) chart = echarts.init(el.value, undefined, { renderer: 'canvas' })
  chart.setOption(props.option, { notMerge: true })
}

onMounted(() => {
  void render()
  if (el.value) {
    ro = new ResizeObserver(() => chart?.resize())
    ro.observe(el.value)
  }
})

watch(
  () => props.option,
  () => void render(),
  { deep: true },
)

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="el" class="chart" :style="{ height: `${height}px` }" />
</template>

<style scoped>
.chart {
  width: 100%;
  border-radius: 16px;
}
</style>
