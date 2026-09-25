/**
 * ⚠️ PLACEHOLDER SEMENTARA — bukan bagian tugas P2.
 *
 * Modul dashboard (FR-04) butuh tahu siapa user yang sedang login, tapi
 * FR-01/FR-02 (P1 — `lib/services/auth.ts`, session, middleware/proxy auth)
 * belum tersedia di branch ini. Supaya fitur dashboard tetap bisa
 * dikembangkan & dites tanpa menunggu P1 selesai, file ini menyediakan
 * cara paling sederhana untuk "berpura-pura login": baca cookie `userId`.
 *
 * Begitu P1 selesai membuat `lib/services/auth.ts` dengan
 * `getCurrentUser()` / `getSession()`, ganti pemanggilan
 * `getCurrentUserIdPlaceholder()` di:
 *   - app/api/dashboard/route.ts
 *   - app/dashboard/page.tsx
 * dengan fungsi asli dari P1, lalu hapus file ini.
 */
import { cookies } from "next/headers";

export async function getCurrentUserIdPlaceholder(): Promise<number | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("userId")?.value;

  if (!raw) return null;

  const userId = Number(raw);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}
