# Product Requirements Document (PRD)
## Sistem Penggajian dan Bonus

### 1. Tujuan Proyek
Sistem Penggajian dan Bonus adalah aplikasi berbasis web yang dirancang untuk membantu divisi HR Operations (PT Asia Suaka) dalam mengelola data karyawan, mencatat gaji bulanan, serta menghitung dan mencatat bonus karyawan secara otomatis berdasarkan persentase gaji (5%).

### 2. Lingkup Proyek
Aplikasi ini difokuskan pada manajemen operasional penggajian dasar yang meliputi:
- **Manajemen Data Karyawan:** Pencatatan informasi dasar karyawan (Master Data).
- **Manajemen Gaji (Salary):** Pencatatan riwayat gaji karyawan berdasarkan bulan dan tahun.
- **Perhitungan Bonus:** Kalkulasi otomatis bonus sebesar 5% dari gaji yang dipilih.
- **Pelaporan (Reporting):** Menampilkan rekapitulasi data bonus secara real-time.

### 3. Target Pengguna
- **HR Staff / Admin:** Melakukan input data karyawan, gaji, dan memproses bonus.

### 4. Fitur Utama

#### 4.1. Modul Master Karyawan
- **Input Data:** Pengguna dapat menambahkan data karyawan baru dengan field:
  - Nama Karyawan
  - Kode Karyawan (Maks. 6 karakter)
  - Tanggal Lahir
  - Alamat Domisili
- **Validasi:** Seluruh form wajib diisi (`required`).

#### 4.2. Modul Transaksi Salary
- **Input Data:** Pengguna dapat memasukkan data gaji bulanan untuk karyawan tertentu.
  - Pilihan Bulan (Januari - Desember)
  - Tahun (Minimal 2000)
  - Pilihan Karyawan (dari data Master Karyawan)
  - Nilai Gaji (Minimal Rp 1)
- **Keterkaitan:** Setiap transaksi gaji terhubung dengan satu ID Karyawan.

#### 4.3. Modul Transaksi Bonus
- **Perhitungan Otomatis:** Sistem memiliki formula tetap (Bonus = 5% x Gaji).
- **Input Data:** Pengguna hanya perlu memilih ID Transaksi Salary. Sistem akan otomatis menarik data karyawan yang bersangkutan dan menghitung nilai bonus.
- **Aturan Bisnis:** 
  - Bonus mulai diberikan pada bulan Februari tahun berjalan.
  - Saldo bonus direset menjadi nol setiap bulan Januari.

#### 4.4. Live Report & Dashboard
- **Statistik:** Menampilkan total karyawan, total seluruh gaji yang tercatat, dan total keseluruhan bonus yang telah dihitung.
- **Tabel Rekap Transaksi Bonus:** Menampilkan rincian ID Bonus, Nama Karyawan, Periode Gaji (Bulan & Tahun), Nilai Gaji, Rate Bonus (5%), dan Total Bonus yang diterima.

### 5. Arsitektur Teknis
- **Frontend / Framework:** Next.js (App Router) menggunakan React 19.
- **Styling:** Tailwind CSS.
- **State Management & Data Fetching:** SWR.
- **Backend / Database:** Supabase (PostgreSQL). Terhubung secara langsung melalui Supabase Client (Data tersimpan real-time).

### 6. Struktur Basis Data (Supabase)

#### Tabel `EMPLOYEE`
- `ID_KARYAWAN` (Primary Key, Auto-increment/UUID)
- `NAMA_KARYAWAN` (String)
- `KODE_KARYAWAN` (String)
- `TANGGAL_LAHIR` (Date)
- `ALAMAT` (String)

#### Tabel `SALARY`
- `ID_SALARY` (Primary Key, Auto-increment/UUID)
- `BULAN` (Integer)
- `TAHUN` (Integer)
- `SALARY` (Numeric)
- `ID_KARYAWAN` (Foreign Key -> `EMPLOYEE.ID_KARYAWAN`)

#### Tabel `BONUS`
- `ID_BONUS` (Primary Key, Auto-increment/UUID)
- `BONUS` (Numeric, default: 0.05)
- `TOTAL` (Numeric)
- `ID_KARYAWAN` (Foreign Key -> `EMPLOYEE.ID_KARYAWAN`)
- `ID_SALARY` (Foreign Key -> `SALARY.ID_SALARY`)
