<template>
  <header class="sticky top-0 z-50" style="background: var(--white); border-bottom: 1px solid var(--gray-200); box-shadow: var(--shadow-sm)">
    <!-- Gradient accent bar -->
    <div class="h-0.5 w-full" style="background: linear-gradient(90deg, var(--olive-700) 0%, var(--olive-400) 25%, var(--sky-500) 50%, var(--gold-400) 75%, var(--olive-700) 100%)"></div>

    <div class="flex items-center justify-between px-5" style="height: 52px">
      <!-- Brand -->
      <div class="flex items-center gap-3">
        <img src="/logo-kemenag.png" alt="Logo Kemenag" class="w-9 h-9 object-contain flex-shrink-0" />
        <div class="font-bold text-base" style="font-family: var(--font-display); color: var(--text-primary)">
          Dashboard <em class="not-italic" style="color: var(--olive-700)">Penyuluh Agama</em>
        </div>
        <div class="w-px h-6 hidden sm:block" style="background: var(--gray-200)"></div>
        <div class="text-xs font-medium tracking-wider hidden sm:block uppercase" style="color: var(--text-muted)">
          Bimas Islam · Kemenag RI
        </div>
      </div>

      <!-- Nav desktop -->
      <nav class="items-center gap-1 hidden md:flex">
        <NuxtLink
          to="/"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
          style="color: var(--text-secondary)"
          active-class="font-bold"
          :style="$route.path === '/' ? { color: 'var(--olive-700)', background: 'var(--olive-50)' } : {}"
          @click="menuOpen = false"
        >
          {{ tr('nav.dashboard', lang) }}
        </NuxtLink>
        <NuxtLink
          to="/data"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
          style="color: var(--text-secondary)"
          :style="$route.path === '/data' ? { color: 'var(--olive-700)', background: 'var(--olive-50)' } : {}"
          @click="menuOpen = false"
        >
          {{ tr('nav.data', lang) }}
        </NuxtLink>
      </nav>

      <!-- Right controls -->
      <div class="flex items-center gap-2">
        <!-- Lang toggle -->
        <button
          class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200"
          style="border-color: var(--gray-200); background: var(--gray-50); color: var(--text-secondary)"
          @click="toggleLang"
        >
          <span>{{ lang === 'id' ? '🇮🇩' : '🇬🇧' }}</span>
          <span class="tracking-wide" style="font-size: 11px">{{ lang === 'id' ? 'ID' : 'EN' }}</span>
        </button>

        <!-- Dark mode toggle -->
        <button
          class="w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200"
          style="border-color: var(--gray-200); background: var(--gray-50)"
          @click="toggleDark"
          :title="isDark ? 'Light Mode' : 'Dark Mode'"
        >
          <span class="text-base">{{ isDark ? '☀️' : '🌙' }}</span>
        </button>

        <!-- Live badge -->
        <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold"
          style="background: var(--olive-50); border-color: var(--olive-200); color: var(--olive-700)">
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: var(--olive-400)"></span>
          {{ lang === 'id' ? 'Data Penyuluh' : 'Staff Data' }}
        </div>

        <!-- Hamburger mobile -->
        <button
          class="w-8 h-8 rounded-lg border flex items-center justify-center md:hidden text-lg"
          style="border-color: var(--gray-200); background: var(--gray-50)"
          @click="menuOpen = !menuOpen"
        >
          {{ menuOpen ? '✕' : '☰' }}
        </button>
      </div>
    </div>

    <!-- Mobile nav dropdown -->
    <div v-if="menuOpen" class="md:hidden border-t px-4 py-2 flex flex-col gap-1"
      style="border-color: var(--gray-200); background: var(--white)">
      <NuxtLink to="/" class="px-3 py-2.5 rounded-lg text-sm font-semibold transition-all"
        style="color: var(--text-secondary)" @click="menuOpen = false">
        {{ tr('nav.dashboard', lang) }}
      </NuxtLink>
      <NuxtLink to="/data" class="px-3 py-2.5 rounded-lg text-sm font-semibold transition-all"
        style="color: var(--text-secondary)" @click="menuOpen = false">
        {{ tr('nav.data', lang) }}
      </NuxtLink>
    </div>
  </header>
</template>

<script setup>
import { useLang, tr } from '~/composables/useLang'

const { lang, toggleLang } = useLang()
const isDark   = ref(false)
const menuOpen = ref(false)
const route    = useRoute()

function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function handleOutsideClick(e) {
  if (menuOpen.value && !e.target.closest('header')) menuOpen.value = false
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = savedTheme ? savedTheme === 'dark' : prefersDark
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  const savedLang = localStorage.getItem('lang')
  if (savedLang) lang.value = savedLang
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>
