import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { JenisTransaksi, PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@kantongmahasiswa.test" },
    update: {},
    create: {
      nama: "Mahasiswa Demo",
      email: "demo@kantongmahasiswa.test",
      password: passwordHash,
    },
  });

  const kategoriPemasukan = ["Uang Saku", "Beasiswa", "Freelance"];
  const kategoriPengeluaran = ["Makan", "Transportasi", "Kos", "Hiburan", "Kuliah"];

  const jumlahTransaksiLama = await prisma.transaksi.count({
    where: { userId: user.id },
  });

  if (jumlahTransaksiLama === 0) {
    const transaksiDummy = Array.from({ length: 20 }).map(() => {
      const jenis = faker.helpers.arrayElement([
        JenisTransaksi.PEMASUKAN,
        JenisTransaksi.PENGELUARAN,
      ]);
      const kategori =
        jenis === JenisTransaksi.PEMASUKAN
          ? faker.helpers.arrayElement(kategoriPemasukan)
          : faker.helpers.arrayElement(kategoriPengeluaran);

      return {
        userId: user.id,
        jenis,
        nominal: faker.number.int({ min: 10_000, max: 750_000 }),
        kategori,
        deskripsi: faker.lorem.words({ min: 2, max: 5 }),
        tanggal: faker.date.recent({ days: 30 }),
      };
    });

    await prisma.transaksi.createMany({ data: transaksiDummy });
  }

  console.log(`Seed selesai. Login demo: ${user.email} / password123`);
  console.log(`User id: ${user.id} (pakai untuk cookie "userId" saat testing dashboard).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
