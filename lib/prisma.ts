import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Pola singleton standar Next.js agar hot-reload di dev tidak membuat
// banyak koneksi PrismaClient baru setiap kali file disimpan.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Kalau host di DATABASE_URL "localhost", paksa ke 127.0.0.1 (IPv4).
// Ini menghindari bug umum Node 18+: "localhost" bisa ter-resolve ke ::1 (IPv6)
// duluan, padahal Postgres biasanya cuma listen di IPv4 -> koneksi menggantung
// tanpa error sama sekali (gejala: tombol login/register loading selamanya).
const connectionString = process.env.DATABASE_URL!.replace(
  "localhost",
  "127.0.0.1",
);

const adapter = new PrismaPg({
  connectionString,
  // Tanpa ini, pg.Pool tidak punya batas waktu koneksi sama sekali —
  // kalau DB tidak reachable, request akan hang selamanya tanpa error.
  connectionTimeoutMillis: 5000,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
