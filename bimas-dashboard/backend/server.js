import express from 'express'
import cors from 'cors'
import pg from 'pg'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import session from 'express-session'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import crypto from 'crypto'

const { Pool } = pg
const app  = express()
const PORT = process.env.PORT || 3001

// ─────────────────────────────────────────────────────────
//  SESSION & PASSPORT
// ─────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true
}))

app.use(session({
  secret: process.env.SESSION_SECRET || 'bimas_secret_key_2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 jam
    sameSite: 'lax',
    secure: false  // true jika pakai HTTPS
  }
}))

app.use(passport.initialize())
app.use(passport.session())

// Email yang diizinkan jadi admin (dari .env, pisah koma)
const ALLOWED_EMAILS = (process.env.ADMIN_ALLOWED_EMAILS || '')
  .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

// Simple token store (in-memory) — token → user data
const tokenStore = new Map()

function generateToken(user) {
  const token = crypto.randomBytes(32).toString('hex')
  tokenStore.set(token, { ...user, expires: Date.now() + 24 * 60 * 60 * 1000 })
  return token
}

function validateToken(token) {
  const data = tokenStore.get(token)
  if (!data) return null
  if (Date.now() > data.expires) { tokenStore.delete(token); return null }
  return data
}

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
}, (_accessToken, _refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value?.toLowerCase()
  if (!email || !ALLOWED_EMAILS.includes(email)) {
    return done(null, false, { message: 'Email tidak diizinkan' })
  }
  return done(null, { id: profile.id, email, name: profile.displayName, photo: profile.photos?.[0]?.value })
}))

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

// ─────────────────────────────────────────────────────────
//  AUTH ROUTES — Google OAuth
// ─────────────────────────────────────────────────────────
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failed', session: false }),
  (req, res) => {
    const token = generateToken(req.user)
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000'
    res.redirect(`${frontend}/admin?auth=success&token=${token}`)
  }
)

app.get('/auth/failed', (_req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin?auth=failed`)
})

app.get('/auth/me', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '')
  if (!token) return res.json({ authenticated: false })
  const user = validateToken(token)
  if (user) {
    res.json({ authenticated: true, user })
  } else {
    res.json({ authenticated: false })
  }
})

app.post('/auth/logout', (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '')
  if (token) tokenStore.delete(token)
  res.json({ ok: true })
})

// ─────────────────────────────────────────────────────────
//  DATABASE CONNECTION
// ─────────────────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'dashboard_db',
  user:     process.env.DB_USER     || 'ambarijulianto',
  password: process.env.DB_PASSWORD || '',
})

pool.connect((err, client, release) => {
  if (err) { console.error('❌  Gagal koneksi ke PostgreSQL:', err.message) }
  else     { console.log('✅  Terhubung ke PostgreSQL — dashboard_db'); release() }
})

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
const PROVINSI_ID_MAP = {
  'Aceh':'ID-AC','Bali':'ID-BA','Kepulauan Bangka Belitung':'ID-BB',
  'Bangka Belitung':'ID-BB','Bengkulu':'ID-BE','Banten':'ID-BT',
  'Gorontalo':'ID-GO','Jambi':'ID-JA','Jawa Barat':'ID-JB',
  'Jawa Timur':'ID-JI','DKI Jakarta':'ID-JK','Jakarta':'ID-JK',
  'Jawa Tengah':'ID-JT','Kalimantan Barat':'ID-KB','Kalimantan Timur':'ID-KI',
  'Kepulauan Riau':'ID-KR','Kalimantan Selatan':'ID-KS','Kalimantan Tengah':'ID-KT',
  'Kalimantan Utara':'ID-KU','Lampung':'ID-LA','Maluku':'ID-MA',
  'Maluku Utara':'ID-MU','Nusa Tenggara Barat':'ID-NB','Nusa Tenggara Timur':'ID-NT',
  'Papua':'ID-PA',
  'Papua Barat':'ID-PB',
  'Papua Barat Daya':'ID-PB',    // pemekaran → Papua Barat (ID-PB)
  'Papua Pegunungan':'ID-PA',    // pemekaran → Papua (ID-PA)
  'Papua Tengah':'ID-PA',        // pemekaran → Papua (ID-PA)
  'Papua Selatan':'ID-PA',       // pemekaran → Papua (ID-PA)
  'Riau':'ID-RI',
  'Sulawesi Utara':'ID-SA','Sumatera Barat':'ID-SB','Sulawesi Tenggara':'ID-SG',
  'Sulawesi Selatan':'ID-SN','Sulawesi Barat':'ID-SR','Sumatera Selatan':'ID-SS',
  'Sulawesi Tengah':'ID-ST','Sumatera Utara':'ID-SU',
  'DI Yogyakarta':'ID-YO','Yogyakarta':'ID-YO','Di Yogyakarta':'ID-YO',
  'D.I. Yogyakarta':'ID-YO','Daerah Istimewa Yogyakarta':'ID-YO','DIY':'ID-YO',
}

function extractProvinsi(raw) {
  if (!raw) return null
  let name = raw
    .replace(/Kanwil Kementerian Agama Provinsi/gi, '')
    .replace(/Kanwil Kementerian Agama Daerah Istimewa/gi, '')
    .replace(/Kantor Wilayah Kementerian Agama/gi, '')
    .replace(/Provinsi/gi, '')
    .trim()

  // Normalisasi pemekaran Papua (6 provinsi baru → mapping ke SVG yang tersedia)
  // Papua Barat Daya → Papua Barat (ID-PB)
  if (/papua barat daya/i.test(name)) return 'Papua Barat Daya'
  // Papua Pegunungan, Papua Tengah, Papua Selatan → Papua (ID-PA)
  if (/papua pegunungan/i.test(name)) return 'Papua Pegunungan'
  if (/papua tengah/i.test(name))     return 'Papua Tengah'
  if (/papua selatan/i.test(name))    return 'Papua Selatan'

  return name
}

// ─────────────────────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────────────────────
app.use(express.json())
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString('id-ID')}] ${req.method} ${req.path}`)
  next()
})

