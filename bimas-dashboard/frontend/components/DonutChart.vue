<template>
  <div class="donut-block">
    <div class="donut-label">{{ label }}</div>

    <div class="donut-wrap">
      <canvas ref="canvasRef" />
    </div>

    <div class="legend">
      <div
        v-for="(item, i) in data"
        :key="item.name"
        class="legend-item"
      >
        <span class="legend-dot" :style="{ background: colors[i] }" />
        <span>{{ item.name }}</span>
        <span class="legend-pct">{{ pct(item.value) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js'
Chart.register(DoughnutController, ArcElement, Tooltip)

const props = defineProps({
  label:  { type: String, required: true },
  data:   { type: Array,  default: () => [] }, // [{ name, value }]
  colors: { type: Array,  default: () => ['#5c6b3a','#4a7fa5','#c4a04a','#9e7c2e','#a09d96'] },
})

const canvasRef = ref(null)
let chartInstance = null

const total = computed(() => props.data.reduce((s, d) => s + d.value, 0))
const pct = (v) => total.value ? ((v / total.value) * 100).toFixed(0) : 0

function buildChart() {
  if (!canvasRef.value || !props.data.length) return
  chartInstance?.destroy()

  chartInstance = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      labels: props.data.map(d => d.name),
      datasets: [{
        data:            props.data.map(d => d.value),
        backgroundColor: props.colors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#2e2c28',
          padding: 8,
          cornerRadius: 7,
          callbacks: {
            label: ctx => {
              const t = ctx.dataset.data.reduce((a, b) => a + b, 0)
              return ` ${ctx.label}: ${((ctx.parsed / t) * 100).toFixed(1)}%`
            },
          },
        },
      },
    },
  })
}

watch(() => props.data, () => buildChart(), { deep: true })
onMounted(() => buildChart())
onUnmounted(() => chartInstance?.destroy())
</script>
