import { z } from "zod";
import { JenisTransaksi } from "@/app/generated/prisma/client";

export const transaksiCreateSchema = z.object({
  jenis: z.enum([JenisTransaksi.PEMASUKAN, JenisTransaksi.PENGELUARAN], {
    message: "Jenis harus PEMASUKAN atau PENGELUARAN",
  }),
  nominal: z
    .number()
    .int("Nominal harus bilangan bulat")
    .min(0, "Nominal tidak boleh negatif"),
  kategori: z.string().trim().max(100).optional().nullable(),
  deskripsi: z.string().trim().max(500).optional().nullable(),
  tanggal: z
    .string()
    .datetime({ message: "Format tanggal tidak valid (ISO 8601)" })
    .transform((val) => new Date(val)),
});

export type TransaksiCreateInput = z.infer<typeof transaksiCreateSchema>;

export const transaksiUpdateSchema = transaksiCreateSchema.partial();

export type TransaksiUpdateInput = z.infer<typeof transaksiUpdateSchema>;