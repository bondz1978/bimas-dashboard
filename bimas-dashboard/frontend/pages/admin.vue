<template>
  <div class="flex flex-col min-h-screen" style="background: var(--cream)">
    <AppHeader />

    <!-- Login -->
    <div v-if="!authenticated" class="flex-1 flex items-center justify-center p-10">
      <div class="w-full max-w-sm rounded-2xl border p-10 text-center" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-md)">
        <div class="text-5xl mb-3">⚙️</div>
        <h2 class="text-xl font-bold mb-1.5" style="font-family: var(--font-display); color: var(--text-primary)">Admin Dashboard</h2>
        <p class="text-sm mb-6" style="color: var(--text-muted)">Login dengan akun Google yang telah disetujui</p>

        <!-- Error message -->
        <div v-if="authFailed" class="mb-4 px-4 py-2.5 rounded-lg text-sm" style="background: #fee2e2; color: #991b1b">
          ⚠️ Akun Google kamu tidak diizinkan mengakses halaman ini.
        </div>

        <!-- Google Login Button -->
        <a :href="googleAuthUrl"
          class="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-lg border text-sm font-semibold no-underline transition-all cursor-pointer"
          style="border-color: var(--gray-200); background: var(--white); color: var(--text-primary)"
          onmouseover="this.style.background='var(--gray-50)'"
          onmouseout="this.style.background='var(--white)'">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Masuk dengan Google
        </a>

        <NuxtLink to="/" class="block mt-4 text-xs no-underline transition-colors" style="color: var(--text-muted)">
          ← Kembali ke Dashboard
        </NuxtLink>
      </div>
    </div>

    <!-- Panel -->
    <template v-else>
      <!-- Hero -->
      <div class="flex items-center justify-between px-7 py-5 flex-wrap gap-4" style="background: var(--olive-700)">
        <div>
          <h1 class="text-xl font-bold" style="font-family: var(--font-display); color: white; margin: 0">⚙️ Konfigurasi Dashboard</h1>
          <p class="text-xs mt-1" style="color: rgba(255,255,255,0.65)">Perubahan tersimpan di browser ini</p>
        </div>
        <div class="flex gap-2">
          <button @click="save" class="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border-none" style="background: white; color: var(--olive-700)">💾 Simpan</button>
          <button @click="reset" class="px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer" style="background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.3)">↺ Reset</button>
          <div v-if="googleUser" class="flex items-center gap-2">
            <img v-if="googleUser?.photo" :src="googleUser?.photo" class="w-6 h-6 rounded-full" />
            <span class="text-xs" style="color: rgba(255,255,255,0.7)">{{ googleUser.name }}</span>
          </div>
          <button @click="logout" class="px-3.5 py-2 rounded-lg text-xs cursor-pointer" style="background: transparent; color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.15)">Keluar</button>
        </div>
      </div>

      <!-- Save banner -->
      <div v-if="msg" class="px-7 py-2.5 text-sm font-semibold text-center"
        :style="msg.type === 'success' ? 'background:#dcfce7;color:#166534' : 'background:#fee2e2;color:#991b1b'">
        {{ msg.text }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 sm:p-7">

        <!-- ① Tema Preset -->
        <div class="md:col-span-2 rounded-xl border p-5" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-sm)">
          <div class="text-xs font-bold uppercase tracking-widest mb-4" style="color: var(--text-muted); letter-spacing: 1px">🎨 Pilihan Tema — klik untuk preview langsung</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div v-for="theme in THEMES" :key="theme.id"
              class="rounded-xl border-2 overflow-hidden cursor-pointer relative transition-all duration-200 hover:-translate-y-1"
              :style="{ borderColor: form.selected_theme === theme.id ? theme.color_primary : 'var(--gray-200)', boxShadow: form.selected_theme === theme.id ? `0 0 0 3px ${theme.color_primary}22` : 'none' }"
              @click="pickTheme(theme)"
            >
              <!-- Color bar -->
              <div class="flex h-1.5">
                <div class="flex-1" :style="{ background: theme.color_primary }"></div>
                <div class="flex-1" :style="{ background: theme.color_secondary }"></div>
                <div class="flex-1" :style="{ background: theme.color_accent }"></div>
              </div>
              <!-- Sample preview -->
              <div class="p-4 flex flex-col gap-1.5 border" :style="{ background: theme.bg, borderColor: theme.color_primary + '33' }">
                <span class="text-lg font-bold leading-none" :style="{ color: theme.color_primary, fontFamily: theme.font_display }">Dashboard</span>
                <span class="text-xs font-medium" :style="{ color: theme.color_secondary, fontFamily: theme.font_body }">Penyuluh Agama</span>
                <div class="mt-1 px-2 py-1 rounded text-xs font-bold text-white w-fit" :style="{ background: theme.color_primary }">Lihat →</div>
              </div>
              <!-- Meta -->
              <div class="px-3 py-2.5 border-t" style="background: var(--gray-50); border-color: var(--gray-100)">
                <div class="text-xs font-bold" style="color: var(--text-primary)">{{ theme.name }}</div>
                <div class="text-xs mt-0.5" style="color: var(--text-muted); font-size: 10px">{{ theme.font_display }} · {{ theme.font_body }}</div>
              </div>
              <!-- Check badge -->
              <div v-if="form.selected_theme === theme.id"
                class="absolute top-2.5 right-2.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center shadow"
                :style="{ background: theme.color_primary }">✓</div>
            </div>
          </div>
        </div>

        <!-- ② Identitas -->
        <div class="rounded-xl border p-5" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-sm)">
          <div class="text-xs font-bold uppercase tracking-widest mb-4" style="color: var(--text-muted); letter-spacing: 1px">🏷️ Identitas Dashboard</div>
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold" style="color: var(--text-secondary)">Judul</label>
              <input v-model="form.site_title" type="text"
                class="px-3 py-2 rounded-lg border text-sm outline-none transition-all"
                style="border-color: var(--gray-200); background: var(--gray-50); color: var(--text-primary)"
                @focus="$event.target.style.borderColor='var(--olive-500)';$event.target.style.background='var(--white)'"
                @blur="$event.target.style.borderColor='var(--gray-200)';$event.target.style.background='var(--gray-50)'"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold" style="color: var(--text-secondary)">Deskripsi / Subtitle</label>
              <input v-model="form.site_description" type="text"
                class="px-3 py-2 rounded-lg border text-sm outline-none transition-all"
                style="border-color: var(--gray-200); background: var(--gray-50); color: var(--text-primary)"
                @focus="$event.target.style.borderColor='var(--olive-500)';$event.target.style.background='var(--white)'"
                @blur="$event.target.style.borderColor='var(--gray-200)';$event.target.style.background='var(--gray-50)'"
              />
            </div>
          </div>
        </div>

        <!-- ③ Tampilkan Section -->
        <div class="rounded-xl border p-5" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-sm)">
          <div class="text-xs font-bold uppercase tracking-widest mb-4" style="color: var(--text-muted); letter-spacing: 1px">👁 Tampilkan / Sembunyikan</div>
          <div class="flex flex-col gap-2">
            <div v-for="item in sectionToggles" :key="item.key"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg border"
              style="background: var(--gray-50); border-color: var(--gray-100)">
              <div class="flex items-center gap-2.5">
                <span class="text-base">{{ item.icon }}</span>
                <div>
                  <div class="text-xs font-semibold" style="color: var(--text-primary)">{{ item.label }}</div>
                  <div class="text-xs" style="color: var(--text-muted); font-size: 10px">{{ item.desc }}</div>
                </div>
              </div>
              <!-- Toggle switch -->
              <button
                class="relative flex-shrink-0 rounded-full border-none cursor-pointer transition-all duration-200"
                style="width: 40px; height: 22px"
                :style="{ background: form[item.key] === 'true' ? 'var(--olive-700)' : 'var(--gray-300)' }"
                @click="form[item.key] = form[item.key] === 'true' ? 'false' : 'true'"
              >
                <span class="absolute top-0.5 rounded-full bg-white shadow transition-transform duration-200"
                  style="width: 18px; height: 18px; left: 2px"
                  :style="{ transform: form[item.key] === 'true' ? 'translateX(18px)' : 'translateX(0)' }"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- ④ Label KPI -->
        <div class="rounded-xl border p-5" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-sm)">
          <div class="text-xs font-bold uppercase tracking-widest mb-4" style="color: var(--text-muted); letter-spacing: 1px">📊 Label KPI Cards</div>
          <div class="flex flex-col gap-3">
            <div v-for="item in kpiLabels" :key="item.key" class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold flex items-center gap-1" style="color: var(--text-secondary)">
                <span>{{ item.icon }}</span> {{ item.hint }}
              </label>
              <input v-model="form[item.key]" type="text"
                class="px-3 py-2 rounded-lg border text-sm outline-none transition-all"
                style="border-color: var(--gray-200); background: var(--gray-50); color: var(--text-primary)"
                @focus="$event.target.style.borderColor='var(--olive-500)';$event.target.style.background='var(--white)'"
                @blur="$event.target.style.borderColor='var(--gray-200)';$event.target.style.background='var(--gray-50)'"
              />
            </div>
          </div>
        </div>

        <!-- ⑤ Password -->
        <div class="rounded-xl border p-5" style="background: var(--white); border-color: var(--gray-200); box-shadow: var(--shadow-sm)">
          <div class="text-xs font-bold uppercase tracking-widest mb-4" style="color: var(--text-muted); letter-spacing: 1px">🔐 Ganti Password Admin</div>
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold" style="color: var(--text-secondary)">Password Lama</label>
              <input v-model="pw.old" type="password"
                class="px-3 py-2 rounded-lg border text-sm outline-none"
                style="border-color: var(--gray-200); background: var(--gray-50); color: var(--text-primary)"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold" style="color: var(--text-secondary)">Password Baru</label>
              <input v-model="pw.new1" type="password"
                class="px-3 py-2 rounded-lg border text-sm outline-none"
                style="border-color: var(--gray-200); background: var(--gray-50); color: var(--text-primary)"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold" style="color: var(--text-secondary)">Konfirmasi</label>
              <input v-model="pw.new2" type="password"
                class="px-3 py-2 rounded-lg border text-sm outline-none"
                style="border-color: var(--gray-200); background: var(--gray-50); color: var(--text-primary)"
              />
            </div>
            <div v-if="pw.msg" class="text-xs font-semibold px-3 py-2 rounded-lg"
              :style="pw.ok ? 'background:#dcfce7;color:#166534' : 'background:#fee2e2;color:#991b1b'">
              {{ pw.msg }}
            </div>
            <button @click="changePassword"
              class="w-full py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer border-none"
              style="background: var(--olive-700)">Ganti Password</button>
          </div>
        </div>

      </div>
    </template>

    <AppFooter />
  </div>
