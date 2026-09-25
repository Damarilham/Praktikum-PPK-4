import { prisma } from "@/lib/db";
import { JenisTransaksi } from "@/app/generated/prisma/client";

export type FilterTransaksi = {
  userId: number;
  jenis?: JenisTransaksi;
  urutan?: "terbaru" | "terlama";
};

export type TransaksiInput = {
  jenis: JenisTransaksi;
  nominal: number;
  kategori?: string | null;
  deskripsi?: string | null;
  tanggal: Date;
};

export type TransaksiUpdateInput = Partial<TransaksiInput>;

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
 * Ambil detail transaksi milik user tertentu.
 * Authorization: hanya transaksi milik userId yang dikembalikan.
 */
export async function getTransaksiById(userId: number, transaksiId: number) {
  return prisma.transaksi.findFirst({
    where: {
      id: transaksiId,
      userId,
    },
  });
}

/**
 * Buat transaksi baru untuk user tertentu.
 * userId diambil dari session, bukan dari input client.
 */
export async function createTransaksi(userId: number, data: TransaksiInput) {
  return prisma.transaksi.create({
    data: {
      userId,
      jenis: data.jenis,
      nominal: data.nominal,
      kategori: data.kategori ?? null,
      deskripsi: data.deskripsi ?? null,
      tanggal: data.tanggal,
    },
  });
}

/**
 * Update transaksi milik user tertentu.
 * Authorization: hanya transaksi milik userId yang bisa diupdate.
 */
export async function updateTransaksi(
  userId: number,
  transaksiId: number,
  data: TransaksiUpdateInput,
) {
  return prisma.transaksi.update({
    where: {
      id: transaksiId,
      userId,
    },
    data: {
      ...(data.jenis !== undefined && { jenis: data.jenis }),
      ...(data.nominal !== undefined && { nominal: data.nominal }),
      ...(data.kategori !== undefined && { kategori: data.kategori }),
      ...(data.deskripsi !== undefined && { deskripsi: data.deskripsi }),
      ...(data.tanggal !== undefined && { tanggal: data.tanggal }),
    },
  });
}

/**
 * Hapus transaksi milik user tertentu.
 * Authorization: hanya transaksi milik userId yang bisa dihapus.
 */
export async function deleteTransaksi(userId: number, transaksiId: number) {
  return prisma.transaksi.delete({
    where: {
      id: transaksiId,
      userId,
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