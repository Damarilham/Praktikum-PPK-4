import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { getCurrentUser } from "@/lib/services/auth";

// GET /api/dashboard — ringkasan dashboard user yang sedang login (FR-04).
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const summary = await getDashboardSummary(user.id);

  if (!summary) {
    return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(summary);
}