</template>

<script setup>
import { useConfig, DEFAULTS } from '~/composables/useConfig'

const { config, loadConfig, saveConfig, applyConfig, resetConfig } = useConfig()

const THEMES = [
  {
    id: 'olive',
    name: 'Olive & Cream',
    font_display: 'Playfair Display',
    font_body:    'DM Sans',
    color_primary:   '#5c6b3a',
    color_secondary: '#4a7fa5',
    color_accent:    '#c4a04a',
    bg: '#faf8f4',
  },
  {
    id: 'navy',
    name: 'Navy & Gold',
    font_display: 'Merriweather',
    font_body:    'Inter',
    color_primary:   '#1e3a5f',
    color_secondary: '#c9a84c',
    color_accent:    '#e8c56d',
    bg: '#f8f9fc',
  },
  {
    id: 'emerald',
    name: 'Emerald & Slate',
    font_display: 'Plus Jakarta Sans',
    font_body:    'Plus Jakarta Sans',
    color_primary:   '#065f46',
    color_secondary: '#0891b2',
    color_accent:    '#f59e0b',
    bg: '#f0fdf4',
  },
]

const authenticated = ref(false)
const authFailed    = ref(false)
const googleUser    = ref(null)

const config2 = useRuntimeConfig()
const apiBase = config2.public.apiBase.replace('/api', '')
const googleAuthUrl = `${apiBase}/auth/google`

