// ── useLang.js — Global language state ──
import { ref, computed } from 'vue'

const lang = ref('id') // 'id' | 'en'

export function useLang() {
  function setLang(l) {
    lang.value = l
    if (typeof localStorage !== 'undefined') localStorage.setItem('lang', l)
  }

  function toggleLang() {
    setLang(lang.value === 'id' ? 'en' : 'id')
  }

  function t(id, en) {
    return lang.value === 'en' ? en : id
  }

  return { lang, setLang, toggleLang, t }
}

// ── Translations dictionary ──
export const TRANSLATIONS = {
  // Header
  'nav.dashboard':   { id: '📊 Dashboard',        en: '📊 Dashboard' },
  'nav.data':        { id: '📋 Data Penyuluh',     en: '📋 Staff Data' },

  // KPI
  'kpi.total':       { id: 'Total Penyuluh',       en: 'Total Staff' },
  'kpi.provinsi':    { id: 'Provinsi Terlayani',   en: 'Provinces Served' },
  'kpi.satker':      { id: 'Satuan Kerja',         en: 'Work Units' },
  'kpi.usia':        { id: 'Rata-rata Usia',       en: 'Average Age' },
  'kpi.islam':       { id: 'Penyuluh Islam',       en: 'Islamic Staff' },
  'kpi.gaji':        { id: 'Rata-rata Belanja',    en: 'Avg. Expenditure' },
  'kpi.sub.provinsi':{ id: 'Sabang – Merauke',     en: 'Sabang – Merauke' },
  'kpi.sub.usia':    { id: 'Range 22–36 tahun',    en: 'Range 22–36 years' },
  'kpi.sub.gaji':    { id: 'Per penyuluh / bulan', en: 'Per staff / month' },

  // Charts
  'chart.agama':     { id: 'Distribusi Agama',     en: 'Religion Distribution' },
  'chart.kelamin':   { id: 'Jenis Kelamin',        en: 'Gender' },
  'chart.usia':      { id: 'Kelompok Usia',        en: 'Age Groups' },
  'chart.topProv':   { id: 'Top 10 Provinsi',      en: 'Top 10 Provinces' },
  'chart.map':       { id: 'Sebaran Penyuluh per Provinsi', en: 'Staff Distribution by Province' },

  // Agama
  'agama.Islam':     { id: 'Islam',    en: 'Islam' },
  'agama.Kristen':   { id: 'Kristen',  en: 'Christian' },
  'agama.Katolik':   { id: 'Katolik',  en: 'Catholic' },
  'agama.Hindu':     { id: 'Hindu',    en: 'Hindu' },
  'agama.Buddha':    { id: 'Buddha',   en: 'Buddhist' },
  'agama.Lainnya':   { id: 'Lainnya',  en: 'Others' },

  // Kelamin
  'kelamin.Laki-laki': { id: 'Laki-laki', en: 'Male' },
  'kelamin.Perempuan': { id: 'Perempuan', en: 'Female' },

  // Usia
  'usia.0': { id: '< 25 tahun',   en: '< 25 years' },
  'usia.1': { id: '25–27 tahun',  en: '25–27 years' },
  'usia.2': { id: '28–30 tahun',  en: '28–30 years' },
  'usia.3': { id: '> 30 tahun',   en: '> 30 years' },

  // Data page
  'data.title':      { id: 'Data Penyuluh Agama',  en: 'Religious Staff Data' },
  'data.search':     { id: 'Cari nama / NIP...',   en: 'Search name / NIP...' },
  'data.provinsi':   { id: 'Semua Provinsi',        en: 'All Provinces' },
  'data.agama':      { id: 'Semua Agama',           en: 'All Religions' },
  'data.satker':     { id: 'Semua Satker',          en: 'All Units' },
  'data.export.excel': { id: '📊 Export Excel',    en: '📊 Export Excel' },
  'data.export.pdf':   { id: '📄 Export PDF',      en: '📄 Export PDF' },
  'data.showing':    { id: 'Menampilkan',           en: 'Showing' },
  'data.of':         { id: 'dari',                  en: 'of' },
  'data.records':    { id: 'data',                  en: 'records' },

  // Table headers
  'th.no':       { id: 'No',           en: 'No' },
  'th.nama':     { id: 'Nama',         en: 'Name' },
  'th.nip':      { id: 'NIP',          en: 'NIP' },
  'th.gol':      { id: 'Golongan',     en: 'Grade' },
  'th.satker':   { id: 'Satuan Kerja', en: 'Work Unit' },
  'th.agama':    { id: 'Agama',        en: 'Religion' },
  'th.kelamin':  { id: 'Kelamin',      en: 'Gender' },
  'th.belanja':  { id: 'Total Belanja', en: 'Total Expenditure' },

  // Provinsi detail
  'prov.back':       { id: '← Dashboard',              en: '← Dashboard' },
  'prov.sub':        { id: 'Kanwil Kementerian Agama · Bimas Islam', en: 'Regional Ministry of Religious Affairs · Islamic Guidance' },
  'prov.total':      { id: 'Total Penyuluh',            en: 'Total Staff' },
  'prov.rataUsia':   { id: 'Rata-rata Usia',            en: 'Average Age' },
  'prov.kua':        { id: 'Satker KUA',                en: 'KUA Units' },
  'prov.kemenag':    { id: 'Satker Kemenag',            en: 'Kemenag Units' },
  'prov.belanja':    { id: 'Rata-rata Belanja',         en: 'Avg. Expenditure' },
  'prov.topSatker':  { id: 'Top Satuan Kerja',          en: 'Top Work Units' },
  'prov.daftar':     { id: 'Daftar Penyuluh (15 teratas)', en: 'Staff List (top 15)' },
  'prov.lihatSemua': { id: 'Lihat Semua di Tabel →',   en: 'View All in Table →' },

  // Map tooltip
  'map.tooltip':     { id: 'penyuluh',                  en: 'staff' },
  'map.click':       { id: 'Klik provinsi untuk detail', en: 'Click province for details' },
  'map.sedikit':     { id: 'Sedikit',                   en: 'Few' },
  'map.banyak':      { id: 'Banyak',                    en: 'Many' },

  // Footer
  'footer.copy':     { id: 'Kementerian Agama RI · Direktorat Bimas Islam', en: 'Ministry of Religious Affairs · Islamic Guidance Directorate' },
  'footer.data':     { id: 'Data ASN Penyuluh Agama CPNS 2025', en: 'Religious Staff Civil Servant Data 2025' },
}

export function tr(key, langVal) {
  const entry = TRANSLATIONS[key]
  if (!entry) return key
  return entry[langVal] ?? entry.id
}