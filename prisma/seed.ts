import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, JenisTransaksi } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("Seeding database...");

  // Bersihkan data lama jika perlu
  await prisma.transaksi.deleteMany();
  await prisma.user.deleteMany();

  // Buat User contoh
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      nama: "Mahasiswa Contoh",
      email: "mahasiswa@example.com",
      password: hashedPassword,
    },
  });

  // Buat beberapa Transaksi dummy
  for (let i = 0; i < 10; i++) {
    await prisma.transaksi.create({
      data: {
        userId: user.id,
        jenis: i % 2 === 0 ? JenisTransaksi.PEMASUKAN : JenisTransaksi.PENGELUARAN,
        nominal: faker.number.int({ min: 10000, max: 200000 }),
        kategori: i % 2 === 0 ? "Kiriman Orang Tua" : "Makan & Minum",
        deskripsi: faker.commerce.productName(),
        tanggal: faker.date.recent(),
      },
    });
  }

  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
