import { getTransaksiByUser } from "@/lib/services/transaksi";
import { getPreferensiUrutan } from "@/lib/preferensi";
import { getCurrentUser } from "@/lib/services/auth";
import { JenisTransaksi } from "@/app/generated/prisma/client";
import TransaksiList from "@/components/transaksi/TransaksiList";

type SearchParams = {
  jenis?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function TransaksiPage({ searchParams }: Props) {
  // Auth
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Filter jenis
  const { jenis: jenisParam } = await searchParams;
  const jenisUpper = jenisParam?.toUpperCase();
  const jenis: JenisTransaksi | undefined =
    jenisUpper === "PEMASUKAN" || jenisUpper === "PENGELUARAN"
      ? (jenisUpper as JenisTransaksi)
      : undefined;

  // Urutan dari cookie preferensi
  const urutan = await getPreferensiUrutan();

  // Fetch data
  const transaksi = await getTransaksiByUser({ userId: user.id, jenis, urutan });

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-6 py-8 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <TransaksiList
          initialTransaksi={transaksi}
          initialJenis={jenisParam}
          urutan={urutan}
        />
      </div>
    </main>
  );
}
