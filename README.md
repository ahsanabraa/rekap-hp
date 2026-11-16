# RekapHP

Aplikasi web untuk **pendataan pengumpulan HP siswa per kelas** di sekolah. RekapHP menggantikan pencatatan manual supaya setoran HP tercatat rapi, bisa dipantau real-time, dan meminimalkan HP hilang.

Dibangun dengan **Laravel 11** dan **React 18 + Inertia.js**, dengan tampilan **Tailwind CSS** dan komponen **Radix UI**.

---

## Latar belakang

Sebelumnya proses pengumpulan HP di sekolah menghadapi beberapa masalah:

1. Siswa mengaku tidak membawa HP padahal menyembunyikannya agar tidak dikumpulkan.
2. Pengumpulan HP tidak terdokumentasi dengan baik.
3. HP sering hilang karena tidak ada catatan serah-terima yang jelas.

RekapHP menjawab masalah tersebut dengan mencatat setiap HP yang disetor, siapa yang menyetor, kapan diverifikasi, dan siapa yang meminjamnya.

---

## Fitur

### Kesiswaan (guru piket)

- **Ringkasan** (`/dashboard`) — statistik setoran hari ini, jumlah kelas yang sudah/belum menyetor, dan siswa yang perlu perhatian.
- **Monitoring** (`/monitoring`) — status seluruh kelas secara real-time: jumlah siswa, sudah/belum setor, serta status verifikasi.
- **Status** (`/status`) — daftar siswa dengan riwayat sering tidak mengumpulkan HP atau telat mengembalikan pinjaman (ambang **3 kejadian dalam 30 hari**).
- **Verifikasi setoran kelas** — menyetujui setoran yang dikirim ketua/wakil kelas, menandai selisih, dan menyelesaikan setoran.
- **Kelola kelas** (`/classes`) — tambah, ubah, hapus kelas, serta menentukan wali kelas.
- **Kelola siswa** (`/students`) — tambah siswa, atur peran kelas (ketua/wakil/sekretaris), dan reset password siswa.
- **Peminjaman HP** (`/loans`) — catat HP yang dipinjam (per siswa atau seluruh kelas) lengkap dengan alasan, jam pemakaian, dan nama guru penanggung jawab.

### Wali kelas

- **Dashboard kelas** (`/dashboard`) — ringkasan setoran dan absensi kelas yang diampu.
- **Absensi** (`/dashboard#absensi`) — verifikasi absensi harian yang dikirim sekretaris atau input absensi secara manual.
- **Ringkasan setoran** (`/dashboard#ringkasan-setoran`) — pantau checklist pengumpulan HP dan status verifikasi setoran kelas.
- **Status siswa** (`/status`) — lihat siswa di kelasnya yang perlu perhatian.
- Reset password siswa di kelasnya.

### Ketua / wakil ketua kelas

- **Checklist satu klik** — tandai siswa yang sudah mengumpulkan HP.
- Mengirim setoran kelas untuk diverifikasi kesiswaan.
- Memantau status kelengkapan setoran dan absensi kelas.
- Melihat status HP pribadinya.

### Sekretaris kelas

- Mengirim **absensi harian** kelas (semua siswa wajib terdata: masuk/tidak masuk).
- Mengisi checklist setoran jika ketua dan wakil ketua tidak masuk.
- Melihat status HP pribadinya.

### Siswa

- Melihat status HP hari ini (dikumpulkan, sedang dipinjam, tidak mengumpulkan, atau tidak masuk).
- Melihat riwayat 30 hari terakhir beserta ringkasannya.
- Melihat informasi pinjaman HP yang sedang aktif.

### Status yang dipakai

| Status | Arti |
| --- | --- |
| `dikumpulkan` | HP sudah disetor ke sekolah |
| `sedang_dipinjam` | HP sedang dipinjam dengan izin guru |
| `tidak_mengumpulkan` | Siswa tidak menyetor HP |
| `tidak_masuk` | Siswa tidak hadir (mengikuti absensi) |

Setoran kelas sendiri memiliki status: `menunggu_verifikasi`, `terverifikasi`, `selisih`, dan `selesai`.

---

## Peran dan akses

Login memakai **username**, bukan email.

| Peran | Username | Halaman utama |
| --- | --- | --- |
| Kesiswaan | `kesiswaan` | `/dashboard`, `/monitoring`, `/status`, `/classes`, `/students`, `/loans` |
| Wali kelas | NPK (contoh `1001`) | `/dashboard`, `/status` |
| Ketua / wakil ketua | NIS | `/dashboard` (mode ketua/wakil) |
| Sekretaris | NIS | `/dashboard` (mode sekretaris) |
| Siswa | NIS | `/dashboard` (mode siswa) |

Hak akses ditegakkan lewat middleware `role` (`app/Http/Middleware/RoleMiddleware.php`) pada route di `routes/web.php`. Peran ketua, wakil, dan sekretaris ditentukan dari flag di tabel `students`, bukan dari kolom `role` pengguna.

---

## Teknologi

**Backend**

- PHP `^8.2`, Laravel `11.x`
- Inertia.js `2.x` (Laravel adapter)
- Ziggy (route helper di JavaScript)
- MySQL atau SQLite
- Laravel Breeze untuk autentikasi

**Frontend**

- React `18`
- Vite `6`
- Tailwind CSS
- Radix UI
- Lucide Icons

**Pengujian**

