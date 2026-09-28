import { NextRequest, NextResponse } from "next/server";
import { getBudgetSummary } from "@/lib/services/budget";
import { getCurrentUser } from "@/lib/services/auth";
import { budgetCreateSchema } from "@/lib/validations/budget";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    const bulanParam = request.nextUrl.searchParams.get("bulan");
    const tahunParam = request.nextUrl.searchParams.get("tahun");
    const bulan = budgetCreateSchema.shape.bulan.safeParse(
      bulanParam === null ? undefined : Number(bulanParam),
    );
    const tahun = budgetCreateSchema.shape.tahun.safeParse(
      tahunParam === null ? undefined : Number(tahunParam),
    );

    if (!bulan.success || !tahun.success) {
      return NextResponse.json(
        { error: "Parameter bulan (1-12) dan tahun (2000-2100) wajib diisi" },
        { status: 400 },
      );
    }

    const summary = await getBudgetSummary(user.id, bulan.data, tahun.data);
    if (!summary) {
      return NextResponse.json(
        { error: "Budget belum dibuat untuk bulan ini" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error("[GET /api/budget/summary] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
