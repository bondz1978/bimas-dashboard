# 🕌 Dashboard Penyuluh Agama — Bimas Islam

Dashboard data penyuluh agama berbasis **Nuxt 3** (frontend) + **Express** (backend).

---

## 🏗️ Struktur Project

```
bimas-dashboard/
├── backend/                  # Express API
│   ├── server.js             # Entry point + semua routes
│   └── package.json
│
├── frontend/                 # Nuxt 3 App
│   ├── app.vue               # Root component
│   ├── nuxt.config.ts        # Konfigurasi Nuxt
│   ├── pages/
│   │   └── index.vue         # Halaman utama dashboard
│   ├── components/
│   │   ├── AppHeader.vue     # Header + brand
│   │   ├── AppFooter.vue     # Footer
│   │   ├── KpiGrid.vue       # 6 KPI cards
│   │   ├── BarChart.vue      # Horizontal bar — Top 10 Provinsi
│   │   ├── DonutChart.vue    # Reusable donut chart
│   │   └── IndonesiaMap.vue  # Peta Indonesia SVG heatmap
│   ├── composables/
│   │   └── useDashboard.js   # Fetch semua data dari API
│   └── assets/
│       └── css/
│           └── main.css      # Design system + semua styles
│
└── package.json              # Root scripts
```

---

## 🚀 Cara Menjalankan

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Jalankan development server

**Terminal 1 — Backend (Express port 3001):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (Nuxt port 3000):**
```bash
cd frontend
npm run dev
```

### 3. Buka browser
```
http://localhost:3000
```

---

## 📡 API Endpoints (Express :3001)

| Method | Endpoint              | Deskripsi                        |
|--------|-----------------------|----------------------------------|
| GET    | `/api/health`         | Status server                    |
| GET    | `/api/summary`        | Ringkasan statistik utama        |
| GET    | `/api/provinsi`       | Semua 34 provinsi + total        |
| GET    | `/api/provinsi/top`   | Top N provinsi (`?n=10`)         |
| GET    | `/api/agama`          | Distribusi agama                 |
| GET    | `/api/kelamin`        | Distribusi jenis kelamin         |
| GET    | `/api/usia`           | Distribusi kelompok usia         |
| GET    | `/api/satker`         | Distribusi satuan kerja          |

---

## 🎨 Tech Stack

| Layer     | Teknologi                          |
|-----------|------------------------------------|
| Frontend  | **Nuxt 3** (Vue 3 + Composition API) |
| Backend   | **Express** (Node.js ES Modules)   |
| CSS       | Custom CSS (Design System, variabel CSS) |
| Charts    | **Chart.js** + vue-chartjs         |
| Map       | SVG Indonesia (MapSVG) + heatmap   |
| Font      | Playfair Display + DM Sans         |

---

## 🎨 Design System

Palet warna di `assets/css/main.css`:

| Token           | Warna       | Penggunaan              |
|-----------------|-------------|-------------------------|
| `--olive-700`   | `#5c6b3a`   | Primary accent, chart   |
| `--sky-500`     | `#4a7fa5`   | Secondary, donut        |
| `--gold-400`    | `#c4a04a`   | Tertiary accent         |
| `--cream`       | `#faf8f4`   | Background utama        |
| `--white`       | `#ffffff`   | Card backgrounds        |

---

## 🔌 Integrasi Database (Opsional)

Saat ini data di `backend/server.js` bersifat statis.
Untuk integrasi PostgreSQL (dari sesi sebelumnya):

```bash
npm install pg
```

Lalu ganti array data di `server.js` dengan query ke database:

```js
import pg from 'pg'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

app.get('/api/provinsi', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT provinsi as name, COUNT(*) as total FROM penyuluh GROUP BY provinsi ORDER BY total DESC'
  )
  res.json(rows)
})
```

---

## 📝 Catatan

- Backend berjalan di port **3001**, frontend di port **3000**
- CORS sudah dikonfigurasi untuk `localhost:3000 → localhost:3001`
- Untuk production, set environment variable `API_BASE` di `.env`
- File SVG peta Indonesia menggunakan koordinat dari **MapSVG** plugin

---

*Dibuat untuk Bimas Islam — Kementerian Agama Republik Indonesia*
