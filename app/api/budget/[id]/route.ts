import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/services/auth";
import {
  getBudgetById,
  updateBudget,
  deleteBudget,
} from "@/lib/services/budget";
import { budgetUpdateSchema } from "@/lib/validations/budget";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/budget/[id]
 * Ambil detail anggaran milik user yang sedang login.
 * Anggaran milik user lain dijawab 404 (FR-13), agar keberadaannya tidak bocor.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const budgetId = parseInt(id, 10);

  if (isNaN(budgetId)) {
    return NextResponse.json(
      { error: "ID anggaran tidak valid" },
      { status: 400 },
    );
  }

  // ─── Auth (FR-13) ────────────────────────────────────────────────────────
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  // ─── Query detail (dengan ownership check) ───────────────────────────────
  const budget = await getBudgetById(user.id, budgetId);

  if (!budget) {
    return NextResponse.json(
      { error: "Anggaran tidak ditemukan" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: budget });
}

/**
 * PATCH /api/budget/[id]
 * Ubah nominal anggaran milik user yang sedang login.
 *
 * Body:
 *   - nominal : integer > 0
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const budgetId = parseInt(id, 10);

  if (isNaN(budgetId)) {
    return NextResponse.json(
      { error: "ID anggaran tidak valid" },
      { status: 400 },
    );
  }

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

  const parsed = budgetUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Input tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // ─── Cek kepemilikan & update ────────────────────────────────────────────
  const existing = await getBudgetById(user.id, budgetId);

  if (!existing) {
    return NextResponse.json(
      { error: "Anggaran tidak ditemukan" },
      { status: 404 },
    );
  }

  let budget;
  try {
    budget = await updateBudget(user.id, budgetId, parsed.data);
  } catch (err) {
    console.error("[PATCH /api/budget/[id]] Prisma error:", err);
    return NextResponse.json(
      { error: "Gagal mengubah anggaran. Silakan coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: budget });
}

/**
 * DELETE /api/budget/[id]
 * Hapus anggaran milik user yang sedang login.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const budgetId = parseInt(id, 10);

  if (isNaN(budgetId)) {
    return NextResponse.json(
      { error: "ID anggaran tidak valid" },
      { status: 400 },
    );
  }

  // ─── Auth (FR-13) ────────────────────────────────────────────────────────
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  // ─── Cek kepemilikan & hapus ─────────────────────────────────────────────
  const existing = await getBudgetById(user.id, budgetId);

  if (!existing) {
    return NextResponse.json(
      { error: "Anggaran tidak ditemukan" },
      { status: 404 },
    );
  }

  try {
    await deleteBudget(user.id, budgetId);
  } catch (err) {
    console.error("[DELETE /api/budget/[id]] Prisma error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus anggaran. Silakan coba lagi." },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Anggaran berhasil dihapus" });
}