const authBase = computed(() => config2.public.apiBase.replace('/api', ''))

async function checkAuth() {
  try {
    const res = await $fetch(`${authBase.value}/auth/me`, {
      credentials: 'include'
    })
    if (res.authenticated) {
      authenticated.value = true
      googleUser.value = res.user
    } else {
      authenticated.value = false
    }
  } catch (e) {
    authenticated.value = false
  }
}

async function logout() {
  await $fetch(`${authBase.value}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  }).catch(() => {})
  authenticated.value = false
  googleUser.value = null
}

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const authStatus = urlParams.get('auth')

  if (authStatus === 'failed') {
    authFailed.value = true
    window.history.replaceState({}, '', '/admin')
  } else if (authStatus === 'success') {
    window.history.replaceState({}, '', '/admin')
  }

  await checkAuth()
  loadConfig()
  syncForm()
  applyConfig(config.value)
})

const form = ref({ ...DEFAULTS })

function syncForm() {
  if (config.value) Object.assign(form.value, config.value)
}

function pickTheme(theme) {
  form.value.selected_theme  = theme.id
  form.value.color_primary   = theme.color_primary
  form.value.color_secondary = theme.color_secondary
  form.value.color_accent    = theme.color_accent
  form.value.font_display    = theme.font_display
  form.value.font_body       = theme.font_body
  applyConfig({ ...form.value })
}

const msg = ref(null)

function save() {
  saveConfig({ ...form.value })
  msg.value = { type: 'success', text: '✅ Tersimpan!' }
  setTimeout(() => msg.value = null, 2500)
}

function reset() {
  if (!confirm('Reset semua ke default?')) return
  resetConfig()
  form.value = { ...DEFAULTS }
  msg.value = { type: 'success', text: '✅ Direset ke default!' }
  setTimeout(() => msg.value = null, 2500)
}

const pw = ref({ old: '', new1: '', new2: '', msg: '', ok: false })

function changePassword() {
  const correct = form.value.admin_password || DEFAULTS.admin_password
  if (pw.value.old !== correct)          { pw.value.msg = 'Password lama salah'; pw.value.ok = false; return }
  if (pw.value.new1 !== pw.value.new2)   { pw.value.msg = 'Konfirmasi tidak cocok'; pw.value.ok = false; return }
  if (pw.value.new1.length < 4)          { pw.value.msg = 'Minimal 4 karakter'; pw.value.ok = false; return }
  form.value.admin_password = pw.value.new1
  saveConfig({ ...form.value })
  pw.value = { old: '', new1: '', new2: '', msg: '✅ Password diganti!', ok: true }
}

const sectionToggles = [
  { key: 'show_kpi',          icon: '📊', label: 'KPI Cards',     desc: '6 kartu statistik utama' },
  { key: 'show_chart_bar',    icon: '📈', label: 'Bar Chart',      desc: 'Top 10 provinsi' },
  { key: 'show_chart_agama',  icon: '☪️',  label: 'Chart Agama',   desc: 'Distribusi agama' },
  { key: 'show_chart_gender', icon: '👥', label: 'Chart Kelamin',  desc: 'Distribusi jenis kelamin' },
  { key: 'show_chart_usia',   icon: '🎂', label: 'Chart Usia',     desc: 'Kelompok usia' },
  { key: 'show_map',          icon: '🗺️', label: 'Peta Indonesia', desc: 'Heatmap sebaran provinsi' },
]

const kpiLabels = [
  { key: 'label_kpi_total',    icon: '👥', hint: 'Total Penyuluh' },
  { key: 'label_kpi_provinsi', icon: '🗺️', hint: 'Provinsi Terlayani' },
  { key: 'label_kpi_satker',   icon: '🏢', hint: 'Satuan Kerja' },
  { key: 'label_kpi_usia',     icon: '🎂', hint: 'Rata-rata Usia' },
  { key: 'label_kpi_islam',    icon: '☪️',  hint: 'Penyuluh Islam' },
  { key: 'label_kpi_gaji',     icon: '💰', hint: 'Rata-rata Belanja' },
]

onMounted(() => {
  loadConfig()
  syncForm()
  if (sessionStorage.getItem('admin_auth')) authenticated.value = true
})

useHead({ title: 'Admin — Dashboard Penyuluh Agama' })
</script>