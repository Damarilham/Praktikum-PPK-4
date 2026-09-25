import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, getPrisma } from "./transaksi-tambah";

export async function hapusTransaksi(formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Tidak terautentikasi");
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID transaksi tidak valid");
  }

  const result = await getPrisma().transaksi.deleteMany({
    where: { id, userId: user.id },
  });

  if (result.count === 0) {
    throw new Error("Transaksi tidak ditemukan");
  }

  revalidatePath("/transaksi");
  redirect("/transaksi");
}