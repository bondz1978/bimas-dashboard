// ── useConfig.js — Config disimpan di localStorage ──

const config = ref(null)
const configLoaded = ref(false)

export const DEFAULTS = {
  site_title:        'Dashboard Penyuluh Agama',
  site_description:  'Bimas Islam · Kementerian Agama RI',
  color_primary:     '#5c6b3a',
  color_secondary:   '#4a7fa5',
  color_accent:      '#c4a04a',
  show_map:          'true',
  show_kpi:          'true',
  show_chart_agama:  'true',
  show_chart_gender: 'true',
  show_chart_usia:   'true',
  show_chart_bar:    'true',
  label_kpi_total:   'Total Penyuluh',
  label_kpi_provinsi:'Provinsi Terlayani',
  label_kpi_usia:    'Rata-rata Usia',
  label_kpi_islam:   'Penyuluh Islam',
  label_kpi_satker:  'Satuan Kerja',
  label_kpi_gaji:    'Rata-rata Belanja',
  admin_password:    'admin123',
  font_display:      'Playfair Display',
  font_body:         'DM Sans',
  selected_theme:    'olive',
}

const THEME_FONTS = {
  olive:   'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap',
  navy:    'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap',
  emerald: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap',
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return [r,g,b]
}
function toHex(r,g,b) {
  return '#'+[r,g,b].map(v=>Math.min(255,Math.max(0,Math.round(v))).toString(16).padStart(2,'0')).join('')
}
function mix(hex, pct) { // pct > 0 = lighten, < 0 = darken
  try {
    const [r,g,b] = hexToRgb(hex)
    if (pct > 0) return toHex(r+(255-r)*pct/100, g+(255-g)*pct/100, b+(255-b)*pct/100)
    else         return toHex(r*(1+pct/100), g*(1+pct/100), b*(1+pct/100))
  } catch { return hex }
}

export function useConfig() {
  function loadConfig() {
    if (typeof localStorage === 'undefined') {
      config.value = { ...DEFAULTS }
      configLoaded.value = true
      return
    }
    try {
      const saved = localStorage.getItem('dashboard_config')
      config.value = saved ? { ...DEFAULTS, ...JSON.parse(saved) } : { ...DEFAULTS }
    } catch {
      config.value = { ...DEFAULTS }
    }
    configLoaded.value = true
    applyConfig(config.value)
  }

  function saveConfig(updates) {
    const merged = { ...config.value, ...updates }
    config.value = merged
    localStorage.setItem('dashboard_config', JSON.stringify(merged))
    applyConfig(merged)
    return true
  }

  function applyConfig(cfg) {
    if (typeof document === 'undefined') return

    const p  = cfg.color_primary   || DEFAULTS.color_primary
    const s  = cfg.color_secondary || DEFAULTS.color_secondary
    const a  = cfg.color_accent    || DEFAULTS.color_accent
    const fd = cfg.font_display    || DEFAULTS.font_display
    const fb = cfg.font_body       || DEFAULTS.font_body

    // Inject <style id="theme-override"> langsung ke <head>
    // Lebih spesifik dari semua scoped CSS karena pakai !important
    const id = 'theme-override'
    let el = document.getElementById(id)
    if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el) }

    el.textContent = `
      :root, :root * {
        --olive-900: ${mix(p,-30)} !important;
        --olive-700: ${p} !important;
        --olive-500: ${mix(p,20)} !important;
        --olive-400: ${mix(p,35)} !important;
        --olive-300: ${mix(p,50)} !important;
        --olive-200: ${mix(p,62)} !important;
        --olive-100: ${mix(p,75)} !important;
        --olive-50:  ${mix(p,87)} !important;

        --sky-700:   ${mix(s,-20)} !important;
        --sky-500:   ${s} !important;
        --sky-400:   ${mix(s,20)} !important;
        --sky-300:   ${mix(s,40)} !important;
        --sky-100:   ${mix(s,65)} !important;
        --sky-50:    ${mix(s,80)} !important;

        --gold-700:  ${mix(a,-25)} !important;
        --gold-500:  ${mix(a,-10)} !important;
        --gold-400:  ${a} !important;
        --gold-300:  ${mix(a,25)} !important;
        --gold-100:  ${mix(a,60)} !important;
        --gold-50:   ${mix(a,78)} !important;

        --font-display: '${fd}', Georgia, serif !important;
        --font-body:    '${fb}', system-ui, sans-serif !important;
      }
    `

    // Google Fonts
    const fontLinkId = 'dynamic-gfonts'
    let link = document.getElementById(fontLinkId)
    if (!link) { link = document.createElement('link'); link.id = fontLinkId; link.rel = 'stylesheet'; document.head.appendChild(link) }
    const theme = cfg.selected_theme || 'olive'
    link.href = THEME_FONTS[theme] || THEME_FONTS.olive
  }

  function resetConfig() {
    config.value = { ...DEFAULTS }
    localStorage.removeItem('dashboard_config')
    // Hapus override agar kembali ke main.css
    const el = document.getElementById('theme-override')
    if (el) el.textContent = ''
  }

  const showMap         = computed(() => config.value?.show_map          !== 'false')
  const showKpi         = computed(() => config.value?.show_kpi          !== 'false')
  const showChartAgama  = computed(() => config.value?.show_chart_agama  !== 'false')
  const showChartGender = computed(() => config.value?.show_chart_gender !== 'false')
  const showChartUsia   = computed(() => config.value?.show_chart_usia   !== 'false')
  const showChartBar    = computed(() => config.value?.show_chart_bar    !== 'false')

  return {
    config, configLoaded,
    loadConfig, saveConfig, applyConfig, resetConfig,
    showMap, showKpi, showChartAgama, showChartGender, showChartUsia, showChartBar,
  }
}
