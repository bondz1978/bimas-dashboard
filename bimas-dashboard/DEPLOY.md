# 🚀 Deploy Guide — Dashboard Penyuluh Agama

## Prasyarat
- Docker Desktop / Docker Engine
- Docker Compose v2

---

## Langkah 1 — Export database dari lokal

Di terminal lokal, jalankan:

```bash
pg_dump -U ambarijulianto -d dashboard_db \
  --no-owner --no-acl \
  -f db/init.sql
```

> File `db/init.sql` akan dipakai untuk inisialisasi database di container.

---

## Langkah 2 — Sesuaikan konfigurasi

```bash
cp .env.example .env
```

Edit `.env` sesuai kebutuhan (password, dsb).

---

## Langkah 3 — Build dan jalankan

```bash
# Build semua container
docker compose build

# Jalankan
docker compose up -d

# Cek status
docker compose ps

# Lihat log
docker compose logs -f
```

---

## Akses aplikasi

| Layanan   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:3000      |
| Backend   | http://localhost:3001      |
| Database  | localhost:5432             |

---

## Perintah berguna

```bash
# Stop semua container
docker compose down

# Stop + hapus data database
docker compose down -v

# Rebuild setelah ada perubahan kode
docker compose build --no-cache
docker compose up -d

# Masuk ke container backend
docker exec -it bimas-backend sh

# Masuk ke container database
docker exec -it bimas-db psql -U bimas -d dashboard_db
```

---

## Deploy ke VPS / Server

1. Copy seluruh folder project ke server:
```bash
scp -r bimas-dashboard user@server:/opt/bimas-dashboard
```

2. SSH ke server, masuk ke folder, jalankan:
```bash
docker compose up -d --build
```

3. Pasang Nginx sebagai reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
}
```
