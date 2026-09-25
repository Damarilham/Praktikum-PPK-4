import { prisma } from "@/lib/prisma";
import { JenisTransaksi } from "@/app/generated/prisma/client";

export interface TransaksiRingkas {
  id: number;
  jenis: JenisTransaksi;
  nominal: number;
  kategori: string | null;
  deskripsi: string | null;
  tanggal: Date;
}

export interface DashboardSummary {
  nama: string;
  saldo: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  transaksiTerbaru: TransaksiRingkas[];
}

const JUMLAH_TRANSAKSI_TERBARU = 5;

/**
 * Mengambil data ringkasan untuk halaman dashboard (FR-04 / SRS-03):
 * nama user, saldo, total pemasukan, total pengeluaran, dan 5 transaksi
 * terbaru. Semua query di-scope ke `userId` yang diberikan (authorization,
 * lihat juga SRS-07 — di production `userId` ini harus berasal dari session
 * yang sudah divalidasi, bukan input pengguna).
 *
 * Mengembalikan `null` jika user tidak ditemukan.
 */
export async function getDashboardSummary(
  userId: number
): Promise<DashboardSummary | null> {
  const [user, totalPerJenis, transaksiTerbaru] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { nama: true },
    }),
    prisma.transaksi.groupBy({
      by: ["jenis"],
      where: { userId },
      _sum: { nominal: true },
    }),
    prisma.transaksi.findMany({
      where: { userId },
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
      take: JUMLAH_TRANSAKSI_TERBARU,
      select: {
        id: true,
        jenis: true,
        nominal: true,
        kategori: true,
        deskripsi: true,
        tanggal: true,
      },
    }),
  ]);

  if (!user) return null;

  const totalPemasukan =
    totalPerJenis.find((t) => t.jenis === JenisTransaksi.PEMASUKAN)?._sum
      .nominal ?? 0;
  const totalPengeluaran =
    totalPerJenis.find((t) => t.jenis === JenisTransaksi.PENGELUARAN)?._sum
      .nominal ?? 0;

  return {
    nama: user.nama,
    saldo: totalPemasukan - totalPengeluaran,
    totalPemasukan,
    totalPengeluaran,
    transaksiTerbaru,
  };
}
