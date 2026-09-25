import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/services/auth";

export { getCurrentUser };
export function getPrisma() {
  return prisma;
}

export const transaksiSchema = z.object({
  jenis: z.enum(["PEMASUKAN", "PENGELUARAN"]),
  nominal: z.coerce.number().int().positive("Nominal harus lebih dari 0"),
  kategori: z.string().trim().max(100).optional(),
  deskripsi: z.string().trim().max(500).optional(),
  tanggal: z.coerce.date(),
});

export async function tambahTransaksi(formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Tidak terautentikasi");
  }

  const parsed = transaksiSchema.safeParse({
    jenis: formData.get("jenis"),
    nominal: formData.get("nominal"),
    kategori: formData.get("kategori"),
    deskripsi: formData.get("deskripsi"),
    tanggal: formData.get("tanggal"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Data transaksi tidak valid");
  }

  const { jenis, nominal, kategori, deskripsi, tanggal } = parsed.data;

  await getPrisma().transaksi.create({
    data: {
      userId: user.id,
      jenis,
      nominal,
      kategori: kategori || null,
      deskripsi: deskripsi || null,
      tanggal,
    },
  });

  revalidatePath("/transaksi");
  redirect("/transaksi");
}