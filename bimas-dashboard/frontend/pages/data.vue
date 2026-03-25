<template>
  <div class="flex flex-col min-h-screen" style="background: var(--cream)">
    <AppHeader />

    <div class="flex-1 px-5 sm:px-7 py-6 w-full" style="max-width: 1600px; margin: 0 auto">

      <!-- Page Title -->
      <div class="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 class="text-xl font-bold mb-1" style="font-family: var(--font-display); color: var(--text-primary)">Data Penyuluh Agama</h2>
          <p class="text-sm" style="color: var(--text-muted)">
            Total <strong class="font-semibold" style="color: var(--olive-700)">{{ total.toLocaleString('id-ID') }}</strong> penyuluh terdaftar
          </p>
        </div>
        <NuxtLink to="/"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-all duration-200"
          style="background: var(--white); border-color: var(--gray-200); color: var(--text-secondary); text-decoration: none"
          onmouseover="this.style.background='var(--olive-50)';this.style.borderColor='var(--olive-300)';this.style.color='var(--olive-700)'"
          onmouseout="this.style.background='var(--white)';this.style.borderColor='var(--gray-200)';this.style.color='var(--text-secondary)'"
        >← Kembali ke Dashboard</NuxtLink>
      </div>

      <!-- Filter Bar -->
      <div class="flex items-center gap-2.5 mb-4 flex-wrap">
        <!-- Search -->
        <div class="relative flex-1" style="min-width: 220px">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">🔍</span>
          <input
            v-model="search"
            type="text"
            placeholder="Cari nama atau NIP..."
            class="w-full pl-8 pr-3 py-2 rounded-lg border text-sm outline-none transition-all"
            style="border-color: var(--gray-200); background: var(--white); color: var(--text-primary); font-family: var(--font-body)"
            @input="onSearch"
            @focus="$event.target.style.borderColor='var(--olive-400)'"
            @blur="$event.target.style.borderColor='var(--gray-200)'"
          />
        </div>

        <select v-model="filterProvinsi" @change="fetchData"
          class="py-2 px-3 rounded-lg border text-sm outline-none cursor-pointer transition-all"
          style="border-color: var(--gray-200); background: var(--white); color: var(--text-primary); font-family: var(--font-body)">
          <option value="">Semua Provinsi</option>
          <option v-for="p in provinsiList" :key="p" :value="p">{{ p }}</option>
        </select>

        <select v-model="filterAgama" @change="fetchData"
          class="py-2 px-3 rounded-lg border text-sm outline-none cursor-pointer transition-all"
          style="border-color: var(--gray-200); background: var(--white); color: var(--text-primary); font-family: var(--font-body)">
          <option value="">Semua Agama</option>
          <option value="1">Islam</option>
          <option value="2">Kristen</option>
          <option value="3">Katolik</option>
          <option value="4">Hindu</option>
          <option value="5">Buddha</option>
        </select>

        <!-- Kabkota combobox with autocomplete -->
        <div class="relative" style="min-width: 210px" ref="kabkotaRef">
          <!-- Input trigger -->
          <div class="flex items-center rounded-lg border"
            :style="kabkotaOpen
              ? 'border-color: var(--olive-400); background: var(--white)'
              : 'border-color: var(--gray-200); background: var(--white)'">
            <input
              ref="kabkotaInput"
              v-model="kabkotaSearch"
              type="text"
              placeholder="Semua Satker"
              class="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
              style="color: var(--text-primary); font-family: var(--font-body); min-width: 0; border-radius: 8px"
              @focus="kabkotaOpen = true"
              @input="onKabkotaInput"
              @keydown.escape="kabkotaOpen = false"
              @keydown.enter.prevent="filteredKabkota.length && selectKabkota(filteredKabkota[0].raw, filteredKabkota[0].kabkota)"
            />
            <button
              class="pr-2.5 pl-1 text-xs border-none bg-transparent cursor-pointer"
              style="color: var(--text-muted)"
              @mousedown.prevent
              @click="toggleKabkota"
            >{{ kabkotaOpen ? '▴' : '▾' }}</button>
          </div>

          <!-- Dropdown -->
          <div v-show="kabkotaOpen"
            class="absolute left-0 right-0 mt-1 rounded-lg border overflow-y-auto z-50"
            style="top: 100%; background: var(--white); border-color: var(--gray-200); max-height: 260px; box-shadow: 0 8px 24px rgba(0,0,0,.12)">

            <!-- Loading -->
            <div v-if="kabkotaList.length === 0"
              class="px-3 py-3 text-sm text-center" style="color: var(--text-muted)">
              Memuat...
            </div>

            <template v-else>
              <!-- Reset option -->
              <div class="px-3 py-2 text-sm cursor-pointer"
                :style="!filterKabkota ? 'background:var(--olive-50);color:var(--olive-700);font-weight:600' : 'color:var(--text-muted)'"
                @mousedown.prevent="selectKabkota('', '')">
                Semua Satker
              </div>

              <!-- No results -->
              <div v-if="filteredKabkota.length === 0"
                class="px-3 py-2 text-sm" style="color: var(--text-muted); border-top: 1px solid var(--gray-100)">
                Tidak ditemukan
              </div>

              <!-- Items -->
              <div v-for="k in filteredKabkota" :key="k.raw"
                class="px-3 py-2 text-sm cursor-pointer"
                style="border-top: 1px solid var(--gray-100)"
                :style="filterKabkota === k.raw
                  ? 'background:var(--olive-50);color:var(--olive-700);font-weight:600'
                  : 'color:var(--text-primary)'"
                @mousedown.prevent="selectKabkota(k.raw, k.kabkota)"
                @mouseenter="$event.currentTarget.style.background = filterKabkota === k.raw ? 'var(--olive-100)' : 'var(--gray-50)'"
                @mouseleave="$event.currentTarget.style.background = filterKabkota === k.raw ? 'var(--olive-50)' : ''"
              >{{ k.kabkota }}</div>
            </template>
          </div>
        </div>

        <button @click="resetFilter"
          class="py-2 px-4 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer"
          style="border-color: var(--gray-200); background: var(--white); color: var(--text-secondary); font-family: var(--font-body)"
          onmouseover="this.style.background='#fee2e2';this.style.borderColor='#fca5a5';this.style.color='#b91c1c'"
          onmouseout="this.style.background='var(--white)';this.style.borderColor='var(--gray-200)';this.style.color='var(--text-secondary)'"
        >Reset</button>
      </div>

      <!-- Table -->
      <div class="rounded-xl border overflow-hidden" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-sm)">
        <table v-if="!loading" class="w-full" style="border-collapse: collapse; font-size: 12.5px">
          <thead>
            <tr style="background: var(--gray-50); border-bottom: 2px solid var(--gray-200)">
              <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">No</th>
              <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Nama</th>
              <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">NIP</th>
              <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Golongan</th>
              <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Provinsi</th>
              <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Kab / Kota</th>
              <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Agama</th>
              <th class="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Kelamin</th>
              <th class="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Gapok</th>
              <th class="px-3 py-2.5 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap" style="color: var(--text-muted)">Total Belanja</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rows" :key="row.id"
              class="transition-colors duration-100 border-b"
              :style="{ background: i % 2 === 1 ? 'var(--gray-50)' : 'var(--white)', borderColor: 'var(--gray-100)' }"
              onmouseover="this.style.background='var(--olive-50)'"
              onmouseout="this.style.background=this.dataset.bg"
              :data-bg="i % 2 === 1 ? 'var(--gray-50)' : 'var(--white)'"
            >
              <td class="px-3 py-2.5" style="color: var(--text-muted); font-size: 12px">{{ (page - 1) * limit + i + 1 }}</td>
              <td class="px-3 py-2.5 font-semibold" style="max-width: 200px; color: var(--text-primary)">{{ row.nama }}</td>
              <td class="px-3 py-2.5" style="font-family: 'Courier New', monospace; font-size: 11.5px; color: var(--text-secondary)">{{ maskNip(row.nip_baru) }}</td>
              <td class="px-3 py-2.5">
                <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold" style="background: var(--sky-50); color: var(--sky-700); border: 1px solid var(--sky-100)">{{ row.golongan }}</span>
              </td>
              <td class="px-3 py-2.5">
                <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold" style="background: var(--olive-50); color: var(--olive-700); border: 1px solid var(--olive-100)">
                  {{ shortProvinsi(row.satker_provinsi) }}
                </span>
              </td>
              <td class="px-3 py-2.5 text-xs" style="color: var(--text-secondary)">{{ stripSatker(row.satuan_kerja) }}</td>
              <td class="px-3 py-2.5">
                <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                  :style="agamaBadgeStyle(row.agama)">{{ row.agama }}</span>
              </td>
              <td class="px-3 py-2.5">
                <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                  :style="row.kelamin === 'Laki-laki'
                    ? 'background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe'
                    : 'background: #fdf2f8; color: #9d174d; border: 1px solid #fbcfe8'">
                  {{ row.kelamin === 'Laki-laki' ? '♂' : '♀' }} {{ row.kelamin }}
                </span>
              </td>
              <td class="px-3 py-2.5 text-right" style="font-family: 'Courier New', monospace; font-size: 11.5px; color: var(--text-secondary)">{{ formatRp(row.gapok) }}</td>
              <td class="px-3 py-2.5 text-right font-semibold" style="font-family: 'Courier New', monospace; font-size: 11.5px; color: var(--olive-700)">{{ formatRp(row.total_belanja) }}</td>
            </tr>

            <tr v-if="notAuthorized">
              <td colspan="10" class="text-center py-16">
                <div class="text-4xl mb-3">🔐</div>
                <div class="text-sm font-bold mb-1" style="color: var(--text-primary)">Silakan Login Terlebih Dahulu</div>
                <div class="text-xs mb-5" style="color: var(--text-muted)">Data penyuluh hanya dapat diakses oleh admin yang telah terverifikasi</div>
                <NuxtLink to="/admin"
                  class="inline-block px-5 py-2 rounded-lg text-xs font-bold text-white no-underline"
                  style="background: var(--olive-700)">Masuk sebagai Admin →</NuxtLink>
              </td>
            </tr>
            <tr v-else-if="rows.length === 0">
              <td colspan="10" class="text-center py-12 text-sm" style="color: var(--text-muted)">
                Tidak ada data yang ditemukan
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Loading skeleton -->
        <div v-else class="p-4">
          <div v-for="i in 10" :key="i"
            class="flex gap-4 items-center py-3 border-b"
            style="border-color: var(--gray-100)">
            <div class="skeleton" style="width:3%;height:14px" />
            <div class="skeleton" style="width:18%;height:14px" />
            <div class="skeleton" style="width:14%;height:14px" />
            <div class="skeleton" style="width:6%;height:14px" />
            <div class="skeleton" style="width:20%;height:14px" />
            <div class="skeleton" style="width:10%;height:14px" />
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-4 flex-wrap gap-2.5">
        <div class="text-xs" style="color: var(--text-muted)">
          Menampilkan {{ (page - 1) * limit + 1 }}–{{ Math.min(page * limit, total) }}
          dari {{ total.toLocaleString('id-ID') }} data
        </div>

        <div class="flex gap-1">
          <button :disabled="page === 1" @click="goPage(1)"
            class="w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-all"
            :style="page === 1 ? 'opacity:.35;cursor:not-allowed;background:var(--white);border-color:var(--gray-200)' : 'cursor:pointer;background:var(--white);border-color:var(--gray-200);color:var(--text-secondary)'"
          >«</button>
          <button :disabled="page === 1" @click="goPage(page - 1)"
            class="w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-all"
            :style="page === 1 ? 'opacity:.35;cursor:not-allowed;background:var(--white);border-color:var(--gray-200)' : 'cursor:pointer;background:var(--white);border-color:var(--gray-200);color:var(--text-secondary)'"
          >‹</button>

          <button
            v-for="p in pageRange"
            :key="p"
            @click="goPage(p)"
            class="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-semibold transition-all cursor-pointer"
            :style="p === page
              ? 'background:var(--olive-700);border-color:var(--olive-700);color:white;font-weight:700'
              : 'background:var(--white);border-color:var(--gray-200);color:var(--text-secondary)'"
          >{{ p }}</button>

          <button :disabled="page === totalPages" @click="goPage(page + 1)"
            class="w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-all"
            :style="page === totalPages ? 'opacity:.35;cursor:not-allowed;background:var(--white);border-color:var(--gray-200)' : 'cursor:pointer;background:var(--white);border-color:var(--gray-200);color:var(--text-secondary)'"
          >›</button>
          <button :disabled="page === totalPages" @click="goPage(totalPages)"
            class="w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-all"
            :style="page === totalPages ? 'opacity:.35;cursor:not-allowed;background:var(--white);border-color:var(--gray-200)' : 'cursor:pointer;background:var(--white);border-color:var(--gray-200);color:var(--text-secondary)'"
          >»</button>
        </div>

        <select v-model="limit" @change="fetchData"
          class="py-1.5 px-2.5 rounded-lg border text-xs outline-none cursor-pointer"
          style="border-color: var(--gray-200); background: var(--white); color: var(--text-primary); font-family: var(--font-body)">
          <option :value="10">10 / hal</option>
          <option :value="20">20 / hal</option>
          <option :value="50">50 / hal</option>
          <option :value="100">100 / hal</option>
        </select>
      </div>

    </div>

    <AppFooter />
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const base   = config.public.apiBase

