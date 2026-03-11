<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-b"
    style="background: var(--white); border-color: var(--gray-200)">
    <div
      v-for="(card, i) in cards"
      :key="card.key"
      class="relative px-5 py-4 border-r overflow-hidden cursor-default group transition-all duration-200 hover:-translate-y-0.5 anim-slide-up"
      :class="`anim-d${i + 1}`"
      style="border-color: var(--gray-100)"
    >
      <!-- Hover bottom accent -->
      <div class="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        :style="{ background: accentColors[i] }"></div>

      <!-- Icon -->
      <div class="w-9 h-9 rounded-lg flex items-center justify-center text-base mb-3"
        :style="{ background: iconBg[i] }">
        {{ card.icon }}
      </div>

      <!-- Value -->
      <div class="kpi-value-num leading-none mb-1 font-bold"
        :class="card.small ? 'text-lg' : 'text-2xl'"
        :style="{ color: 'var(--text-primary)', fontFamily: card.small ? 'var(--font-body)' : 'var(--font-display)', letterSpacing: '-0.5px' }">
        {{ card.animated ?? card.value }}
      </div>

      <!-- Label -->
      <div class="text-xs font-semibold tracking-wide" style="color: var(--text-secondary)">
        {{ card.label }}
      </div>

      <!-- Sub -->
      <div v-if="card.sub" class="text-xs mt-0.5" style="color: var(--text-muted); font-size: 10px">
        {{ card.sub }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLang, tr } from '~/composables/useLang'
import { useConfig }   from '~/composables/useConfig'

const { lang }              = useLang()
const { config, loadConfig } = useConfig()
onMounted(() => loadConfig())

const props = defineProps({ summary: { type: Object, default: null } })

const accentColors = [
  'var(--olive-700)', 'var(--olive-500)', 'var(--sky-500)',
  'var(--sky-400)', 'var(--gold-400)', 'var(--gold-500)'
]
const iconBg = [
  'var(--olive-100)', 'var(--olive-100)', 'var(--sky-50)',
  'var(--sky-50)', 'var(--gold-50)', 'var(--gold-50)'
]

const animatedValues = ref({})

const cards = computed(() => {
  const s = props.summary
  if (!s) return []
  const l = lang.value

  const gaji = s.rataGaji
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
        .format(s.rataGaji).replace('Rp', 'Rp ')
    : '–'

  return [
    { key: 'total',    icon: '👥', label: config.value?.label_kpi_total    || tr('kpi.total', l),    value: s.totalPenyuluh?.toLocaleString('id-ID') ?? '–', animated: animatedValues.value.total },
    { key: 'provinsi', icon: '🗺️', label: config.value?.label_kpi_provinsi || tr('kpi.provinsi', l), value: s.totalProvinsi ?? '–', animated: animatedValues.value.provinsi, sub: tr('kpi.sub.provinsi', l) },
    { key: 'satker',   icon: '🏢', label: config.value?.label_kpi_satker   || tr('kpi.satker', l),   value: 'KUA / Kemenag', small: true, sub: `KUA ${s.satker?.kua?.toLocaleString('id-ID')} · Kemenag ${s.satker?.kemenag}` },
    { key: 'usia',     icon: '🎂', label: config.value?.label_kpi_usia     || tr('kpi.usia', l),     value: `${s.rataUsia} thn`, animated: animatedValues.value.usia, sub: tr('kpi.sub.usia', l) },
    { key: 'islam',    icon: '☪️', label: config.value?.label_kpi_islam    || tr('kpi.islam', l),    value: `${s.pctIslam}%`, animated: animatedValues.value.islam, sub: `${l === 'en' ? 'of' : 'dari'} ${s.totalPenyuluh?.toLocaleString('id-ID')} ${l === 'en' ? 'staff' : 'penyuluh'}` },
    { key: 'gaji',     icon: '💰', label: config.value?.label_kpi_gaji     || tr('kpi.gaji', l),     value: gaji, small: true, sub: tr('kpi.sub.gaji', l) },
  ]
})

watch(() => props.summary, (s) => {
  if (!s) return
  const duration = 1200

  function runCounter(key, target, fmt, delay = 0) {
    setTimeout(() => {
      let prog = 0
      const timer = setInterval(() => {
        prog += 16
        const ease = 1 - Math.pow(2, -10 * Math.min(prog / duration, 1))
        animatedValues.value[key] = fmt(target * ease)
        if (prog >= duration) { animatedValues.value[key] = fmt(target); clearInterval(timer) }
      }, 16)
    }, delay)
  }

  runCounter('total',    s.totalPenyuluh, n => Math.round(n).toLocaleString('id-ID'), 0)
  runCounter('provinsi', s.totalProvinsi, n => String(Math.round(n)), 100)
  runCounter('usia',     s.rataUsia,      n => `${n.toFixed(1)} ${lang.value === 'en' ? 'yrs' : 'thn'}`, 200)
  runCounter('islam',    s.pctIslam,      n => `${n.toFixed(1)}%`, 300)
}, { immediate: true })
</script>
