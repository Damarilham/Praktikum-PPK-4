import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { getCurrentUserIdPlaceholder } from "@/lib/session-placeholder";

// GET /api/dashboard — ringkasan dashboard user yang sedang login (FR-04).
// TODO(P1): ganti getCurrentUserIdPlaceholder() dengan getCurrentUser()/getSession()
// asli begitu modul auth (FR-02) tersedia.
export async function GET() {
  const userId = await getCurrentUserIdPlaceholder();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const summary = await getDashboardSummary(userId);

  if (!summary) {
    return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(summary);
}
