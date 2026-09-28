import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/services/auth";
import { createBudget, getBudgetsByMonth, getBudgetByName } from "@/lib/services/budget";
import { budgetCreateSchema, parseBulanTahun } from "@/lib/validations/budget";

/**
 * GET /api/budget?bulan=9&tahun=2026
 *
 * Ambil SEMUA anggaran milik user yang sedang login pada bulan & tahun tertentu.
 * Kalau bulan/tahun tidak diisi, dipakai bulan berjalan.
 * Response: { data: Budget[], bulan, tahun }
 */
export async function GET(request: NextRequest) {
  // ─── Auth (FR-13) ────────────────────────────────────────────────────────
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  // ─── Query param bulan & tahun ───────────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const { bulan, tahun } = parseBulanTahun(
    searchParams.get("bulan"),
    searchParams.get("tahun"),
  );

  const budgets = await getBudgetsByMonth(user.id, bulan, tahun);

  return NextResponse.json({ data: budgets, bulan, tahun });
}

/**
 * POST /api/budget
 *
 * Body:
 *   - nama    : string (1-50 chars), nama anggaran, mis: "Makan", "Transport"
 *   - bulan   : integer 1-12
 *   - tahun   : integer
 *   - nominal : integer > 0
 *
 * User boleh punya beberapa anggaran per bulan (dibedakan by nama).
 * Return 409 kalau nama sudah ada di bulan & tahun yang sama.
 */
export async function POST(request: NextRequest) {
  // ─── Auth (FR-13) ────────────────────────────────────────────────────────
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

  const parsed = budgetCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Input tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // ─── Cek duplikat: satu nama anggaran per bulan per user ──────────────────
  const sudahAda = await getBudgetByName(
    user.id,
    parsed.data.bulan,
    parsed.data.tahun,
    parsed.data.nama,
  );

  if (sudahAda) {
    return NextResponse.json(
      { error: "Anggaran dengan nama ini untuk bulan dan tahun ini sudah ada." },
      { status: 409 },
    );
  }

  // ─── Create budget ───────────────────────────────────────────────────────
  let budget;
  try {
    budget = await createBudget(user.id, parsed.data);
  } catch (err) {
    // P2002 = unique constraint (kasus balapan dua request bersamaan)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Anggaran dengan nama ini untuk bulan dan tahun ini sudah ada." },
        { status: 409 },
      );
    }

    console.error("[POST /api/budget] Prisma error:", err);
    return NextResponse.json(
      { error: "Gagal membuat anggaran. Silakan coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: budget }, { status: 201 });
}