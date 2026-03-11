<template>
  <div class="picto-block">
    <div class="picto-label">{{ label }}</div>

    <!-- Icon Grid -->
    <div class="picto-grid">
      <span
        v-for="(cell, i) in grid"
        :key="i"
        class="picto-cell"
        :style="{ color: cell.color, opacity: cell.active ? 1 : 0.1 }"
        :title="cell.name"
      >{{ icon }}</span>
    </div>

    <!-- Legend -->
    <div class="picto-legend">
      <div v-for="item in data" :key="item.name" class="picto-leg-item">
        <span class="picto-leg-dot" :style="{ background: colorOf(item.name) }" />
        <span class="picto-leg-name">{{ item.name }}</span>
        <span class="picto-leg-pct">{{ pct(item.value) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label:  { type: String, required: true },
  icon:   { type: String, default: '👤' },
  data:   { type: Array,  default: () => [] }, // [{ name, value }]
  colors: { type: Array,  default: () => ['#5c6b3a','#4a7fa5','#c4a04a','#9e7c2e','#a09d96'] },
})

const TOTAL_CELLS = 50  // 50 icon = 10x5 grid

const total = computed(() => props.data.reduce((s, d) => s + d.value, 0))

const pct = (v) => total.value ? Math.round((v / total.value) * 100) : 0

const colorOf = (name) => {
  const i = props.data.findIndex(d => d.name === name)
  return props.colors[i] ?? '#a09d96'
}

// Bangun grid 50 cell berdasarkan proporsi
const grid = computed(() => {
  if (!props.data.length || !total.value) return []

  // Hitung berapa cell per kategori (rounded, total = 50)
  let cells = []
  let remaining = TOTAL_CELLS

  props.data.forEach((item, i) => {
    const isLast = i === props.data.length - 1
    const count  = isLast
      ? remaining
      : Math.round((item.value / total.value) * TOTAL_CELLS)

    for (let j = 0; j < count; j++) {
      cells.push({ name: item.name, color: props.colors[i] ?? '#a09d96', active: true })
    }
    remaining -= count
  })

  // Pad sampai 50 kalau kurang
  while (cells.length < TOTAL_CELLS) {
    cells.push({ name: '', color: '#ccc', active: false })
  }

  return cells.slice(0, TOTAL_CELLS)
})
</script>

<style scoped>
.picto-block {
  padding: 10px 12px 10px;
  border-right: 1px solid var(--gray-100);
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}

.picto-block:last-child { border-right: none; }

.picto-label {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* 10 kolom x 5 baris */
.picto-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2px;
  flex-shrink: 0;
}

.picto-cell {
  font-size: 13px;
  line-height: 1;
  text-align: center;
  transition: opacity 0.2s;
  cursor: default;
  user-select: none;
}

.picto-cell:hover { transform: scale(1.2); }

/* Legend */
.picto-legend {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.picto-leg-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--text-secondary);
}

.picto-leg-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.picto-leg-name { flex: 1; }

.picto-leg-pct {
  font-weight: 700;
  color: var(--text-primary);
}
</style>