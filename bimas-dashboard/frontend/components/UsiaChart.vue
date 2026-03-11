<template>
  <div class="flex flex-col gap-2 p-3">
    <div class="text-xs font-bold uppercase tracking-widest" style="color: var(--text-muted); letter-spacing: 1.2px">
      {{ tr('chart.usia', lang) }}
    </div>
    <div class="flex flex-col gap-1.5">
      <div
        v-for="(item, i) in items" :key="i"
        class="flex items-center gap-1.5 p-1.5 rounded-lg border"
        style="background: var(--gray-50); border-color: var(--gray-100)"
      >
        <div class="w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0"
          :style="{ background: item.color + '20', borderColor: item.color + '50' }">
          <span class="text-xs">{{ item.icon }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-baseline mb-0.5">
            <span class="font-semibold whitespace-nowrap" style="font-size: 9.5px; color: var(--text-primary)">
              {{ item.name }}
            </span>
            <span class="font-bold flex-shrink-0 ml-1" :style="{ color: item.color, fontSize: '10px' }">
              {{ item.pct }}%
            </span>
          </div>
          <div class="h-0.5 rounded-full overflow-hidden" style="background: var(--gray-200)">
            <div class="h-full rounded-full transition-all duration-1000"
              :style="{ width: item.pct + '%', background: item.color }"></div>
          </div>
          <div class="mt-0.5" style="font-size: 8px; color: var(--text-muted)">
            {{ item.value.toLocaleString('id-ID') }} orang
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLang, tr } from '~/composables/useLang'
const { lang } = useLang()
const props = defineProps({ data: { type: Array, default: () => [] } })

const SLOTS = [
  { icon: '🧒', color: '#4a7fa5' },
  { icon: '🧑', color: '#5c6b3a' },
  { icon: '👨', color: '#c4a04a' },
  { icon: '🧓', color: '#9e7c2e' },
]

const total = computed(() => props.data.reduce((s, d) => s + d.value, 0))
const items = computed(() =>
  props.data.map((d, i) => ({
    name:  d.name,
    value: d.value,
    pct:   total.value ? Math.round((d.value / total.value) * 100) : 0,
    icon:  SLOTS[i]?.icon  ?? '👤',
    color: SLOTS[i]?.color ?? '#a09d96',
  }))
)
</script>
