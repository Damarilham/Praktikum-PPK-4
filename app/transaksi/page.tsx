import { getTransaksiByUser } from "@/lib/services/transaksi";
import { getPreferensiUrutan } from "@/lib/preferensi";
import { getCurrentUser } from "@/lib/services/auth";
import { JenisTransaksi } from "@/app/generated/prisma/client";
import ToggleUrutan from "@/components/preferensi/ToggleUrutan";
import FilterJenis from "@/components/transaksi/FilterJenis";
import TransaksiList from "@/components/transaksi/TransaksiList";

type SearchParams = {
  jenis?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function TransaksiPage({ searchParams }: Props) {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const user = await getCurrentUser();

  if (!user) {
    // Middleware sudah handle redirect, tapi sebagai fallback:
    return null;
  }

  // ─── Filter jenis dari query param (FR-07) ────────────────────────────────
  const { jenis: jenisParam } = await searchParams;
  const jenisUpper = jenisParam?.toUpperCase();
  const jenis: JenisTransaksi | undefined =
    jenisUpper === "PEMASUKAN" || jenisUpper === "PENGELUARAN"
      ? (jenisUpper as JenisTransaksi)
      : undefined;

  // ─── Urutan dari cookie preferensi (FR-08) ────────────────────────────────
  const urutan = await getPreferensiUrutan();

  // ─── Fetch data ───────────────────────────────────────────────────────────
  const transaksi = await getTransaksiByUser({ userId: user.id, jenis, urutan });

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Toolbar: filter jenis + toggle urutan */}
        <div className="flex items-center justify-between mb-4">
          <FilterJenis aktif={jenis} />
          <ToggleUrutan current={urutan} />
        </div>

        <TransaksiList initialTransaksi={transaksi} />
      </div>
    </main>
  );
}