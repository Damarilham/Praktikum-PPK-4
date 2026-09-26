# Expense Tracker

Aplikasi web sederhana untuk membantu mahasiswa mengelola keuangan pribadi — mencatat pemasukan dan pengeluaran, melihat riwayat transaksi, serta memantau kondisi keuangan (saldo, total pemasukan, total pengeluaran) melalui dashboard.

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Autentikasi:** Better Auth (atau Auth.js — pilih salah satu)
- **Validasi:** Zod
- **Styling:** Tailwind CSS

## Deskripsi Singkat

Pengguna membuat akun dan login untuk mencatat transaksi keuangan pribadinya. Setiap transaksi terhubung ke pengguna yang login sehingga data antar pengguna terisolasi (authorization). Sistem mempertahankan session login, menyimpan minimal satu preferensi pengguna lewat cookies, dan menyediakan dashboard ringkasan serta filter transaksi berdasarkan jenis.

---

## 1. Software Requirement Specification (SRS)

| No | Kode | Deskripsi Requirement | Aktor | Prioritas |
|---|---|---|---|---|
| 1 | SRS-01 | Pengguna dapat membuat akun baru dengan nama, email, dan password | User | Tinggi |
| 2 | SRS-02 | Pengguna dapat login dan sistem mempertahankan session selama masih berlaku, serta melindungi halaman yang butuh autentikasi | User | Tinggi |
| 3 | SRS-03 | Pengguna dapat melihat dashboard berisi nama, saldo, total pemasukan, total pengeluaran, dan transaksi terbaru | User | Tinggi |
| 4 | SRS-04 | Pengguna dapat menambah, melihat, mengubah, dan menghapus transaksi keuangan miliknya sendiri | User | Tinggi |
| 5 | SRS-05 | Pengguna dapat memfilter transaksi berdasarkan jenis (pemasukan/pengeluaran) | User | Sedang |
| 6 | SRS-06 | Sistem menyimpan minimal satu preferensi pengguna lewat cookies | User | Sedang |
| 7 | SRS-07 | Pengguna hanya dapat mengakses dan mengelola data transaksi miliknya sendiri (authorization) | User | Tinggi |
| 8 | SRS-08 | Pengguna dapat logout dan mengakhiri session | User | Sedang |

## 2. Functional Requirement

| No | Kode | Nama Fitur | Deskripsi Fungsional | Ref SRS |
|---|---|---|---|---|
| 1 | FR-01 | Register & Login | Form register (nama, email, password ter-hash) dan form login (email, password) | SRS-01, SRS-02 |
| 2 | FR-02 | Session & Middleware Auth | Middleware yang memvalidasi session di setiap route terproteksi, redirect ke login jika belum autentikasi | SRS-02 |
| 3 | FR-03 | Logout | Endpoint yang menghapus session pengguna | SRS-08 |
| 4 | FR-04 | Dashboard Ringkasan | Halaman dashboard menampilkan nama user, saldo (pemasukan − pengeluaran), total pemasukan, total pengeluaran, dan 5 transaksi terbaru | SRS-03 |
| 5 | FR-05 | CRUD Transaksi | Tambah, lihat, ubah, hapus transaksi (nominal, jenis, kategori, tanggal, deskripsi) | SRS-04 |
| 6 | FR-06 | Authorization Transaksi | Query transaksi selalu di-scope ke `userId` yang sedang login, tolak akses ke data user lain | SRS-04, SRS-07 |
| 7 | FR-07 | Filter Transaksi | Filter list transaksi berdasarkan jenis via query param (`?jenis=pemasukan`/`pengeluaran`) | SRS-05 |
| 8 | FR-08 | Cookie Preferensi | Set & baca cookie untuk minimal satu preferensi pengguna | SRS-06 |

## 3. Pembagian Tugas Programmer

| Programmer | Fitur (Ref FR) | Branch | Folder/Modul | Catatan Dependency |
|---|---|---|---|---|
| **P1** | FR-01, FR-02, FR-03 — Register, Login, Session, Logout | `feature/auth` | `app/auth/`, `app/api/auth/`, `lib/services/auth.ts` | Dikerjakan paling awal. Semua modul lain bergantung pada `getSession()` / `getCurrentUser()` dari sini |
| **P2** | FR-04 — Dashboard | `feature/dashboard` | `app/dashboard/`, `app/api/dashboard/`, `lib/services/dashboard.ts` | Butuh fungsi agregasi saldo/total dari `lib/services/transaksi.ts` (P3) |
| **P3** | FR-05, FR-06 — CRUD Transaksi & Authorization | `feature/transaksi` | `app/transaksi/`, `app/api/transaksi/`, `lib/services/transaksi.ts` | Buat `lib/services/transaksi.ts` di awal karena dipakai P2 dan P4 |
| **P4** | FR-07, FR-08 — Filter & Cookie Preferensi | `feature/filter-preferensi` | Menambah query filter di `app/api/transaksi/route.ts` (koordinasi dgn P3) + komponen cookie di `components/preferensi/` | Bergantung pada endpoint transaksi P3; koordinasikan agar tidak bentrok saat edit file yang sama |

> **Urutan kerja:** P1 (auth) idealnya selesai duluan karena jadi dependency modul lain. P3 juga perlu membuat `lib/services/transaksi.ts` di awal sesi karena dipakai P2 dan P4. Model `User` dan `Transaksi` di `schema.prisma` disiapkan PM sebelum fase eksekusi dimulai.

## 4. Skema Database (Ringkasan)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  nama      String
  email     String   @unique
  password  String
  transaksi Transaksi[]
  createdAt DateTime @default(now())
}

enum JenisTransaksi {
  PEMASUKAN
  PENGELUARAN
}

model Transaksi {
  id        Int            @id @default(autoincrement())
  userId    Int
  jenis     JenisTransaksi
  nominal   Int
  kategori  String?
  deskripsi String?
  tanggal   DateTime
  createdAt DateTime       @default(now())
  user      User           @relation(fields: [userId], references: [id])
}
```

## 5. Setup Proyek (Programmer, Setelah Clone)

```bash
git clone <url-repo>
cd nama-repo
cp .env.example .env
# edit .env: DATABASE_URL & secret auth sesuai konfigurasi lokal
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Buka `http://localhost:3000`. Buat branch sendiri sebelum mulai ngoding:

```bash
git switch -c feature/nama-fitur
git push -u origin feature/nama-fitur
```

## 6. Aturan Git & Commit

- Jangan pernah coding langsung di branch `main`.
- Format commit: `<type>(<scope>): <deskripsi singkat>` diikuti body opsional.
  - Contoh: `feat(transaksi): tambah endpoint hapus transaksi`
- Type yang dipakai: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- Tidak ada co-author pada commit.
- Merge ke `main` hanya dilakukan oleh PM setelah branch fitur direview.

## 7. Environment Variables (`.env.example`)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/expense_tracker"
BETTER_AUTH_SECRET="isi-dengan-string-acak"
BETTER_AUTH_URL="http://localhost:3000"
```
