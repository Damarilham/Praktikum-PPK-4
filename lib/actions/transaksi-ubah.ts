import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, getPrisma, transaksiSchema } from "./transaksi-tambah";

export async function ubahTransaksi(formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Tidak terautentikasi");
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID transaksi tidak valid");
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

  const milikUser = await getPrisma().transaksi.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!milikUser) {
    throw new Error("Transaksi tidak ditemukan");
  }

  await getPrisma().transaksi.update({
    where: { id },
    data: {
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