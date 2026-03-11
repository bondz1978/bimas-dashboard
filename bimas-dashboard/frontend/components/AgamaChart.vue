<template>
  <div class="flex flex-col gap-2 p-3 h-full overflow-hidden">
    <div class="text-xs font-bold uppercase tracking-widest flex-shrink-0" style="color: var(--text-muted); letter-spacing: 1.2px">
      Agama
    </div>
    <div class="grid grid-cols-2 gap-1.5 flex-1 content-center">
      <div
        v-for="item in items" :key="item.name"
        class="flex items-center gap-1.5 p-1.5 rounded-lg border"
        style="background: var(--gray-50); border-color: var(--gray-100)"
      >
        <!-- Icon -->
        <div class="w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0"
          :style="{ background: item.color + '20', borderColor: item.color + '50' }">
          <span class="text-xs">{{ item.symbol }}</span>
        </div>
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-baseline mb-0.5">
            <span class="font-semibold truncate" style="font-size: 9.5px; color: var(--text-primary)">
              {{ tr('agama.' + item.name, lang) || item.name }}
            </span>
            <span class="font-bold flex-shrink-0 ml-1" :style="{ color: item.color, fontSize: '10px' }">
              {{ item.pct }}%
            </span>
          </div>
          <div class="h-0.5 rounded-full overflow-hidden" style="background: var(--gray-200)">
            <div class="h-full rounded-full bar-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
          </div>
          <div class="mt-0.5" style="font-size: 8px; color: var(--text-muted)">
            {{ item.value.toLocaleString('id-ID') }}
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

const AGAMA_CONFIG = {
  'Islam':   { symbol: '☪',  color: '#5c6b3a' },
  'Kristen': { symbol: '✝',  color: '#4a7fa5' },
  'Katolik': { symbol: '✚',  color: '#2c5f7e' },
  'Hindu':   { symbol: 'ॐ',  color: '#c4a04a' },
  'Buddha':  { symbol: '☸',  color: '#9e7c2e' },
  'Lainnya': { symbol: '✦',  color: '#a09d96' },
}

const total = computed(() => props.data.reduce((s, d) => s + d.value, 0))
const items = computed(() =>
  props.data.map(d => ({
    name:   d.name,
    value:  d.value,
    pct:    total.value ? Math.round((d.value / total.value) * 100) : 0,
    symbol: AGAMA_CONFIG[d.name]?.symbol ?? '✦',
    color:  AGAMA_CONFIG[d.name]?.color  ?? '#a09d96',
  }))
)
</script>