const rows          = ref([])
const total         = ref(0)
const totalPages    = ref(1)
const page          = ref(1)
const limit         = ref(20)
const loading       = ref(true)
const notAuthorized = ref(false)
const search        = ref('')
const filterProvinsi = ref('')
const filterAgama   = ref('')
const filterSatker  = ref('')
const filterKabkota  = ref('')
const kabkotaSearch  = ref('')
const kabkotaOpen    = ref(false)
const kabkotaRef     = ref(null)
const kabkotaInput   = ref(null)
const provinsiList   = ref([])
const kabkotaList    = ref([])

const filteredKabkota = computed(() => {
  const q = kabkotaSearch.value.toLowerCase().trim()
  if (!q) return kabkotaList.value
  return kabkotaList.value.filter(k => k.kabkota.toLowerCase().includes(q))
})

function onKabkotaInput() {
  kabkotaOpen.value = true
  // clear active filter saat user mengetik ulang
  if (filterKabkota.value) filterKabkota.value = ''
}

function toggleKabkota() {
  kabkotaOpen.value = !kabkotaOpen.value
  if (kabkotaOpen.value) nextTick(() => kabkotaInput.value?.focus())
}

function selectKabkota(raw, label) {
  filterKabkota.value = raw
  kabkotaSearch.value = raw ? label : ''
  kabkotaOpen.value = false
  page.value = 1
  fetchData()
}