- PHPUnit `11`
- Laravel Pint untuk format kode

---

## Kebutuhan

- PHP 8.2+ beserta ekstensi standar Laravel (`pdo`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`)
- Composer 2
- Node.js 18+ dan npm
- MySQL/MariaDB **atau** SQLite

---

## Instalasi

```bash
# 1. Clone repositori
git clone <url-repositori> rekap-hp
cd rekap-hp

# 2. Install dependensi backend
composer install

# 3. Siapkan environment
cp .env.example .env
php artisan key:generate
```

Secara default `.env.example` memakai **SQLite**. Kalau memilih SQLite:

```bash
touch database/database.sqlite
```

Kalau memakai **MySQL**, ubah bagian ini di `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rekap_hp
DB_USERNAME=root
DB_PASSWORD=
```

Lalu siapkan database dan data demo:

```bash
# 4. Migrasi + data demo
php artisan migrate --seed

# 5. Install dependensi frontend
npm install

# 6. Jalankan
npm run dev
```

Di terminal terpisah:

```bash
php artisan serve
```

Buka `http://127.0.0.1:8000`.

Alternatif satu perintah (server + queue + log + Vite):

```bash
composer dev
```

Untuk build produksi:

```bash
npm run build
```

---

## Akun demo

Dibuat oleh `DatabaseSeeder` (`php artisan migrate --seed`). Semua password: **`password`**.

| Peran | Username | Keterangan |
| --- | --- | --- |
| Kesiswaan | `kesiswaan` | Admin Kesiswaan |
| Wali kelas | `1001` | Pak Budi Santoso, wali kelas 10 RPL 1 |
| Ketua kelas | `0001` | Ahmad Fadillah |
| Sekretaris | `0002` | Aisyah Putri Ramadhani |
| Siswa | `0003` – `0025` | Siswa lain di kelas 10 RPL 1 |

> Username wali kelas memakai **NPK**, sedangkan siswa memakai **NIS**.

---

## Alur singkat

1. Sekretaris mengirim **absensi harian** kelas.
2. Ketua/wakil kelas mengisi **checklist pengumpulan HP** dan mengirim setoran kelas.
3. Wali kelas memverifikasi **absensi** kelasnya.
4. Kesiswaan memantau seluruh kelas lewat **Monitoring**, lalu memverifikasi dan menyelesaikan **setoran**.
5. Jika ada siswa yang perlu memakai HP, kesiswaan mencatat **peminjaman** beserta alasan dan rentang waktu; status HP berubah menjadi `sedang_dipinjam` sampai ditandai kembali.
6. Siswa dapat melihat status dan riwayatnya sendiri di dashboard.

---

## Struktur proyek

```
app/
├── Console/Commands/ResetTodayTestingData.php   # perintah bantu pengujian
├── Http/
│   ├── Controllers/                             # dashboard, kelas, siswa, setoran, absensi, pinjaman
│   └── Middleware/RoleMiddleware.php            # pembatasan akses berdasarkan peran
└── Models/                                      # User, SchoolClass, Student, ClassDeposit, dll.

database/
├── migrations/                                  # skema users, classes, students, setoran, absensi, pinjaman
└── seeders/DatabaseSeeder.php                   # akun & data demo

resources/js/
├── Layouts/AuthenticatedLayout.jsx              # sidebar & navigasi per peran
├── Pages/
│   ├── Dashboard/                               # halaman dashboard per peran
│   │   ├── Kesiswaan.jsx
│   │   ├── Monitoring.jsx
│   │   ├── Status.jsx
│   │   ├── WaliKelas.jsx
│   │   ├── KetuaKelas.jsx
│   │   ├── Sekretaris.jsx
│   │   ├── Siswa.jsx
│   │   └── Partials/                            # komponen bersama (form, dialog, badge, list)
│   ├── Classes/  Students/  Loans/  Profile/  Auth/
│   └── Welcome.jsx
└── Components/                                  # komponen UI (badge, table, dialog, dll.)

routes/
├── web.php                                      # route utama + middleware role
└── auth.php                                     # login/logout (username)

tests/Feature/                                   # pengujian alur setoran, absensi, dashboard, dsb.
```

---

## Pengujian

```bash
php artisan test
```

Saat ini seluruh test lulus: **72 test, 335 assertion**. Cakupan utama meliputi alur setoran kelas, absensi dan verifikasinya, pencatatan & pengembalian pinjaman, dashboard tiap peran, serta reset password.

Format kode PHP:

```bash
./vendor/bin/pint
```

---

## Perintah bantu

Untuk mengulang simulasi alur harian tanpa migrasi ulang:

```bash
# Reset setoran HP & absensi hari ini untuk semua kelas
php artisan testing:reset-today

# Hanya satu kelas
php artisan testing:reset-today --class=1

# Pertahankan absensi hari ini, reset setoran saja
php artisan testing:reset-today --keep-attendance
```

---

## Catatan

- Registrasi publik tidak dibuka; akun siswa dibuat oleh kesiswaan, sedangkan akun wali kelas disiapkan lewat seeder/administrator.
- Login memakai **username**; halaman `/login` akan mengarah ke form login di halaman utama.
- Jika tampilan tidak ter-update saat pengembangan, pastikan `npm run dev` berjalan dan `public/hot` ada. Setelah `npm run build`, hapus `public/hot` bila perlu.

---

## Lisensi

Proyek ini menggunakan lisensi MIT.
