import { NextRequest, NextResponse } from "next/server";
import { getTransaksiByUser, createTransaksi, type TransaksiInput } from "@/lib/services/transaksi";
import { getPreferensiUrutan } from "@/lib/preferensi";
import { getCurrentUser } from "@/lib/services/auth";
import { JenisTransaksi } from "@/app/generated/prisma/client";
import { transaksiCreateSchema } from "@/lib/validations/transaksi";

/**
 * GET /api/transaksi
 *
 * Query params:
 *   - jenis  : "pemasukan" | "pengeluaran"   (opsional, FR-07)
 *   - urutan : "terbaru"   | "terlama"        (opsional, default dari cookie FR-08)
 */
export async function GET(request: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────────────
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Silakan login terlebih dahulu." },
      { status: 401 },
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
  const transaksi = await getTransaksiByUser({ userId: user.id, jenis, urutan });

  return NextResponse.json({ data: transaksi, urutan, jenis: jenis ?? null });
}

/**
 * POST /api/transaksi
 *
 * Body:
 *   - jenis     : "PEMASUKAN" | "PENGELUARAN"
 *   - nominal   : integer (>= 0)
 *   - kategori  : string (opsional)
 *   - deskripsi : string (opsional)
 *   - tanggal   : ISO 8601 date string
 */
export async function POST(request: NextRequest) {
  // ─── Auth ────────────────────────────────────────────────────────────────
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  // ─── Validasi input ──────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body request tidak valid" },
      { status: 400 },
    );
  }

  const parsed = transaksiCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Input tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // ─── Create transaksi ────────────────────────────────────────────────────
  const transaksi = await createTransaksi(user.id, parsed.data as TransaksiInput);

  return NextResponse.json({ data: transaksi }, { status: 201 });
}