function handleClickOutside(e) {
  if (kabkotaRef.value && !kabkotaRef.value.contains(e.target)) {
    kabkotaOpen.value = false
    // restore label jika ada filter aktif tapi search dihapus
    if (filterKabkota.value && !kabkotaSearch.value) {
      const found = kabkotaList.value.find(k => k.raw === filterKabkota.value)
      if (found) kabkotaSearch.value = found.kabkota
    }
  }
}

let searchTimer = null

async function fetchData() {
  loading.value = true
  notAuthorized.value = false
  try {
    const params = new URLSearchParams({
      page:    page.value,
      limit:   limit.value,
      search:  search.value,
      provinsi: filterProvinsi.value,
      agama:   filterAgama.value,
      satker:  filterSatker.value,
      kabkota: filterKabkota.value,
    })
    const res = await $fetch(`${base}/penyuluh?${params}`, {
      credentials: 'include'
    })
    rows.value       = res.data
    total.value      = res.total
    totalPages.value = res.totalPages
  } catch (err) {
    if (err.status === 401) {
      rows.value = []
      total.value = 0
      totalPages.value = 0
      notAuthorized.value = true
    } else {
      console.error('fetch error:', err)
    }
  } finally {
    loading.value = false
  }
}

async function fetchProvinsi() {
  try {
    const res = await $fetch(`${base}/provinsi`)
    provinsiList.value = res.map(p => p.name)
  } catch (err) {
    console.error('provinsi error:', err)
  }
}

