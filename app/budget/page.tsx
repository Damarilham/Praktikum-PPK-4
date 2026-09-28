import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/services/auth";
import { getBudgetsByMonth, getBudgetSummary } from "@/lib/services/budget";
import { parseBulanTahun } from "@/lib/validations/budget";
import BudgetManager from "./_components/BudgetManager";
import MonthSelector from "@/components/budget/MonthSelector";
import BudgetIndicator from "@/components/budget/BudgetIndicator";
import BudgetSummary from "@/components/budget/BudgetSummary";

export const metadata = {
  title: "Anggaran — Kantong Mahasiswa",
};

type Props = {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
};

export default async function BudgetPage({ searchParams }: Props) {
  // Auth (FR-13): halaman ini hanya untuk user yang sudah login
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  // Bulan & tahun dari query param, default ke bulan berjalan
  const { bulan: bulanParam, tahun: tahunParam } = await searchParams;
  const { bulan, tahun } = parseBulanTahun(bulanParam, tahunParam);

  // Query di-scope ke user yang login (FR-13)
  const [summary, budgets] = await Promise.all([
    getBudgetSummary(user.id, bulan, tahun),
    getBudgetsByMonth(user.id, bulan, tahun),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-10 dark:bg-zinc-950 sm:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Anggaran Bulanan
            </h1>
            <MonthSelector bulan={bulan} tahun={tahun} />
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-xl border-2 border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            Kembali ke Dashboard
          </Link>
        </header>

        {summary && (
          <>
            <BudgetSummary bulan={bulan} tahun={tahun} />
            <BudgetIndicator
              totalPemasukan={summary.totalBudget}
              totalPengeluaran={summary.totalSpent}
            />
          </>
        )}

        <BudgetManager
          bulan={bulan}
          tahun={tahun}
          budgets={budgets.map((b) => ({
            id: b.id,
            nama: b.nama,
            bulan: b.bulan,
            tahun: b.tahun,
            nominal: b.nominal,
          }))}
        />
      </div>
    </div>
  );
}