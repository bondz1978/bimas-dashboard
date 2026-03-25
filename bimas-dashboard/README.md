# 🕌 Dashboard Penyuluh Agama — Bimas Islam Kemenag RI

Dashboard data ASN Penyuluh Agama CPNS 2025 berbasis **Nuxt 3** (frontend) + **Express** (backend) + **PostgreSQL**.

![Nuxt 3](https://img.shields.io/badge/Nuxt-3-00DC82?logo=nuxt.js) ![Express](https://img.shields.io/badge/Express-4-000000?logo=express) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

---

## ✨ Fitur

- 📊 **Dashboard KPI** — total penyuluh, rata-rata usia, gaji, distribusi agama
- 🗺️ **Peta Indonesia Interaktif** — klik provinsi untuk lihat detail
- 📋 **Tabel Data Penyuluh** — search, filter provinsi/agama/satker, pagination
- 🏛️ **Halaman Detail Provinsi** — statistik & daftar penyuluh per provinsi
- 🎨 **Admin Panel** — tema preset, konfigurasi KPI, show/hide sections
- 🔐 **Login Google OAuth** — akses admin hanya untuk email yang disetujui
- 🌙 **Dark Mode** — toggle terang/gelap
- 🌐 **Bilingual** — Bahasa Indonesia / English
- 📱 **Responsive** — mobile & desktop

---

## 🏗️ Struktur Project

```
bimas-dashboard/
├── .env.example              ← Template environment variables
├── .gitignore
├── docker-compose.yml        ← Orkestrasi Docker
│
├── backend/                  ← Express API (port 3001)
│   ├── server.js             ← Entry point + semua routes
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                 ← Nuxt 3 App (port 3000)
│   ├── app.vue
│   ├── nuxt.config.ts
│   ├── pages/
│   │   ├── index.vue         ← Dashboard utama
│   │   ├── data.vue          ← Tabel data penyuluh
│   │   ├── admin.vue         ← Panel admin (login Google)
│   │   └── provinsi/
│   │       └── [id].vue      ← Detail per provinsi
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   ├── KpiGrid.vue
│   │   ├── IndonesiaMap.vue
│   │   ├── AgamaChart.vue
│   │   ├── GenderChart.vue
│   │   ├── UsiaChart.vue
│   │   └── BarChart.vue
│   ├── composables/
│   │   ├── useConfig.js      ← Konfigurasi tema & admin
│   │   ├── useDashboard.js   ← Fetch data dari API
│   │   └── useLang.js        ← Bilingual ID/EN
│   └── assets/css/main.css   ← Design system (CSS variables)
│
└── db/
    └── init.sql              ← Schema database
```

---

## ⚙️ Prasyarat

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Mac/Windows) atau Docker Engine (Linux)
- [Node.js 20+](https://nodejs.org/) (untuk development lokal)
- PostgreSQL — bisa lokal atau cloud (Supabase, dll)

---

## 🚀 Instalasi dengan Docker (Rekomendasi)

### 1. Clone repository

```bash
git clone http://localhost:3333/anto/bimas-dashboard.git
cd bimas-dashboard
```

### 2. Buat file `.env`

```bash
cp .env.example .env
```

Edit `.env` sesuaikan dengan konfigurasi kamu:

```env
# Backend
PORT=3001

# Database PostgreSQL
DB_HOST=host.docker.internal   # Mac/Windows: akses DB di luar Docker
DB_PORT=5432
DB_NAME=dashboard_db
DB_USER=postgres
DB_PASSWORD=password_kamu

# Frontend
API_BASE=http://backend:3001/api
NUXT_PUBLIC_API_BASE=http://localhost:3001/api

# Google OAuth Admin
GOOGLE_CLIENT_ID=isi_client_id_dari_google_console
GOOGLE_CLIENT_SECRET=isi_client_secret_dari_google_console
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
ADMIN_ALLOWED_EMAILS=email_admin@gmail.com
SESSION_SECRET=isi_string_acak_panjang
FRONTEND_URL=http://localhost:3000
```

### 3. Import data ke PostgreSQL

```bash
psql -U postgres -d dashboard_db -f db/init.sql
```

### 4. Jalankan dengan Docker Compose

```bash
docker compose build && docker compose up -d
```

### 5. Buka browser

```
http://localhost:3000
```

---

## 💻 Development Lokal (tanpa Docker)

### Backend

```bash
cd backend
npm install
node server.js
# Berjalan di http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Berjalan di http://localhost:3000
```

---

## 🔐 Setup Google OAuth (untuk Admin Panel)

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru → **APIs & Services → OAuth consent screen**
   - User type: **External** → isi nama app & email
3. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
4. Copy **Client ID** dan **Client Secret** ke `.env`
5. Isi `ADMIN_ALLOWED_EMAILS` dengan email Google yang diizinkan login

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/health` | Status server |
| GET | `/api/summary` | Ringkasan KPI utama |
| GET | `/api/provinsi` | Semua provinsi + total |
| GET | `/api/provinsi/top?n=10` | Top N provinsi |
| GET | `/api/provinsi/:id` | Detail satu provinsi |
| GET | `/api/agama` | Distribusi agama |
| GET | `/api/kelamin` | Distribusi jenis kelamin |
| GET | `/api/usia` | Distribusi kelompok usia |
| GET | `/api/kabkota?provinsi=` | List satuan kerja |
| GET | `/api/penyuluh` | Data penyuluh (🔐 perlu login) |
| GET | `/api/export/excel` | Export Excel |
| GET | `/api/export/pdf` | Export PDF |
| GET | `/auth/google` | Login Google OAuth |
| GET | `/auth/me` | Cek status login |
| POST | `/auth/logout` | Logout |

---

## 🎨 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | **Nuxt 3** (Vue 3 + Composition API) |
| Styling | **Tailwind CSS** (CDN) + CSS Variables |
| Backend | **Express** (Node.js ES Modules) |
| Database | **PostgreSQL** |
| Auth | **Passport.js** + Google OAuth 2.0 |
| Charts | **Chart.js** |
| Map | SVG Indonesia interaktif |
| Deploy | **Docker Compose** |

---

## 🐳 Docker Commands

```bash
# Jalankan semua service
docker compose up -d

# Build ulang setelah ada perubahan kode
docker compose build --no-cache && docker compose up -d

# Hanya rebuild satu service
docker compose build frontend --no-cache && docker compose up -d

# Lihat log
docker compose logs -f backend
docker compose logs -f frontend

# Cek status container
docker compose ps

# Matikan semua container
docker compose down
```

---

## 🔒 Keamanan

- NIP penyuluh **dimasking** di database level (`1993*************`)
- Data penyuluh hanya bisa diakses setelah **login Google** yang disetujui admin
- Auth token disimpan di **httpOnly cookie** — tidak bisa dibaca JavaScript
- Token expired otomatis setelah **24 jam**

---

## 📝 Catatan

- Backend port **3001**, frontend port **3000**
- Halaman admin: `http://localhost:3000/admin` (tidak ada link di header, akses manual)
- Untuk server Linux, ganti `DB_HOST=host.docker.internal` dengan IP host

---

*Dibuat Ambari Julianto,ST — Kementerian Agama Ditjen Bimas Islama*