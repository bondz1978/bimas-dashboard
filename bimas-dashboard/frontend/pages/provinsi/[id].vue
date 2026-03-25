<template>
  <div class="flex flex-col min-h-screen" style="background: var(--cream)">
    <AppHeader />

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center gap-4" style="color: var(--text-muted)">
      <div class="w-9 h-9 rounded-full border-4 border-t-transparent animate-spin" style="border-color: var(--gray-200); border-top-color: var(--olive-500)"></div>
      <p class="text-sm">Memuat data provinsi...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center gap-3">
      <div class="text-5xl">⚠️</div>
      <h3 class="text-lg font-bold" style="font-family: var(--font-display); color: var(--text-primary)">Data tidak ditemukan</h3>
      <p class="text-sm" style="color: var(--text-muted)">{{ error }}</p>
      <NuxtLink to="/" class="mt-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white no-underline" style="background: var(--olive-700)">
        ← Kembali ke Dashboard
      </NuxtLink>
    </div>

    <!-- Content -->
    <template v-else-if="data">

      <!-- Hero Header -->
      <div class="flex items-center justify-between px-7 py-5 flex-wrap gap-6" style="background: var(--olive-700)">
        <div class="flex flex-col gap-2">
          <NuxtLink to="/" class="text-xs font-medium no-underline transition-opacity hover:opacity-100 opacity-70" style="color: white">
            ← Dashboard
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-bold" style="font-family: var(--font-display); color: white; margin: 0">{{ data.nama }}</h1>
            <p class="text-xs mt-0.5" style="color: rgba(255,255,255,0.65)">Kanwil Kementerian Agama · Bimas Islam</p>
          </div>
        </div>
        <div class="flex gap-8 flex-wrap">
          <div v-for="stat in heroStats" :key="stat.label" class="flex flex-col items-end">
            <span class="text-xl font-bold" style="font-family: var(--font-display); color: white">{{ stat.value }}</span>
            <span class="text-xs mt-0.5" style="color: rgba(255,255,255,0.65)">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-7">

        <!-- Agama -->
        <div class="rounded-xl border p-4" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-sm)">
          <div class="text-xs font-bold uppercase tracking-widest mb-3.5" style="color: var(--text-muted); letter-spacing: 1px">Distribusi Agama</div>
          <div class="flex flex-col gap-2">
            <div v-for="item in agamaItems" :key="item.name" class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 flex-shrink-0" style="width: 90px">
                <span class="text-sm">{{ item.symbol }}</span>
                <span class="text-xs font-medium" style="color: var(--text-primary)">{{ item.name }}</span>
              </div>
              <div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background: var(--gray-100)">
                <div class="h-full rounded-full bar-fill transition-all duration-1000" :style="{ width: item.pct + '%', background: item.color }"></div>
              </div>
              <div class="flex flex-col items-end w-11 flex-shrink-0">
                <span class="text-xs font-bold leading-none" :style="{ color: item.color }">{{ item.pct }}%</span>
                <span class="text-xs" style="font-size: 9px; color: var(--text-muted)">{{ item.total.toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Kelamin -->
        <div class="rounded-xl border p-4" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-sm)">
          <div class="text-xs font-bold uppercase tracking-widest mb-3.5" style="color: var(--text-muted); letter-spacing: 1px">Jenis Kelamin</div>
          <div class="flex justify-around items-center py-2">
            <div v-for="item in kelaminItems" :key="item.name" class="flex flex-col items-center gap-1.5">
              <div class="relative w-24 h-24">
                <svg viewBox="0 0 100 100" class="w-full h-full">
                  <circle cx="50" cy="50" r="40" fill="none" :stroke="item.color + '22'" stroke-width="10"/>
                  <circle cx="50" cy="50" r="40" fill="none" :stroke="item.color"
                    stroke-width="10" stroke-linecap="round"
                    :stroke-dasharray="`${item.pct * 2.513} 251.3`"
                    stroke-dashoffset="62.8"
                    style="transform:rotate(-90deg);transform-origin:50% 50%"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                  <span class="font-black leading-none" style="font-size: 26px" :style="{ color: item.color }">{{ item.icon }}</span>
                  <span class="font-bold" style="font-size: 18px" :style="{ color: item.color }">{{ item.pct }}%</span>
                </div>
              </div>
              <div class="text-xs font-bold" :style="{ color: item.color }">{{ item.name }}</div>
              <div class="text-xs" style="color: var(--text-muted); font-size: 10px">{{ item.total.toLocaleString('id-ID') }} orang</div>
            </div>
          </div>
        </div>

        <!-- Usia -->
        <div class="rounded-xl border p-4" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-sm)">
          <div class="text-xs font-bold uppercase tracking-widest mb-3.5" style="color: var(--text-muted); letter-spacing: 1px">Kelompok Usia</div>
          <div class="flex flex-col gap-2">
            <div v-for="(item, i) in usiaItems" :key="i" class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 flex-shrink-0" style="width: 90px">
                <span class="text-sm">{{ item.icon }}</span>
                <span class="text-xs font-medium" style="color: var(--text-primary)">{{ item.name }}</span>
              </div>
              <div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background: var(--gray-100)">
                <div class="h-full rounded-full bar-fill transition-all duration-1000" :style="{ width: item.pct + '%', background: item.color }"></div>
              </div>
              <div class="flex flex-col items-end w-11 flex-shrink-0">
                <span class="text-xs font-bold leading-none" :style="{ color: item.color }">{{ item.pct }}%</span>
                <span class="text-xs" style="font-size: 9px; color: var(--text-muted)">{{ item.total.toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Satker -->
        <div class="rounded-xl border p-4" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-sm)">
          <div class="text-xs font-bold uppercase tracking-widest mb-3.5" style="color: var(--text-muted); letter-spacing: 1px">Top Satuan Kerja</div>
          <div class="flex flex-col gap-1.5">
            <div v-for="(item, i) in data.topSatker" :key="i" class="flex items-center gap-2">
              <span class="text-xs font-bold flex-shrink-0" style="width: 16px; color: var(--text-muted)">{{ i + 1 }}</span>
              <span class="text-xs flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap" style="width: 180px; color: var(--text-primary)">{{ item.satker }}</span>
              <div class="flex-1 h-1 rounded-full overflow-hidden" style="background: var(--gray-100)">
                <div class="h-full rounded-full transition-all duration-1000" :style="{ width: (item.total / data.topSatker[0].total * 100) + '%', background: 'var(--olive-500)' }"></div>
              </div>
              <span class="text-xs font-bold flex-shrink-0" style="width: 24px; text-align: right; color: var(--olive-700)">{{ item.total }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabel Penyuluh -->
      <div class="px-5 sm:px-7 pb-7">
        <div class="flex items-center justify-between mb-3">
          <div class="text-xs font-bold uppercase tracking-widest" style="color: var(--text-muted); letter-spacing: 1px">Daftar Penyuluh (15 teratas)</div>
          <NuxtLink :to="`/data?provinsi=${encodeURIComponent(data.nama)}`"
            class="text-xs font-semibold no-underline transition-opacity hover:underline"
            style="color: var(--olive-700)">
            Lihat Semua di Tabel →
          </NuxtLink>
        </div>
        <!-- Not authorized -->
        <div v-if="notAuthorized" class="rounded-xl border p-10 text-center" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-sm)">
          <div class="text-4xl mb-3">🔐</div>
          <div class="text-sm font-bold mb-1" style="color: var(--text-primary)">Silakan Login Terlebih Dahulu</div>
          <div class="text-xs mb-5" style="color: var(--text-muted)">Data penyuluh hanya dapat diakses oleh admin yang telah terverifikasi</div>
          <NuxtLink to="/admin"
            class="inline-block px-5 py-2 rounded-lg text-xs font-bold text-white no-underline"
            style="background: var(--olive-700)">Masuk sebagai Admin →</NuxtLink>
        </div>

        <div v-else class="rounded-xl border overflow-hidden" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-sm)">
          <table v-if="penyuluh.length" class="w-full" style="border-collapse: collapse; font-size: 12.5px">
            <thead>
              <tr style="background: var(--gray-50); border-bottom: 2px solid var(--gray-200)">
                <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">No</th>
                <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Nama</th>
                <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">NIP</th>
                <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Golongan</th>
                <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Satuan Kerja</th>
                <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Agama</th>
                <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Kelamin</th>
                <th class="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Total Belanja</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in penyuluh" :key="i"
                class="border-b transition-colors duration-100"
                :style="{ background: i % 2 === 1 ? 'var(--gray-50)' : 'var(--white)', borderColor: 'var(--gray-100)' }"
                onmouseover="this.style.background='var(--olive-50)'"
                onmouseout="this.style.background=this.dataset.bg"
                :data-bg="i % 2 === 1 ? 'var(--gray-50)' : 'var(--white)'"
              >
                <td class="px-3 py-2 text-xs" style="color: var(--text-muted)">{{ i + 1 }}</td>
                <td class="px-3 py-2 font-semibold text-xs" style="max-width: 180px; color: var(--text-primary)">{{ row.nama }}</td>
                <td class="px-3 py-2 text-xs" style="font-family: monospace; color: var(--text-secondary)">{{ maskNip(row.nip_baru) }}</td>
                <td class="px-3 py-2">
                  <span class="inline-block px-1.5 py-0.5 rounded text-xs font-semibold" style="background: var(--sky-50); color: var(--sky-700); border: 1px solid var(--sky-100)">{{ row.golongan }}</span>
                </td>
                <td class="px-3 py-2 text-xs" style="max-width: 180px; color: var(--text-secondary)">{{ stripSatker(row.satuan_kerja) }}</td>
                <td class="px-3 py-2">
                  <span class="inline-block px-1.5 py-0.5 rounded text-xs font-semibold" style="background: var(--olive-50); color: var(--olive-700); border: 1px solid var(--olive-100)">{{ row.agama }}</span>
                </td>
                <td class="px-3 py-2">
                  <span class="inline-block px-1.5 py-0.5 rounded text-xs font-semibold"
                    :style="row.kelamin === 'Laki-laki'
                      ? 'background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe'
                      : 'background:#fdf2f8;color:#9d174d;border:1px solid #fbcfe8'">
                    {{ row.kelamin === 'Laki-laki' ? '♂' : '♀' }} {{ row.kelamin }}
                  </span>
                </td>
                <td class="px-3 py-2 text-right font-semibold text-xs" style="font-family: monospace; color: var(--olive-700)">{{ formatRp(row.total_belanja) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="p-8 text-center text-sm" style="color: var(--text-muted)">Memuat data...</div>
        </div>
      </div>

    </template>

    <AppFooter />
  </div>
</template>

<script setup>
const route   = useRoute()
const config  = useRuntimeConfig()
const base    = config.public.apiBase
const idParam = computed(() => route.params.id)

const data     = ref(null)
const penyuluh      = ref([])
const notAuthorized = ref(false)
const loading  = ref(true)
const error    = ref(null)

async function fetchDetail() {
  loading.value = true
  error.value   = null
  try {
    const detail = await $fetch(`${base}/provinsi/${idParam.value}`)
    if (!detail || detail.total === 0) {
      error.value = 'Tidak ada data penyuluh untuk provinsi ini.'
      return
    }
    data.value   = detail
    const p      = await $fetch(`${base}/penyuluh?limit=15&page=1&provinsi=${encodeURIComponent(detail.nama)}`, {
      credentials: 'include'
    })
    penyuluh.value = p.data || []
  } catch (err) {
    if (err.status === 401) {
      notAuthorized.value = true
    } else {
      error.value = err.message || 'Gagal memuat data provinsi'
    }
  } finally {
    loading.value = false
  }
}

const heroStats = computed(() => data.value ? [
  { value: data.value.total.toLocaleString('id-ID'), label: 'Total Penyuluh' },
  { value: `${data.value.rataUsia} thn`,              label: 'Rata-rata Usia' },
  { value: data.value.satker.kua,                     label: 'Satker KUA' },
  { value: data.value.satker.kemenag,                 label: 'Satker Kemenag' },
  { value: formatRp(data.value.rataGaji),             label: 'Rata-rata Belanja' },
] : [])

const AGAMA_CONFIG = {
  'Islam':   { symbol: '☪', color: '#5c6b3a' },
  'Kristen': { symbol: '✝', color: '#4a7fa5' },
  'Katolik': { symbol: '✚', color: '#2c5f7e' },
  'Hindu':   { symbol: 'ॐ', color: '#c4a04a' },
  'Buddha':  { symbol: '☸', color: '#9e7c2e' },
  'Lainnya': { symbol: '✦', color: '#a09d96' },
}
const GENDER_CONFIG = {
  'Laki-laki': { icon: '♂', color: '#4a7fa5' },
  'Perempuan':  { icon: '♀', color: '#c4608a' },
}
const USIA_SLOTS = [
  { icon: '🧒', color: '#4a7fa5' },
  { icon: '🧑', color: '#5c6b3a' },
  { icon: '👨', color: '#c4a04a' },
  { icon: '🧓', color: '#9e7c2e' },
]

const agamaItems = computed(() => {
  if (!data.value) return []
  const total = data.value.agama.reduce((s, d) => s + d.total, 0)
  return data.value.agama.map(d => ({
    name: d.agama, total: d.total,
    pct: Math.round((d.total / total) * 100),
    symbol: AGAMA_CONFIG[d.agama]?.symbol ?? '✦',
    color:  AGAMA_CONFIG[d.agama]?.color  ?? '#a09d96',
  }))
})

const kelaminItems = computed(() => {
  if (!data.value) return []
  const total = data.value.kelamin.reduce((s, d) => s + d.total, 0)
  return data.value.kelamin.map(d => ({
    name: d.jenis, total: d.total,
    pct:   Math.round((d.total / total) * 100),
    icon:  GENDER_CONFIG[d.jenis]?.icon  ?? '👤',
    color: GENDER_CONFIG[d.jenis]?.color ?? '#5c6b3a',
  }))
})

const usiaItems = computed(() => {
  if (!data.value) return []
  const total = data.value.usia.reduce((s, d) => s + d.total, 0)
  return data.value.usia.map((d, i) => ({
    name: d.kelompok, total: d.total,
    pct:   Math.round((d.total / total) * 100),
    icon:  USIA_SLOTS[i]?.icon  ?? '👤',
    color: USIA_SLOTS[i]?.color ?? '#a09d96',
  }))
})

function maskNip(nip) {
  if (!nip) return '–'
  return nip.substring(0, 4) + '*'.repeat(nip.length - 4)
}

function stripSatker(raw) {
  if (!raw) return '–'
  return raw
    .replace(/^KANTOR KEMENTERIAN AGAMA\s*/i, '')
    .replace(/^KABUPATEN\s+/i, 'KAB. ')
    .trim()
}

function formatRp(val) {
  if (!val) return '–'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

onMounted(() => fetchDetail())
watch(idParam, () => fetchDetail())
useHead({ title: computed(() => `${data.value?.nama ?? 'Provinsi'} — Bimas Islam`) })
</script>