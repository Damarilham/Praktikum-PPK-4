import { prisma } from "@/lib/db";
import { JenisTransaksi } from "@/app/generated/prisma/client";

export type FilterTransaksi = {
  userId: number;
  jenis?: JenisTransaksi;
  urutan?: "terbaru" | "terlama";
};

/**
 * Ambil daftar transaksi milik user tertentu.
 * Mendukung filter berdasarkan jenis (FR-07) dan urutan (FR-08 cookie preferensi).
 */
export async function getTransaksiByUser({
  userId,
  jenis,
  urutan = "terbaru",
}: FilterTransaksi) {
  return prisma.transaksi.findMany({
    where: {
      userId,
      ...(jenis ? { jenis } : {}),
    },
    orderBy: {
      tanggal: urutan === "terlama" ? "asc" : "desc",
    },
  });
}

/**
 * Ambil ringkasan keuangan: saldo, total pemasukan, total pengeluaran (untuk dashboard P2).
 */
export async function getRingkasanByUser(userId: number) {
  const transaksi = await prisma.transaksi.findMany({
    where: { userId },
    select: { jenis: true, nominal: true },
  });

  const totalPemasukan = transaksi
    .filter((t) => t.jenis === JenisTransaksi.PEMASUKAN)
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalPengeluaran = transaksi
    .filter((t) => t.jenis === JenisTransaksi.PENGELUARAN)
    .reduce((sum, t) => sum + t.nominal, 0);

  const saldo = totalPemasukan - totalPengeluaran;

  return { saldo, totalPemasukan, totalPengeluaran };
}
