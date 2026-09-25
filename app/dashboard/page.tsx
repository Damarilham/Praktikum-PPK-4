import Link from "next/link";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { getCurrentUserIdPlaceholder } from "@/lib/session-placeholder";
import { JenisTransaksi } from "@/app/generated/prisma/client";

export const metadata = {
  title: "Dashboard — Kantong Mahasiswa",
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const tanggalPendek = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function DashboardPage() {
  // TODO(P1): ganti dengan getCurrentUser()/getSession() dari lib/services/auth.ts
  // begitu FR-02 selesai, lalu redirect('/login') jika belum autentikasi.
  const userId = await getCurrentUserIdPlaceholder();

  if (!userId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
        <div className="max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Belum ada sesi login
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Modul autentikasi (FR-02) belum terpasang di branch ini. Untuk
            keperluan development, set cookie <code className="rounded bg-black/[.06] px-1 py-0.5 dark:bg-white/[.08]">userId</code>{" "}
            ke salah satu id user yang ada di database.
          </p>
        </div>
      </div>
    );
  }

  const summary = await getDashboardSummary(userId);

  if (!summary) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          User dengan id {userId} tidak ditemukan.
        </p>
      </div>
    );
  }

  const { nama, saldo, totalPemasukan, totalPengeluaran, transaksiTerbaru } =
    summary;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-10 dark:bg-black sm:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Selamat datang kembali,
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {nama}
          </h1>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RingkasanCard label="Saldo" nilai={saldo} tekanan />
          <RingkasanCard label="Total Pemasukan" nilai={totalPemasukan} />
          <RingkasanCard label="Total Pengeluaran" nilai={totalPengeluaran} />
        </section>

        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Transaksi Terbaru
            </h2>
            <Link
              href="/transaksi"
              className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Lihat semua
            </Link>
          </div>

          {transaksiTerbaru.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Belum ada transaksi. Mulai catat pemasukan atau pengeluaranmu.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {transaksiTerbaru.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {t.kategori ?? (t.deskripsi || "Tanpa kategori")}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {tanggalPendek.format(t.tanggal)}
                      {t.deskripsi && t.kategori ? ` · ${t.deskripsi}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold ${
                      t.jenis === JenisTransaksi.PEMASUKAN
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {t.jenis === JenisTransaksi.PEMASUKAN ? "+" : "-"}
                    {rupiah.format(t.nominal)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function RingkasanCard({
  label,
  nilai,
  tekanan = false,
}: {
  label: string;
  nilai: number;
  tekanan?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold ${
          tekanan
            ? nilai >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
            : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {rupiah.format(nilai)}
      </p>
    </div>
  );
}
