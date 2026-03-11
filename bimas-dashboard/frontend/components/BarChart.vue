<template>
  <div class="flex flex-col h-full gap-1.5 p-3">
    <div class="text-xs font-bold tracking-widest uppercase flex-shrink-0" style="color: var(--text-muted); letter-spacing: 1.2px">
      Top 10 Provinsi
    </div>
    <div class="flex-1 relative min-h-0">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>

<script setup>
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps({ data: { type: Array, default: () => [] } })
const canvasRef = ref(null)
let chartInstance = null

const COLORS = [
  '#5c6b3a','#5c6b3a','#5c6b3a',
  '#7a8c4e','#7a8c4e','#7a8c4e',
  '#9aaa6a','#9aaa6a',
  '#4a7fa5','#6899bb',
]

function abbrev(name) {
  return name
    .replace('Sulawesi', 'Sul.')
    .replace('Kalimantan', 'Kal.')
    .replace('Sumatera', 'Sum.')
    .replace('Nusa Tenggara', 'NT')
    .replace('Kepulauan', 'Kep.')
}

function buildChart() {
  if (!canvasRef.value || !props.data.length) return
  chartInstance?.destroy()
  chartInstance = new Chart(canvasRef.value, {
    type: 'bar',
    data: {
      labels: props.data.map(d => abbrev(d.name)),
      datasets: [{
        data:            props.data.map(d => d.total),
        backgroundColor: COLORS.slice(0, props.data.length),
        borderRadius:    4,
        borderSkipped:   false,
      }],
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#2e2c28',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: ctx => `  ${ctx.parsed.x} penyuluh`,
            title: ctx => props.data[ctx[0].dataIndex]?.name ?? '',
          },
        },
      },
      scales: {
        x: {
          grid:  { color: '#eeece8' },
          ticks: { font: { size: 9, family: 'DM Sans' }, color: '#8a8880' },
        },
        y: {
          grid:  { display: false },
          ticks: { font: { size: 9.5, family: 'DM Sans', weight: '500' }, color: '#3a3830' },
        },
      },
      layout: { padding: { right: 8 } },
    },
  })
}

watch(() => props.data, () => buildChart(), { deep: true })
onMounted(() => buildChart())
onUnmounted(() => chartInstance?.destroy())
</script>
