import { getTransaksiByUser } from "@/lib/services/transaksi";
import { getPreferensiUrutan } from "@/lib/preferensi";
import { JenisTransaksi, type Transaksi } from "@/app/generated/prisma/client";
import ToggleUrutan from "@/components/preferensi/ToggleUrutan";
import FilterJenis from "@/components/transaksi/FilterJenis";

type SearchParams = {
  jenis?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function TransaksiPage({ searchParams }: Props) {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  // TODO (P1): ganti dengan getCurrentUser() dari lib/services/auth.ts
  // Sementara itu, gunakan userId dummy untuk development
  const userId = 1;

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
  const transaksi = await getTransaksiByUser({ userId, jenis, urutan });

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Riwayat Transaksi
        </h1>

        {/* Toolbar: filter jenis + toggle urutan */}
        <div className="flex items-center justify-between mb-4">
          <FilterJenis aktif={jenis} />
          <ToggleUrutan current={urutan} />
        </div>

        {/* Tabel transaksi */}
        {transaksi.length === 0 ? (
          <p className="text-center text-gray-400 py-16">
            Belum ada transaksi.
          </p>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Kategori</th>
                  <th className="px-4 py-3 text-left">Deskripsi</th>
                  <th className="px-4 py-3 text-left">Jenis</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transaksi.map((t: Transaksi) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(t.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">{t.kategori ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {t.deskripsi ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          t.jenis === "PEMASUKAN"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t.jenis === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        t.jenis === "PEMASUKAN"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {t.jenis === "PENGELUARAN" ? "-" : "+"}
                      Rp{t.nominal.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
