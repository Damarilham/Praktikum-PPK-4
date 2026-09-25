import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword, createSession } from "@/lib/services/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Input tidak valid", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { nama, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email sudah terdaftar" },
      { status: 409 },
    );
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: { nama, email, password: hashed },
  });

  // Auto-login setelah register
  await createSession(user.id);

  return NextResponse.json(
    { user: { id: user.id, nama: user.nama, email: user.email } },
    { status: 201 },
  );
}
