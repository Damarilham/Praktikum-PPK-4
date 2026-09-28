import { prisma } from "@/lib/prisma";
import { JenisTransaksi } from "@/app/generated/prisma/client";
import type {
  BudgetCreateInput,
  BudgetUpdateInput,
} from "@/lib/validations/budget";
import { getTotalPengeluaranByMonth } from "@/lib/services/transaksi";

/**
 * Service anggaran bulanan (FR-09 & FR-13).
 *
 * Authorization (FR-13): SEMUA fungsi di sini menerima `userId` dan
 * selalu memakainya di klausa `where`, sehingga user tidak bisa membaca,
 * mengubah, atau menghapus anggaran milik user lain.
 * `userId` harus berasal dari session (getCurrentUser), bukan dari input client.
 */

/**
 * Ambil SEMUA anggaran milik user pada bulan & tahun tertentu.
 * Mengembalikan array (bisa kosong).
 * Fungsi ini dipakai juga oleh P2 (summary), P3 (indikator), dan P4 (monthly).
 */
export async function getBudgetsByMonth(
  userId: number,
  bulan: number,
  tahun: number,
) {
  return prisma.budget.findMany({
    where: {
      userId,
      bulan,
      tahun,
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Ambil satu anggaran berdasarkan kombinasi userId, bulan, tahun, dan nama.
 * Digunakan untuk cek duplikat nama di bulan yang sama.
 */
export async function getBudgetByName(
  userId: number,
  bulan: number,
  tahun: number,
  nama: string,
) {
  return prisma.budget.findFirst({
    where: {
      userId,
      bulan,
      tahun,
      nama,
    },
  });
}

/**
 * Ambil detail anggaran berdasarkan id, hanya kalau milik userId.
 */
export async function getBudgetById(userId: number, budgetId: number) {
  return prisma.budget.findFirst({
    where: {
      id: budgetId,
      userId,
    },
  });
}

/**
 * Buat anggaran baru untuk user.
 * User bisa punya beberapa anggaran per bulan (dibedakan by nama).
 * Kalau nama sudah ada di bulan & tahun yang sama, Prisma melempar error
 * yang ditangani oleh route API menjadi 409.
 */
export async function createBudget(userId: number, data: BudgetCreateInput) {
  return prisma.budget.create({
    data: {
      userId,
      nama: data.nama,
      bulan: data.bulan,
      tahun: data.tahun,
      nominal: data.nominal,
    },
  });
}

/**
 * Ubah nominal anggaran milik user.
 */
export async function updateBudget(
  userId: number,
  budgetId: number,
  data: BudgetUpdateInput,
) {
  return prisma.budget.update({
    where: {
      id: budgetId,
      userId,
    },
    data: {
      nominal: data.nominal,
    },
  });
}

/**
 * Hapus anggaran milik user.
 */
export async function deleteBudget(userId: number, budgetId: number) {
  return prisma.budget.delete({
    where: {
      id: budgetId,
      userId,
    },
  });
}

export type BudgetSummaryStatus = "aman" | "warning" | "over";

export type BudgetSummary = {
  bulan: number;
  tahun: number;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  status: BudgetSummaryStatus;
};

function getBudgetStatus(percentage: number): BudgetSummaryStatus {
  if (percentage > 100) return "over";
  if (percentage >= 80) return "warning";
  return "aman";
}

/**
 * Ringkasan anggaran bulanan (FR-10).
 * Menggabungkan nominal budget dengan total pengeluaran bulan tsb.
 * Total budget = sum of all budget items for that month.
 */
export async function getBudgetSummary(
  userId: number,
  bulan: number,
  tahun: number,
): Promise<BudgetSummary | null> {
  const budgets = await getBudgetsByMonth(userId, bulan, tahun);
  if (budgets.length === 0) return null;

  const totalSpent = await getTotalPengeluaranByMonth(userId, bulan, tahun);
  const totalBudget = budgets.reduce((sum, b) => sum + b.nominal, 0);
  const remaining = totalBudget - totalSpent;
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return {
    bulan,
    tahun,
    totalBudget,
    totalSpent,
    remaining,
    percentage,
    status: getBudgetStatus(percentage),
  };
}