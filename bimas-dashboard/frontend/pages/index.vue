<template>
  <div class="flex flex-col min-h-screen" style="background: var(--cream)">
    <AppHeader />

    <!-- KPI Row -->
    <KpiGrid v-if="!loading && showKpi" :summary="summary" />
    <div v-else-if="showKpi" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-b"
      style="background: var(--white); border-color: var(--gray-200)">
      <div v-for="i in 6" :key="i" class="px-5 py-4 border-r" style="border-color: var(--gray-100)">
        <div class="skeleton w-9 h-9 rounded-lg mb-3"></div>
        <div class="skeleton h-7 w-3/4 mb-1.5 rounded-md"></div>
        <div class="skeleton h-3 w-1/2 rounded"></div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b"
      style="background: var(--white); border-color: var(--gray-200)">

      <div v-if="showChartBar"
        class="p-3.5 border-b md:border-b-0 lg:border-r anim-slide-up anim-d1"
        style="border-color: var(--gray-100); min-height: 192px">
        <BarChart v-if="topProv.length" :data="topProv" />
        <div v-else class="skeleton h-full rounded-lg" style="min-height: 180px"></div>
      </div>

      <div v-if="showChartAgama"
        class="border-b md:border-b-0 lg:border-r anim-slide-up anim-d2"
        style="border-color: var(--gray-100)">
        <AgamaChart :data="agamaForChart" />
      </div>

      <div v-if="showChartGender"
        class="border-b md:border-b-0 lg:border-r anim-slide-up anim-d3"
        style="border-color: var(--gray-100)">
        <GenderChart :data="kelaminForChart" />
      </div>

      <div v-if="showChartUsia" class="anim-slide-up anim-d4">
        <UsiaChart :data="usiaForChart" />
      </div>
    </div>

    <!-- Map -->
    <div v-if="showMap" class="flex-1 anim-slide-up anim-d5 p-3 sm:p-4" style="background: var(--cream)">
      <IndonesiaMap />
    </div>

    <AppFooter />

    <!-- Error toast -->
    <div v-if="error"
      class="fixed bottom-5 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-sm font-medium z-50 shadow-lg"
      style="background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c">
      ⚠️ {{ error }}
    </div>
  </div>
</template>

<script setup>
const { summary, topProv, agama, kelamin, usia, loading, error, fetchAll } = useDashboard()
const { loadConfig, showMap, showKpi, showChartAgama, showChartGender, showChartUsia, showChartBar } = useConfig()

const agamaForChart   = computed(() => agama.value.map(d => ({ name: d.agama,   value: d.total })))
const kelaminForChart = computed(() => kelamin.value.map(d => ({ name: d.jenis, value: d.total })))
const usiaForChart    = computed(() => usia.value.map(d => ({ name: d.kelompok, value: d.total })))

onMounted(() => { loadConfig(); fetchAll() })
useHead({ title: 'Dashboard Penyuluh Agama — Bimas Islam' })
</script>
