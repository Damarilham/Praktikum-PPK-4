import { NextRequest, NextResponse } from "next/server";
import {
  getTransaksiById,
  updateTransaksi,
  deleteTransaksi,
} from "@/lib/services/transaksi";
import { getCurrentUser } from "@/lib/services/auth";
import { transaksiUpdateSchema } from "@/lib/validations/transaksi";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/transaksi/[id]
 * Ambil detail transaksi milik user yang sedang login.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const transaksiId = parseInt(id, 10);

  if (isNaN(transaksiId)) {
    return NextResponse.json(
      { error: "ID transaksi tidak valid" },
      { status: 400 },
    );
  }

  // ─── Auth ────────────────────────────────────────────────────────────────
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  // ─── Query detail transaksi (dengan ownership check) ─────────────────────
  const transaksi = await getTransaksiById(user.id, transaksiId);

  if (!transaksi) {
    return NextResponse.json(
      { error: "Transaksi tidak ditemukan" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: transaksi });
}

/**
 * PATCH /api/transaksi/[id]
 * Update transaksi milik user yang sedang login.
 *
 * Body (opsional, partial):
 *   - jenis     : "PEMASUKAN" | "PENGELUARAN"
 *   - nominal   : integer (>= 0)
 *   - kategori  : string (opsional)
 *   - deskripsi : string (opsional)
 *   - tanggal   : ISO 8601 date string
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const transaksiId = parseInt(id, 10);

  if (isNaN(transaksiId)) {
    return NextResponse.json(
      { error: "ID transaksi tidak valid" },
      { status: 400 },
    );
  }

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

  const parsed = transaksiUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Input tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // ─── Check ownership & update ────────────────────────────────────────────
  const existing = await getTransaksiById(user.id, transaksiId);

  if (!existing) {
    return NextResponse.json(
      { error: "Transaksi tidak ditemukan" },
      { status: 404 },
    );
  }

  let transaksi;
  try {
    transaksi = await updateTransaksi(user.id, transaksiId, parsed.data);
  } catch (err) {
    console.error("[PATCH /api/transaksi/[id]] Prisma error:", err);
    return NextResponse.json(
      { error: "Gagal mengupdate transaksi. Silakan coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: transaksi });
}

/**
 * DELETE /api/transaksi/[id]
 * Hapus transaksi milik user yang sedang login.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const transaksiId = parseInt(id, 10);

  if (isNaN(transaksiId)) {
    return NextResponse.json(
      { error: "ID transaksi tidak valid" },
      { status: 400 },
    );
  }

  // ─── Auth ────────────────────────────────────────────────────────────────
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  // ─── Check ownership & delete ────────────────────────────────────────────
  const existing = await getTransaksiById(user.id, transaksiId);

  if (!existing) {
    return NextResponse.json(
      { error: "Transaksi tidak ditemukan" },
      { status: 404 },
    );
  }

  try {
    await deleteTransaksi(user.id, transaksiId);
  } catch (err) {
    console.error("[DELETE /api/transaksi/[id]] Prisma error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus transaksi. Silakan coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Transaksi berhasil dihapus" });
}