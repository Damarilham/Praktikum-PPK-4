import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/services/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: { id: user.id, nama: user.nama, email: user.email },
  });
}
