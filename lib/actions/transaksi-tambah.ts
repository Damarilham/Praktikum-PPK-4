import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PrismaClient } from "@/app/generated/prisma/client";
import type { User } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export const SESSION_COOKIE_NAME = "session";

export const transaksiSchema = z.object({
  jenis: z.enum(["PEMASUKAN", "PENGELUARAN"]),
  nominal: z.coerce.number().int().positive("Nominal harus lebih dari 0"),
  kategori: z.string().trim().max(100).optional(),
  deskripsi: z.string().trim().max(500).optional(),
  tanggal: z.coerce.date(),
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL tidak terdefinisi");
    }
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }
  return globalForPrisma.prisma;
}

function createSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = Buffer.from(createSignature(payload, secret));
  const received = Buffer.from(signature);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

type SessionPayload = { userId: number; exp: number };

function parseSessionToken(token: string): SessionPayload | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || !verifySignature(payload, signature, secret)) {
    return null;
  }
  let data: SessionPayload;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
  if (typeof data.userId !== "number" || typeof data.exp !== "number") {
    return null;
  }
  if (data.exp <= Date.now()) {
    return null;
  }
  return data;
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  const session = parseSessionToken(token);
  if (!session) {
    return null;
  }
  return getPrisma().user.findUnique({ where: { id: session.userId } });
}

export async function tambahTransaksi(formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Tidak terautentikasi");
  }

  const parsed = transaksiSchema.safeParse({
    jenis: formData.get("jenis"),
    nominal: formData.get("nominal"),
    kategori: formData.get("kategori"),
    deskripsi: formData.get("deskripsi"),
    tanggal: formData.get("tanggal"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Data transaksi tidak valid");
  }

  const { jenis, nominal, kategori, deskripsi, tanggal } = parsed.data;

  await getPrisma().transaksi.create({
    data: {
      userId: user.id,
      jenis,
      nominal,
      kategori: kategori || null,
      deskripsi: deskripsi || null,
      tanggal,
    },
  });

  revalidatePath("/transaksi");
  redirect("/transaksi");
}