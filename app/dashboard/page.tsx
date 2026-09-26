import Link from "next/link";
import { redirect } from "next/navigation";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { getCurrentUser } from "@/lib/services/auth";
import LogoutButton from "@/components/auth/LogoutButton";
import DashboardActions from "@/components/dashboard/DashboardActions";
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
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const summary = await getDashboardSummary(user.id);

  if (!summary) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Data user tidak ditemukan.
        </p>
      </div>
    );
  }

  const { nama, saldo, totalPemasukan, totalPengeluaran, transaksiTerbaru } =
    summary;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-10 dark:bg-zinc-950 sm:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Selamat datang kembali,
            </p>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {nama}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DashboardActions />
            <LogoutButton />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RingkasanCard label="Saldo" nilai={saldo} tekanan />
          <RingkasanCard label="Total Pemasukan" nilai={totalPemasukan} />
          <RingkasanCard label="Total Pengeluaran" nilai={totalPengeluaran} />
        </section>

        <section className="mt-8 rounded-2xl border-2 border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <div className="border-b-2 border-zinc-300 px-6 py-4 dark:border-zinc-700">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Transaksi Terbaru
            </h2>
          </div>

          {transaksiTerbaru.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Belum ada transaksi. Mulai catat pemasukan atau pengeluaranmu.
            </p>
          ) : (
            <ul className="divide-y-2 divide-zinc-300 dark:divide-zinc-700">
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
    <div className="rounded-2xl border-2 border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
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
