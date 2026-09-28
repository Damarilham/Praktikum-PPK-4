import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/services/auth";
import { createBudget, getBudgetByMonth } from "@/lib/services/budget";
import { budgetCreateSchema, parseBulanTahun } from "@/lib/validations/budget";

/**
 * GET /api/budget?bulan=9&tahun=2026
 *
 * Ambil anggaran milik user yang sedang login pada bulan & tahun tertentu.
 * Kalau bulan/tahun tidak diisi, dipakai bulan berjalan.
 * Response: { data: Budget | null, bulan, tahun }
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

  const budget = await getBudgetByMonth(user.id, bulan, tahun);

  return NextResponse.json({ data: budget, bulan, tahun });
}

/**
 * POST /api/budget
 *
 * Body:
 *   - bulan   : integer 1-12
 *   - tahun   : integer
 *   - nominal : integer > 0
 *
 * Satu user hanya boleh punya satu anggaran per bulan (409 kalau sudah ada).
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

  // ─── Cek duplikat: satu anggaran per bulan per user ──────────────────────
  const sudahAda = await getBudgetByMonth(
    user.id,
    parsed.data.bulan,
    parsed.data.tahun,
  );

  if (sudahAda) {
    return NextResponse.json(
      { error: "Anggaran untuk bulan dan tahun ini sudah ada. Gunakan ubah." },
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
        { error: "Anggaran untuk bulan dan tahun ini sudah ada." },
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
