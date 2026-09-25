import { NextRequest, NextResponse } from "next/server";
import { getTransaksiByUser } from "@/lib/services/transaksi";
import { getPreferensiUrutan } from "@/lib/preferensi";
import { JenisTransaksi } from "@/app/generated/prisma/client";

/**
 * GET /api/transaksi
 *
 * Query params:
 *   - jenis  : "pemasukan" | "pengeluaran"   (opsional, FR-07)
 *   - urutan : "terbaru"   | "terlama"        (opsional, default dari cookie FR-08)
 *
 * Catatan: autentikasi & userId akan diambil dari session P1 (getCurrentUser).
 * Sementara P1 belum tersedia, userId diambil dari header X-User-Id untuk testing.
 */
export async function GET(request: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────────────
  // TODO (P1): ganti baris di bawah dengan getCurrentUser() dari lib/services/auth.ts
  const userIdHeader = request.headers.get("x-user-id");
  const userId = userIdHeader ? parseInt(userIdHeader, 10) : null;

  if (!userId || isNaN(userId)) {
    return NextResponse.json(
      { error: "Unauthorized. Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }

  // ─── Query param: filter jenis (FR-07) ──────────────────────────────────
  const { searchParams } = new URL(request.url);
  const jenisParam = searchParams.get("jenis")?.toUpperCase();

  let jenis: JenisTransaksi | undefined;
  if (jenisParam === "PEMASUKAN" || jenisParam === "PENGELUARAN") {
    jenis = jenisParam as JenisTransaksi;
  }

  // ─── Urutan: dari query param, fallback ke cookie preferensi (FR-08) ────
  const urutanParam = searchParams.get("urutan");
  const urutanFromCookie = await getPreferensiUrutan();
  const urutan =
    urutanParam === "terbaru" || urutanParam === "terlama"
      ? urutanParam
      : urutanFromCookie;

  // ─── Query ───────────────────────────────────────────────────────────────
  const transaksi = await getTransaksiByUser({ userId, jenis, urutan });

  return NextResponse.json({ data: transaksi, urutan, jenis: jenis ?? null });
}
