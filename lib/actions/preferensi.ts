"use server";

import { cookies } from "next/headers";
import { PREFERENSI_COOKIE, type UrutanTransaksi } from "@/lib/preferensi";

export async function setPreferensiUrutan(urutan: UrutanTransaksi) {
  const cookieStore = await cookies();
  cookieStore.set(PREFERENSI_COOKIE, urutan, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}
