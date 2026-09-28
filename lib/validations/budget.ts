import { z } from "zod";

// Batas nominal mengikuti tipe INTEGER di PostgreSQL (kolom `nominal` bertipe Int).
const NOMINAL_MAKSIMAL = 2_147_483_647;

// Skema untuk membuat anggaran baru (FR-09).
export const budgetCreateSchema = z.object({
  bulan: z
    .number({ message: "Bulan wajib diisi" })
    .int("Bulan harus bilangan bulat")
    .min(1, "Bulan minimal 1")
    .max(12, "Bulan maksimal 12"),
  tahun: z
    .number({ message: "Tahun wajib diisi" })
    .int("Tahun harus bilangan bulat")
    .min(2000, "Tahun minimal 2000")
    .max(2100, "Tahun maksimal 2100"),
  nominal: z
    .number({ message: "Nominal wajib diisi" })
    .int("Nominal harus bilangan bulat")
    .positive("Nominal harus lebih dari 0")
    .max(NOMINAL_MAKSIMAL, "Nominal terlalu besar"),
});

export type BudgetCreateInput = z.infer<typeof budgetCreateSchema>;

// Skema untuk mengubah anggaran: hanya nominal yang boleh diubah.
// Bulan & tahun adalah identitas anggaran, jadi tidak diubah lewat update.
export const budgetUpdateSchema = budgetCreateSchema.pick({ nominal: true });

export type BudgetUpdateInput = z.infer<typeof budgetUpdateSchema>;

/**
 * Membaca query param `bulan` & `tahun` (FR-12 memakai fungsi ini juga).
 * Kalau kosong atau tidak valid, dipakai bulan & tahun berjalan.
 */
export function parseBulanTahun(
  bulanParam?: string | null,
  tahunParam?: string | null,
): { bulan: number; tahun: number } {
  const sekarang = new Date();

  const bulanParsed = budgetCreateSchema.shape.bulan.safeParse(
    bulanParam ? Number(bulanParam) : undefined,
  );
  const tahunParsed = budgetCreateSchema.shape.tahun.safeParse(
    tahunParam ? Number(tahunParam) : undefined,
  );

  return {
    bulan: bulanParsed.success ? bulanParsed.data : sekarang.getMonth() + 1,
    tahun: tahunParsed.success ? tahunParsed.data : sekarang.getFullYear(),
  };
}
