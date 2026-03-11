<template>
  <div class="flex flex-col gap-1 p-3 h-full overflow-hidden">
    <div class="text-xs font-bold uppercase tracking-widest flex-shrink-0" style="color: var(--text-muted); letter-spacing: 1.2px">
      {{ tr('chart.kelamin', lang) }}
    </div>
    <div class="flex-1 flex items-center justify-around gap-2 py-1">
      <div v-for="item in items" :key="item.name" class="flex flex-col items-center gap-1">
        <!-- Donut ring -->
        <div class="relative w-16 h-16">
          <svg viewBox="0 0 100 100" class="w-full h-full" style="transform: rotate(-90deg)">
            <circle cx="50" cy="50" r="38" fill="none" :stroke="item.color + '22'" stroke-width="10" />
            <circle cx="50" cy="50" r="38" fill="none" :stroke="item.color"
              stroke-width="10" stroke-linecap="round"
              :stroke-dasharray="`${item.pct * 2.388} 238.8`"
              stroke-dashoffset="59.7" />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="font-black leading-none" style="font-size: 18px" :style="{ color: item.color }">{{ item.icon }}</span>
            <span class="font-bold leading-tight" style="font-size: 12px; font-family: var(--font-display)" :style="{ color: item.color }">{{ item.pct }}%</span>
          </div>
        </div>
        <div class="text-xs font-bold" :style="{ color: item.color }">{{ item.name }}</div>
        <div class="text-center" style="font-size: 8.5px; color: var(--text-muted)">
          {{ item.value.toLocaleString('id-ID') }} orang
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLang, tr } from '~/composables/useLang'
const { lang } = useLang()
const props = defineProps({ data: { type: Array, default: () => [] } })
const GENDER_CONFIG = {
  'Laki-laki': { icon: '♂', color: '#4a7fa5' },
  'Perempuan':  { icon: '♀', color: '#c4608a' },
}
const total = computed(() => props.data.reduce((s, d) => s + d.value, 0))
const items = computed(() => props.data.map(d => ({
  name:  d.name, value: d.value,
  pct:   total.value ? Math.round((d.value / total.value) * 100) : 0,
  icon:  GENDER_CONFIG[d.name]?.icon  ?? '👤',
  color: GENDER_CONFIG[d.name]?.color ?? '#5c6b3a',
})))
</script>
