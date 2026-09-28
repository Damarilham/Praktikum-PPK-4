export type BudgetStatusKey = "aman" | "waspada" | "melebihi";

export interface BudgetStatus {
  key: BudgetStatusKey;
  label: string;
  barClassName: string;
  textClassName: string;
}

const BERANDA_AMAN = 70;
const BERANDA_MELEBIHI = 100;

/**
 * Menentukan status pemakaian budget dari persentase
 * (FR-11, ref SRS-11).
 *
 * Ambang (usulan):
 * - Aman: persentase < 70%
 * - Waspada: 70% sampai < 100%
 * - Melebihi: >= 100%
 *
 * Nilai non-finite / negatif dinormalisasi agar aman dipakai UI:
 * - NaN / negatif -> 0 (Aman)
 * - +Infinity (mis. pemasukan 0 tapi ada pengeluaran) -> Melebihi
 */
export function getBudgetStatus(persentase: number): BudgetStatus {
  let nilai = persentase;
  if (Number.isNaN(nilai) || nilai < 0) {
    nilai = 0;
  }

  if (!Number.isFinite(nilai) || nilai >= BERANDA_MELEBIHI) {
    return {
      key: "melebihi",
      label: "Melebihi",
      barClassName: "bg-red-500",
      textClassName: "text-red-600 dark:text-red-400",
    };
  }

  if (nilai >= BERANDA_AMAN) {
    return {
      key: "waspada",
      label: "Waspada",
      barClassName: "bg-amber-500",
      textClassName: "text-amber-600 dark:text-amber-400",
    };
  }

  return {
    key: "aman",
    label: "Aman",
    barClassName: "bg-emerald-500",
    textClassName: "text-emerald-600 dark:text-emerald-400",
  };
}

/**
 * Menghitung persentase pemakaian budget.
 * Asumsi: persentase = totalPengeluaran / totalPemasukan * 100.
 * - pemasukan 0 & pengeluaran 0 -> 0%
 * - pemasukan 0 & ada pengeluaran -> +Infinity (Melebihi)
 */
export function getPersentasePemakaian(
  totalPemasukan: number,
  totalPengeluaran: number
): number {
  if (totalPemasukan <= 0) {
    return totalPengeluaran > 0 ? Number.POSITIVE_INFINITY : 0;
  }
  if (totalPengeluaran <= 0) return 0;
  return (totalPengeluaran / totalPemasukan) * 100;
}
