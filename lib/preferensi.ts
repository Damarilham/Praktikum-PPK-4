import { cookies } from "next/headers";

export const PREFERENSI_COOKIE = "urutan_transaksi";
export type UrutanTransaksi = "terbaru" | "terlama";

export async function getPreferensiUrutan(): Promise<UrutanTransaksi> {
  const cookieStore = await cookies();
  const value = cookieStore.get(PREFERENSI_COOKIE)?.value;
  return value === "terlama" ? "terlama" : "terbaru";
}
