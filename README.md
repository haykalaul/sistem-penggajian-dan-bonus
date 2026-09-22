# Sistem Penggajian dan Bonus (PT Asia Suaka)

Aplikasi berbasis web untuk mengelola master data karyawan, transaksi gaji bulanan, dan perhitungan bonus otomatis (5%) untuk divisi HR Operations.

## Fitur Utama

- **Master Karyawan**: Kelola data karyawan (Nama, Kode, Tanggal Lahir, Alamat).
- **Transaksi Salary**: Input gaji bulanan berdasarkan karyawan.
- **Transaksi Bonus**: Perhitungan bonus otomatis sebesar 5% dari gaji yang dipilih.
- **Live Report**: Dashboard interaktif yang menampilkan statistik dan tabel rekapitulasi bonus.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router, React 19)
- **Styling:** Tailwind CSS
- **Database & Backend:** [Supabase](https://supabase.com)
- **Data Fetching:** [SWR](https://swr.vercel.app/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Persyaratan

Sebelum menjalankan proyek ini, pastikan Anda telah menginstal:
- Node.js (v18 atau lebih baru)
- pnpm (rekomendasi package manager)
- Akun dan project Supabase

## Konfigurasi Environment

Buat file `.env.local` di root direktori proyek dan tambahkan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

## Cara Menjalankan Proyek

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Jalankan Development Server**
   ```bash
   pnpm dev
   ```

3. **Buka Aplikasi**
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi.

## Dokumentasi Tambahan

- Untuk melihat Product Requirements Document, silakan baca file [`PRD.md`](./PRD.md).