// ─────────────────────────────────────────────────────────
//  ROUTES — DATA API
// ─────────────────────────────────────────────────────────

app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() }) }
  catch (err) { res.status(500).json({ status: 'error', error: err.message }) }
})

app.get('/api/summary', async (_req, res) => {
  try {
    const [total, usia, gaji, satker, islamQ] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM asn_penyuluh`),
      pool.query(`SELECT ROUND(AVG(DATE_PART('year', AGE(tanggal_lahir)))::numeric, 1) AS rata_usia FROM asn_penyuluh WHERE tanggal_lahir IS NOT NULL`),
      pool.query(`SELECT ROUND(AVG(total_belanja)::numeric, 0) AS rata_gaji FROM asn_penyuluh`),
      pool.query(`SELECT SUM(CASE WHEN grup_satker ILIKE '%KUA%' THEN 1 ELSE 0 END) AS kua, SUM(CASE WHEN grup_satker NOT ILIKE '%KUA%' THEN 1 ELSE 0 END) AS kemenag FROM asn_penyuluh`),
      pool.query(`SELECT COUNT(*) AS total FROM asn_penyuluh WHERE agama = 1`),
    ])
    const totalPenyuluh = parseInt(total.rows[0].total)
    const islamTotal    = parseInt(islamQ.rows[0].total)
    res.json({
      totalPenyuluh, totalProvinsi: 34,
      rataUsia: parseFloat(usia.rows[0].rata_usia) || 0,
      rataGaji: parseInt(gaji.rows[0].rata_gaji)   || 0,
      pctIslam: parseFloat(((islamTotal / totalPenyuluh) * 100).toFixed(1)),
      satker: { kua: parseInt(satker.rows[0].kua), kemenag: parseInt(satker.rows[0].kemenag) },
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/provinsi', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT satker_provinsi, COUNT(*) AS total FROM asn_penyuluh GROUP BY satker_provinsi ORDER BY total DESC`)
    res.json(rows.map(r => ({ id: PROVINSI_ID_MAP[extractProvinsi(r.satker_provinsi)], name: extractProvinsi(r.satker_provinsi), total: parseInt(r.total) })).filter(r => r.id))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/provinsi/top', async (req, res) => {
  try {
    const n = Math.min(parseInt(req.query.n) || 10, 34)
    // Ambil lebih banyak (n*2) supaya setelah filter tetap dapat n hasil
    const { rows } = await pool.query(`SELECT satker_provinsi, COUNT(*) AS total FROM asn_penyuluh GROUP BY satker_provinsi ORDER BY total DESC LIMIT $1`, [n * 2])
    const result = rows
      .map(r => ({ id: PROVINSI_ID_MAP[extractProvinsi(r.satker_provinsi)], name: extractProvinsi(r.satker_provinsi), total: parseInt(r.total) }))
      .filter(r => r.id)
      .slice(0, n)
    res.json(result)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/agama', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT CASE agama WHEN 1 THEN 'Islam' WHEN 2 THEN 'Kristen' WHEN 3 THEN 'Katolik' WHEN 4 THEN 'Hindu' WHEN 5 THEN 'Buddha' ELSE 'Lainnya' END AS agama, COUNT(*) AS total FROM asn_penyuluh GROUP BY agama ORDER BY total DESC`)
    res.json(rows.map(r => ({ agama: r.agama, total: parseInt(r.total) })))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/kelamin', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT CASE kelamin WHEN 1 THEN 'Laki-laki' WHEN 2 THEN 'Perempuan' ELSE 'Lainnya' END AS jenis, COUNT(*) AS total FROM asn_penyuluh GROUP BY kelamin ORDER BY total DESC`)
    res.json(rows.map(r => ({ jenis: r.jenis, total: parseInt(r.total) })))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/usia', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT CASE WHEN DATE_PART('year', AGE(tanggal_lahir)) < 25 THEN '< 25 tahun' WHEN DATE_PART('year', AGE(tanggal_lahir)) <= 27 THEN '25–27 tahun' WHEN DATE_PART('year', AGE(tanggal_lahir)) <= 30 THEN '28–30 tahun' ELSE '> 30 tahun' END AS kelompok, COUNT(*) AS total FROM asn_penyuluh WHERE tanggal_lahir IS NOT NULL GROUP BY kelompok ORDER BY MIN(DATE_PART('year', AGE(tanggal_lahir)))`)
    res.json(rows.map(r => ({ kelompok: r.kelompok, total: parseInt(r.total) })))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/satker', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT grup_satker AS satker, COUNT(*) AS total FROM asn_penyuluh GROUP BY grup_satker ORDER BY total DESC`)
    res.json(rows.map(r => ({ satker: r.satker, total: parseInt(r.total) })))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// List kab/kota unik — strip prefix KANTOR KEMENTERIAN AGAMA
app.get('/api/kabkota', async (req, res) => {
  try {
    const provinsi = req.query.provinsi || ''
    const params = []
    let whereClause = ''
    if (provinsi) {
      const cleanExpr = "TRIM(REGEXP_REPLACE(REGEXP_REPLACE(satker_provinsi, 'Kanwil Kementerian Agama Daerah Istimewa|Kanwil Kementerian Agama Provinsi|Kantor Wilayah Kementerian Agama|Provinsi', '', 'gi'), '\\s+', ' ', 'g'))"
      whereClause = ` WHERE ${cleanExpr} = $1`
      params.push(provinsi.trim())
    }
    const { rows } = await pool.query(
      `SELECT DISTINCT satuan_kerja AS raw FROM asn_penyuluh${whereClause} ORDER BY satuan_kerja ASC`,
      params
    )
    // Strip prefix di sisi Node.js untuk kontrol lebih presisi
    const result = rows.map(r => {
      const cleaned = r.raw
        .replace(/^KANTOR KEMENTERIAN AGAMA\s*/i, '')
        .replace(/^KABUPATEN\s+/i, 'KAB. ')
        .trim()
      return { kabkota: cleaned || r.raw, raw: r.raw }
    })
    // Deduplicate dan sort
    const seen = new Set()
    const deduped = result.filter(r => {
      if (seen.has(r.kabkota)) return false
      seen.add(r.kabkota)
      return true
    }).sort((a, b) => a.kabkota.localeCompare(b.kabkota))
    res.json(deduped)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/penyuluh', async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1
    const limit    = parseInt(req.query.limit) || 20
    const search   = req.query.search   || ''
    const provinsi = req.query.provinsi || ''
    const agama    = req.query.agama    || ''
    const satker   = req.query.satker   || ''
    const kabkota  = req.query.kabkota  || ''
    const offset   = (page - 1) * limit
    const where    = ['1=1']
    const params   = []
    let i = 1
    if (search)  { where.push(`(nama ILIKE $${i} OR nip_baru ILIKE $${i})`); params.push(`%${search}%`); i++ }
    if (provinsi){
      // Exact match setelah strip prefix — sama persis dengan extractProvinsi()
      const cleanExpr = "TRIM(REGEXP_REPLACE(REGEXP_REPLACE(satker_provinsi, " +
        "'Kanwil Kementerian Agama Daerah Istimewa|Kanwil Kementerian Agama Provinsi|Kantor Wilayah Kementerian Agama|Provinsi', " +
        "'', 'gi'), '\\s+', ' ', 'g'))"
      where.push(cleanExpr + " = $" + i)
      params.push(provinsi.trim())
      i++
    }
    if (agama)   { where.push(`agama = $${i}`); params.push(parseInt(agama)); i++ }
    if (satker)  { where.push(`grup_satker ILIKE $${i}`); params.push(`%${satker}%`); i++ }
    if (kabkota) { where.push(`satuan_kerja = $${i}`); params.push(kabkota); i++ }
    const W2 = where.join(' AND ')
    const [data, count] = await Promise.all([
      pool.query(`SELECT id, nama, nip_baru, golongan, jabatan, satuan_kerja, satker_provinsi, grup_satker, CASE agama WHEN 1 THEN 'Islam' WHEN 2 THEN 'Kristen' WHEN 3 THEN 'Katolik' WHEN 4 THEN 'Hindu' WHEN 5 THEN 'Buddha' ELSE 'Lainnya' END AS agama, CASE kelamin WHEN 1 THEN 'Laki-laki' ELSE 'Perempuan' END AS kelamin, tanggal_lahir, gapok, tunjangan_umum, tunjangan_fungsional, tunjangan_beras, total_belanja FROM asn_penyuluh WHERE ${W2} ORDER BY id LIMIT $${i} OFFSET $${i+1}`, [...params, limit, offset]),
      pool.query(`SELECT COUNT(*) AS total FROM asn_penyuluh WHERE ${W2}`, params),
    ])
    res.json({ data: data.rows, total: parseInt(count.rows[0].total), page, limit, totalPages: Math.ceil(parseInt(count.rows[0].total) / limit) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ─────────────────────────────────────────────────────────
//  ROUTES — EXPORT
// ─────────────────────────────────────────────────────────

app.get('/api/export/excel', async (_req, res) => {
  try {
    const [penyuluh, summary] = await Promise.all([
      pool.query(`
        SELECT nama, nip_baru, golongan, jabatan, satuan_kerja, satker_provinsi, grup_satker,
          CASE agama WHEN 1 THEN 'Islam' WHEN 2 THEN 'Kristen' WHEN 3 THEN 'Katolik' WHEN 4 THEN 'Hindu' WHEN 5 THEN 'Buddha' ELSE 'Lainnya' END AS agama,
          CASE kelamin WHEN 1 THEN 'Laki-laki' ELSE 'Perempuan' END AS kelamin,
          tanggal_lahir, gapok, tunjangan_umum, tunjangan_fungsional, tunjangan_beras, total_belanja
        FROM asn_penyuluh ORDER BY id
      `),
      pool.query(`
        SELECT COUNT(*) AS total,
          ROUND(AVG(DATE_PART('year', AGE(tanggal_lahir)))::numeric, 1) AS rata_usia,
          ROUND(AVG(total_belanja)::numeric, 0) AS rata_gaji,
          SUM(CASE WHEN agama = 1 THEN 1 ELSE 0 END) AS islam,
          SUM(CASE WHEN kelamin = 1 THEN 1 ELSE 0 END) AS laki,
          SUM(CASE WHEN kelamin = 2 THEN 1 ELSE 0 END) AS perempuan,
          SUM(CASE WHEN grup_satker ILIKE '%KUA%' THEN 1 ELSE 0 END) AS kua,
          SUM(CASE WHEN grup_satker NOT ILIKE '%KUA%' THEN 1 ELSE 0 END) AS kemenag
        FROM asn_penyuluh WHERE tanggal_lahir IS NOT NULL
      `),
    ])

    const wb = new ExcelJS.Workbook()
    wb.creator = 'Bimas Islam - Kemenag RI'
    wb.created = new Date()
    const OLIVE = '5C6B3A', WHITE = 'FFFFFF', CREAM = 'F4F6EC'

    // Sheet 1: Ringkasan
    const ws1 = wb.addWorksheet('Ringkasan')
    ws1.mergeCells('A1:C1')
    ws1.getCell('A1').value = 'RINGKASAN DATA PENYULUH AGAMA'
    ws1.getCell('A1').font  = { bold: true, size: 14, color: { argb: WHITE } }
    ws1.getCell('A1').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: OLIVE } }
    ws1.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }
    ws1.getRow(1).height = 32
    ws1.mergeCells('A2:C2')
    ws1.getCell('A2').value = 'Bimas Islam — Kementerian Agama Republik Indonesia'
    ws1.getCell('A2').font  = { size: 10, color: { argb: '6B6760' } }
    ws1.getCell('A2').alignment = { horizontal: 'center' }
    ws1.getRow(2).height = 20
    ws1.addRow([])

    const s = summary.rows[0]
    const summaryRows = [
      ['Indikator', 'Nilai'],
      ['Total Penyuluh', parseInt(s.total)],
      ['Provinsi Terlayani', 34],
      ['Rata-rata Usia', `${s.rata_usia} tahun`],
      ['Rata-rata Belanja', parseInt(s.rata_gaji)],
      ['', ''],
      ['Penyuluh Islam', parseInt(s.islam)],
      ['Laki-laki', parseInt(s.laki)],
      ['Perempuan', parseInt(s.perempuan)],
      ['Satker KUA', parseInt(s.kua)],
      ['Satker Kemenag', parseInt(s.kemenag)],
    ]
    summaryRows.forEach((row, i) => {
      const r = ws1.addRow(row)
      r.height = 22
      if (i === 0) {
        r.font = { bold: true, color: { argb: WHITE } }
        r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7A8C4E' } }
      } else if (row[0]) {
        r.getCell(1).font = { color: { argb: '3A3830' } }
        r.getCell(2).font = { bold: true, color: { argb: OLIVE } }
        if (row[0] === 'Rata-rata Belanja') r.getCell(2).numFmt = '"Rp "#,##0'
        r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? CREAM : WHITE } }
      }
    })
    ws1.getColumn(1).width = 28
    ws1.getColumn(2).width = 22

    // Sheet 2: Data Penyuluh
    const ws2 = wb.addWorksheet('Data Penyuluh')
    const headers = ['No','Nama','NIP','Golongan','Jabatan','Satuan Kerja','Provinsi','Grup Satker','Agama','Jenis Kelamin','Tanggal Lahir','Gapok','Tunj. Umum','Tunj. Fungsional','Tunj. Beras','Total Belanja']
    const hRow = ws2.addRow(headers)
    hRow.height = 28
    hRow.eachCell(cell => {
      cell.font      = { bold: true, color: { argb: WHITE }, size: 9 }
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: OLIVE } }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    })
    penyuluh.rows.forEach((p, i) => {
      const row = ws2.addRow([
        i+1, p.nama, p.nip_baru, p.golongan, p.jabatan,
        p.satuan_kerja, extractProvinsi(p.satker_provinsi), p.grup_satker,
        p.agama, p.kelamin,
        p.tanggal_lahir ? new Date(p.tanggal_lahir).toLocaleDateString('id-ID') : '-',
        parseInt(p.gapok)||0, parseInt(p.tunjangan_umum)||0,
        parseInt(p.tunjangan_fungsional)||0, parseInt(p.tunjangan_beras)||0,
        parseInt(p.total_belanja)||0,
      ])
      row.height = 17
      if (i % 2 === 1) row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } } })
      ;[12,13,14,15,16].forEach(col => {
        row.getCell(col).numFmt    = '"Rp "#,##0'
        row.getCell(col).alignment = { horizontal: 'right' }
      })
    })
    ;[5,30,20,10,30,35,22,15,10,12,14,14,13,17,13,14].forEach((w, i) => { ws2.getColumn(i+1).width = w })
    ws2.views      = [{ state: 'frozen', ySplit: 1 }]
    ws2.autoFilter = { from: 'A1', to: 'P1' }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=Data_Penyuluh_Agama_${new Date().toISOString().slice(0,10)}.xlsx`)
    await wb.xlsx.write(res)
    res.end()
  } catch (err) {
    console.error('/api/export/excel error:', err.message)
    if (!res.headersSent) res.status(500).json({ error: err.message })
  }
})

app.get('/api/export/pdf', async (_req, res) => {
  try {
    const [penyuluh, summary, agamaRows, provinsiRows] = await Promise.all([
      pool.query(`
        SELECT nama, nip_baru, golongan, satker_provinsi,
          CASE agama WHEN 1 THEN 'Islam' WHEN 2 THEN 'Kristen' WHEN 3 THEN 'Katolik' WHEN 4 THEN 'Hindu' WHEN 5 THEN 'Buddha' ELSE 'Lainnya' END AS agama,
          CASE kelamin WHEN 1 THEN 'L' ELSE 'P' END AS kelamin, total_belanja
        FROM asn_penyuluh ORDER BY satker_provinsi, nama
      `),
      pool.query(`
        SELECT COUNT(*) AS total,
          ROUND(AVG(DATE_PART('year', AGE(tanggal_lahir)))::numeric,1) AS rata_usia,
          ROUND(AVG(total_belanja)::numeric,0) AS rata_gaji,
          SUM(CASE WHEN agama=1 THEN 1 ELSE 0 END) AS islam,
          SUM(CASE WHEN kelamin=1 THEN 1 ELSE 0 END) AS laki,
          SUM(CASE WHEN kelamin=2 THEN 1 ELSE 0 END) AS perempuan
        FROM asn_penyuluh WHERE tanggal_lahir IS NOT NULL
      `),
      pool.query(`SELECT CASE agama WHEN 1 THEN 'Islam' WHEN 2 THEN 'Kristen' WHEN 3 THEN 'Katolik' WHEN 4 THEN 'Hindu' WHEN 5 THEN 'Buddha' ELSE 'Lainnya' END AS agama, COUNT(*) AS total FROM asn_penyuluh GROUP BY agama ORDER BY total DESC`),
      pool.query(`SELECT satker_provinsi, COUNT(*) AS total FROM asn_penyuluh GROUP BY satker_provinsi ORDER BY total DESC LIMIT 10`),
    ])

    const doc = new PDFDocument({ margin: 45, size: 'A4', bufferPages: true })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Penyuluh_${new Date().toISOString().slice(0,10)}.pdf`)
    doc.pipe(res)

    const OL    = '#5c6b3a'
    const PW    = doc.page.width - 90
    const s     = summary.rows[0]
    const total = parseInt(s.total)

    const sectionTitle = (txt) => {
      doc.moveDown(0.5)
      doc.rect(45, doc.y, PW, 20).fill(OL)
      doc.fillColor('white').fontSize(10).font('Helvetica-Bold').text(txt, 52, doc.y - 14)
      doc.moveDown(0.8)
    }

    // Halaman 1: Summary
    doc.rect(45, 45, PW, 65).fill(OL)
    doc.fillColor('white').fontSize(15).font('Helvetica-Bold').text('LAPORAN DATA PENYULUH AGAMA', 55, 58, { width: PW - 20 })
    doc.fillColor('rgba(255,255,255,0.8)').fontSize(9).font('Helvetica').text('Bimas Islam — Kementerian Agama Republik Indonesia', 55, 80)
    doc.fillColor('rgba(255,255,255,0.6)').fontSize(8).text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}`, 55, 95)
    doc.y = 125

    sectionTitle('RINGKASAN STATISTIK')
    const kpis = [
      ['Total Penyuluh', parseInt(s.total).toLocaleString('id-ID')],
      ['Provinsi Terlayani', '34 Provinsi'],
      ['Rata-rata Usia', `${s.rata_usia} tahun`],
      ['Rata-rata Belanja', `Rp ${parseInt(s.rata_gaji).toLocaleString('id-ID')}`],
      ['Penyuluh Islam', `${parseInt(s.islam).toLocaleString('id-ID')} (${((s.islam/s.total)*100).toFixed(1)}%)`],
      ['Laki-laki / Perempuan', `${parseInt(s.laki).toLocaleString('id-ID')} / ${parseInt(s.perempuan).toLocaleString('id-ID')}`],
    ]
    const kW = (PW - 8) / 2
    kpis.forEach((kpi, i) => {
      const x = 45 + (i % 2) * (kW + 8)
      const y = doc.y
      doc.rect(x, y, kW, 30).fill(i % 4 < 2 ? '#f4f6ec' : '#edf5fb')
      doc.fillColor('#6b6760').fontSize(7.5).font('Helvetica').text(kpi[0], x+8, y+5)
      doc.fillColor('#2e2c28').fontSize(11).font('Helvetica-Bold').text(kpi[1], x+8, y+15)
      if (i % 2 === 1) doc.moveDown(0.2)
    })

    sectionTitle('TOP 10 PROVINSI')
    const maxP = parseInt(provinsiRows.rows[0]?.total || 1)
    provinsiRows.rows.forEach((p, i) => {
      const name = extractProvinsi(p.satker_provinsi)
      const val  = parseInt(p.total)
      const barW = Math.max(4, (val / maxP) * (PW - 130))
      const y    = doc.y
      doc.rect(45, y, PW, 17).fill(i % 2 === 0 ? 'white' : '#f8f8f7')
      doc.fillColor('#3a3830').fontSize(8).font('Helvetica').text(`${i+1}. ${name}`, 50, y+5, { width: 155 })
      doc.rect(210, y+5, barW, 7).fill(OL)
      doc.fillColor(OL).fontSize(8).font('Helvetica-Bold').text(val.toLocaleString('id-ID'), 215+barW, y+5)
      doc.moveDown(0.05)
    })

    sectionTitle('DISTRIBUSI AGAMA')
    agamaRows.rows.forEach((a, i) => {
      const val  = parseInt(a.total)
      const pct  = ((val / total) * 100).toFixed(1)
      const barW = Math.max(4, (val / total) * (PW - 130))
      const y    = doc.y
      doc.rect(45, y, PW, 17).fill(i % 2 === 0 ? 'white' : '#f8f8f7')
      doc.fillColor('#3a3830').fontSize(8).font('Helvetica').text(a.agama, 50, y+5, { width: 100 })
      doc.rect(155, y+5, barW, 7).fill(OL)
      doc.fillColor(OL).fontSize(8).font('Helvetica-Bold').text(`${val.toLocaleString('id-ID')} (${pct}%)`, 160+barW, y+5)
      doc.moveDown(0.05)
    })

    // Halaman 2+: Tabel Data
    doc.addPage()
    doc.rect(45, 45, PW, 22).fill(OL)
    doc.fillColor('white').fontSize(11).font('Helvetica-Bold').text('DAFTAR PENYULUH AGAMA', 52, 52)

    const cols = [
      { label: 'No',           w: 24,  align: 'center' },
      { label: 'Nama',         w: 148, align: 'left'   },
      { label: 'NIP',          w: 105, align: 'left'   },
      { label: 'Gol',          w: 26,  align: 'center' },
      { label: 'Agama',        w: 40,  align: 'center' },
      { label: 'JK',           w: 16,  align: 'center' },
      { label: 'Total Belanja',w: 76,  align: 'right'  },
    ]

    const drawTableHeader = (y) => {
      doc.rect(45, y, PW, 14).fill('#7a8c4e')
      let x = 45
      cols.forEach(col => {
        doc.fillColor('white').fontSize(7).font('Helvetica-Bold').text(col.label, x+2, y+4, { width: col.w-4, align: col.align })
        x += col.w
      })
      return y + 14
    }

    let tableY  = drawTableHeader(75)
    const rowH  = 13
    const pageH = doc.page.height - 55

    penyuluh.rows.forEach((p, i) => {
      if (tableY + rowH > pageH) {
        doc.addPage()
        tableY = drawTableHeader(45)
      }
      doc.rect(45, tableY, PW, rowH).fill(i % 2 === 0 ? 'white' : '#f4f6ec')
      let x = 45
      const cells = [
        { val: String(i+1),                                                  align: 'center' },
        { val: p.nama || '',                                                  align: 'left'   },
        { val: p.nip_baru || '',                                              align: 'left'   },
        { val: p.golongan || '',                                              align: 'center' },
        { val: p.agama || '',                                                 align: 'center' },
        { val: p.kelamin || '',                                               align: 'center' },
        { val: `Rp ${parseInt(p.total_belanja||0).toLocaleString('id-ID')}`, align: 'right'  },
      ]
      cells.forEach((cell, ci) => {
        doc.fillColor('#2e2c28').fontSize(6.5).font('Helvetica')
           .text(cell.val, x+2, tableY+3.5, { width: cols[ci].w-4, align: cell.align, lineBreak: false, ellipsis: true })
        x += cols[ci].w
      })
      tableY += rowH
    })

    // Footer semua halaman
    const range = doc.bufferedPageRange()
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i)
      doc.fillColor('#a09d96').fontSize(7).font('Helvetica')
         .text(`Halaman ${i+1} dari ${range.count}  —  Bimas Islam, Kementerian Agama Republik Indonesia`, 45, doc.page.height - 25, { width: PW, align: 'center' })
    }

    doc.end()
  } catch (err) {
    console.error('/api/export/pdf error:', err.message)
    if (!res.headersSent) res.status(500).json({ error: err.message })
  }
})

/** GET /api/provinsi/:id — detail satu provinsi (exact match, no ILIKE overflow) */
app.get('/api/provinsi/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Cari semua nama provinsi yang mapped ke SVG ID ini
    const namaList = Object.entries(PROVINSI_ID_MAP)
      .filter(([, v]) => v === id)
      .map(([k]) => k)
    if (!namaList.length) return res.status(404).json({ error: 'Provinsi tidak ditemukan' })

    // SQL: strip prefix lalu exact match — hindari Papua match Papua Barat
    const cleanSQL = "TRIM(REGEXP_REPLACE(REGEXP_REPLACE(satker_provinsi, 'Kanwil Kementerian Agama Daerah Istimewa|Kanwil Kementerian Agama Provinsi|Kantor Wilayah Kementerian Agama|Provinsi', '', 'gi'), '\\s+', ' ', 'g'))"
    const orParams = namaList.map(n => `%${n.trim()}%`)
    const orCond   = namaList.map((_, i) => cleanSQL + ' ILIKE $' + (i + 1)).join(' OR ')
    // Ambil nama aktual hasil strip dari DB (untuk dipakai filter penyuluh)
    const namaActualQ = await pool.query(`SELECT DISTINCT ${cleanSQL} AS nama FROM asn_penyuluh WHERE (${orCond}) LIMIT 1`, orParams)
    const namaActual  = namaActualQ.rows[0]?.nama || namaList[0]

    const [total, agama, kelamin, usia, satker, gaji, topSatker] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM asn_penyuluh WHERE (${orCond})`, orParams),
      pool.query(`SELECT CASE agama WHEN 1 THEN 'Islam' WHEN 2 THEN 'Kristen' WHEN 3 THEN 'Katolik' WHEN 4 THEN 'Hindu' WHEN 5 THEN 'Buddha' ELSE 'Lainnya' END AS agama, COUNT(*) AS total FROM asn_penyuluh WHERE (${orCond}) GROUP BY agama ORDER BY total DESC`, orParams),
      pool.query(`SELECT CASE kelamin WHEN 1 THEN 'Laki-laki' ELSE 'Perempuan' END AS jenis, COUNT(*) AS total FROM asn_penyuluh WHERE (${orCond}) GROUP BY kelamin ORDER BY total DESC`, orParams),
      pool.query(`SELECT CASE WHEN DATE_PART('year', AGE(tanggal_lahir)) < 25 THEN '< 25 tahun' WHEN DATE_PART('year', AGE(tanggal_lahir)) <= 27 THEN '25-27 tahun' WHEN DATE_PART('year', AGE(tanggal_lahir)) <= 30 THEN '28-30 tahun' ELSE '> 30 tahun' END AS kelompok, COUNT(*) AS total FROM asn_penyuluh WHERE (${orCond}) AND tanggal_lahir IS NOT NULL GROUP BY kelompok ORDER BY MIN(DATE_PART('year', AGE(tanggal_lahir)))`, orParams),
      pool.query(`SELECT SUM(CASE WHEN grup_satker ILIKE '%KUA%' THEN 1 ELSE 0 END) AS kua, SUM(CASE WHEN grup_satker NOT ILIKE '%KUA%' THEN 1 ELSE 0 END) AS kemenag FROM asn_penyuluh WHERE (${orCond})`, orParams),
      pool.query(`SELECT ROUND(AVG(total_belanja)::numeric, 0) AS rata_gaji, ROUND(AVG(DATE_PART('year', AGE(tanggal_lahir)))::numeric, 1) AS rata_usia FROM asn_penyuluh WHERE (${orCond}) AND tanggal_lahir IS NOT NULL`, orParams),
      pool.query(`SELECT satuan_kerja, COUNT(*) AS total FROM asn_penyuluh WHERE (${orCond}) GROUP BY satuan_kerja ORDER BY total DESC LIMIT 8`, orParams),
    ])

    res.json({
      id,
      nama: namaActual,
      total:     parseInt(total.rows[0].total),
      rataGaji:  parseInt(gaji.rows[0].rata_gaji)  || 0,
      rataUsia:  parseFloat(gaji.rows[0].rata_usia) || 0,
      satker:    { kua: parseInt(satker.rows[0].kua), kemenag: parseInt(satker.rows[0].kemenag) },
      agama:     agama.rows.map(r => ({ agama: r.agama, total: parseInt(r.total) })),
      kelamin:   kelamin.rows.map(r => ({ jenis: r.jenis, total: parseInt(r.total) })),
      usia:      usia.rows.map(r => ({ kelompok: r.kelompok, total: parseInt(r.total) })),
      topSatker: topSatker.rows.map(r => ({
        satker: r.satuan_kerja
          .replace(/^KANTOR KEMENTERIAN AGAMA\s*/i, '')
          .replace(/^KABUPATEN\s+/i, 'KAB. ')
          .trim(),
        raw: r.satuan_kerja,
        total: parseInt(r.total)
      })),
    })
  } catch (err) {
    console.error('/api/provinsi/:id error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────
//  CONFIG API
// ─────────────────────────────────────────────────────────

/** GET /api/config — ambil semua config */
app.get('/api/config', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM dashboard_config ORDER BY key')
    const config = {}
    rows.forEach(r => { config[r.key] = r.value })
    res.json(config)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

/** POST /api/config — update config (perlu password) */
app.post('/api/config', async (req, res) => {
  try {
    const { password, updates } = req.body
    // Cek password dari DB
    const { rows } = await pool.query("SELECT value FROM dashboard_config WHERE key = 'admin_password'")
    if (!rows.length || rows[0].value !== password) {
      return res.status(401).json({ error: 'Password salah' })
    }
    // Update setiap key
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'admin_password') continue // jangan bisa ubah password via endpoint ini
      await pool.query(
        'INSERT INTO dashboard_config (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
        [key, String(value)]
      )
    }
    res.json({ ok: true, updated: Object.keys(updates).length })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

/** POST /api/config/password — ganti password admin */
app.post('/api/config/password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const { rows } = await pool.query("SELECT value FROM dashboard_config WHERE key = 'admin_password'")
    if (!rows.length || rows[0].value !== oldPassword) {
      return res.status(401).json({ error: 'Password lama salah' })
    }
    await pool.query(
      "UPDATE dashboard_config SET value = $1, updated_at = NOW() WHERE key = 'admin_password'",
      [newPassword]
    )
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ─────────────────────────────────────────────────────────
//  404
// ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ─────────────────────────────────────────────────────────
app.get('/api/debug/provinsi-raw', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT DISTINCT satker_provinsi FROM asn_penyuluh ORDER BY satker_provinsi`)
    res.json(rows.map(r => r.satker_provinsi))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.listen(PORT, () => {
  console.log('\n┌──────────────────────────────────────────┐')
  console.log('│  🟢  Bimas Islam API — Express + PG      │')
  console.log(`│  📡  http://localhost:${PORT}                │`)
  console.log('│  🗄️   dashboard_db (PostgreSQL)           │')
  console.log('│                                          │')
  console.log('│  GET /api/summary                        │')
  console.log('│  GET /api/provinsi /top                  │')
  console.log('│  GET /api/agama /kelamin /usia           │')
  console.log('│  GET /api/penyuluh                       │')
  console.log('│  GET /api/export/excel                   │')
  console.log('│  GET /api/export/pdf                     │')
  console.log('└──────────────────────────────────────────┘\n')
})