async function fetchKabkota() {
  try {
    const params = filterProvinsi.value ? `?provinsi=${encodeURIComponent(filterProvinsi.value)}` : ''
    const res = await $fetch(`${base}/kabkota${params}`)
    kabkotaList.value = res
  } catch (err) {
    console.error('kabkota error:', err)
  }
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; fetchData() }, 400)
}

function goPage(p) {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  fetchData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const pageRange = computed(() => {
  const range = [], delta = 2
  const left  = Math.max(1, page.value - delta)
  const right = Math.min(totalPages.value, page.value + delta)
  for (let i = left; i <= right; i++) range.push(i)
  return range
})

function resetFilter() {
  search.value = ''; filterProvinsi.value = ''; filterAgama.value = ''; filterSatker.value = ''; filterKabkota.value = ''; kabkotaSearch.value = ''
  page.value = 1; fetchData()
}

function stripSatker(raw) {
  if (!raw) return '–'
  return raw
    .replace(/^KANTOR KEMENTERIAN AGAMA\s*/i, '')
    .replace(/^KABUPATEN\s+/i, 'KAB. ')
    .trim()
}

function maskNip(nip) {
  if (!nip) return '–'
  return nip.substring(0, 4) + '*'.repeat(nip.length - 4)
}

function formatRp(val) {
  if (!val) return '–'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function shortProvinsi(raw) {
  if (!raw) return '–'
  return raw
    .replace(/Kanwil Kementerian Agama Provinsi/gi, '')
    .replace(/Kantor Wilayah Kementerian Agama/gi, '')
    .replace(/Provinsi/gi, '')
    .trim()
}

function agamaBadgeStyle(agama) {
  const map = {
    'Islam':   'background: var(--olive-50); color: var(--olive-700); border: 1px solid var(--olive-100)',
    'Kristen': 'background: var(--sky-50); color: var(--sky-700); border: 1px solid var(--sky-100)',
    'Katolik': 'background: var(--gold-50); color: var(--gold-700); border: 1px solid var(--gold-100)',
    'Hindu':   'background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa',
    'Buddha':  'background: #fefce8; color: #854d0e; border: 1px solid #fef08a',
  }
  return map[agama] ?? 'background: var(--gray-50); color: var(--gray-600); border: 1px solid var(--gray-200)'
}

onMounted(() => {
  fetchData()
  fetchProvinsi()
  fetchKabkota()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
useHead({ title: 'Data Penyuluh — Bimas Islam' })
</script>