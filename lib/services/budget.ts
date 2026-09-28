import { prisma } from "@/lib/prisma";
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
 * Ambil anggaran milik user pada bulan & tahun tertentu.
 * Mengembalikan null kalau belum ada anggaran.
 * Fungsi ini dipakai juga oleh P2 (summary), P3 (indikator), dan P4 (monthly).
 */
export async function getBudgetByMonth(
  userId: number,
  bulan: number,
  tahun: number,
) {
  return prisma.budget.findUnique({
    where: {
      userId_bulan_tahun: { userId, bulan, tahun },
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
 */
export async function getBudgetSummary(
  userId: number,
  bulan: number,
  tahun: number,
): Promise<BudgetSummary | null> {
  const budget = await getBudgetByMonth(userId, bulan, tahun);
  if (!budget) return null;

  const totalSpent = await getTotalPengeluaranByMonth(userId, bulan, tahun);
  const totalBudget = budget.nominal;
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
 * Kalau bulan + tahun sudah punya anggaran, Prisma melempar error P2002
 * (unique constraint) yang ditangani oleh route API menjadi 409.
 */
export async function createBudget(userId: number, data: BudgetCreateInput) {
  return prisma.budget.create({
    data: {
      userId,
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
