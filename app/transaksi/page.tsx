import Link from "next/link";
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
        {/* Toolbar: Kembali ke Dashboard + filter jenis + toggle urutan */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-[#1e1e1e] px-3.5 py-1 text-sm font-medium text-zinc-300 shadow-sm hover:border-indigo-500 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              <svg
                className="h-3.5 w-3.5 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              <span>Kembali ke Dashboard</span>
            </Link>

            <FilterJenis aktif={jenis} />
          </div>

          <ToggleUrutan current={urutan} />
        </div>

        <TransaksiList initialTransaksi={transaksi} />
      </div>
    </main>
  );
}
