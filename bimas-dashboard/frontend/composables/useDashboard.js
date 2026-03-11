// composables/useDashboard.js
// Central data-fetching composable — reusable across all pages/components

export const useDashboard = () => {
  const config = useRuntimeConfig()
  const base   = config.public.apiBase

  // ── Reactive state ──
  const summary  = ref(null)
  const provinsi = ref([])
  const topProv  = ref([])
  const agama    = ref([])
  const kelamin  = ref([])
  const usia     = ref([])
  const loading  = ref(true)
  const error    = ref(null)

  // ── Fetch helpers ──
  async function fetchAll() {
    loading.value = true
    error.value   = null

    try {
      const [sum, prov, top, ag, kel, us] = await Promise.all([
        $fetch(`${base}/summary`),
        $fetch(`${base}/provinsi`),
        $fetch(`${base}/provinsi/top?n=10`),
        $fetch(`${base}/agama`),
        $fetch(`${base}/kelamin`),
        $fetch(`${base}/usia`),
      ])

      summary.value  = sum
      provinsi.value = prov
      topProv.value  = top
      agama.value    = ag
      kelamin.value  = kel
      usia.value     = us
    } catch (err) {
      console.error('[useDashboard] fetch error:', err)
      error.value = err.message || 'Gagal memuat data dari server'
    } finally {
      loading.value = false
    }
  }

  // ── Computed helpers ──
  const totalPenyuluh = computed(() => summary.value?.totalPenyuluh ?? 0)
  const totalProvinsi = computed(() => summary.value?.totalProvinsi ?? 0)
  const rataUsia      = computed(() => summary.value?.rataUsia ?? 0)
  const pctIslam      = computed(() => summary.value?.pctIslam ?? 0)
  const rataGaji      = computed(() => {
    const g = summary.value?.rataGaji ?? 0
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(g)
  })

  // Map: province id → total (for heatmap)
  const provinsiMap = computed(() => {
    const m = {}
    provinsi.value.forEach(p => { m[p.id] = p.total })
    return m
  })

  return {
    // State
    summary, provinsi, topProv, agama, kelamin, usia,
    loading, error,
    // Methods
    fetchAll,
    // Computed
    totalPenyuluh, totalProvinsi, rataUsia, pctIslam, rataGaji,
    provinsiMap,
  }
}
