import {
  getBudgetStatus,
  getPersentasePemakaian,
} from "@/lib/utils/budget-status";

interface BudgetIndicatorProps {
  totalPemasukan: number;
  totalPengeluaran: number;
}

const persenFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
});

export default function BudgetIndicator({
  totalPemasukan,
  totalPengeluaran,
}: BudgetIndicatorProps) {
  const persentase = getPersentasePemakaian(
    totalPemasukan,
    totalPengeluaran
  );
  const status = getBudgetStatus(persentase);
  const persenTampil = Number.isFinite(persentase) ? persentase : 100;
  const lebarBar = Math.min(Math.max(persenTampil, 0), 100);

  return (
    <section
      aria-label="Budget Indikator"
      className="mt-4 rounded-2xl border-2 border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Budget Indikator
        </h2>
        <p className={`text-sm font-semibold ${status.textClassName}`}>
          {status.label} ·{" "}
          {Number.isFinite(persentase)
            ? `${persenFormat.format(persentase)}%`
            : ">100%"}
        </p>
      </div>

      <div
        className="mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(lebarBar)}
        aria-valuetext={`${status.label} ${persenFormat.format(lebarBar)} persen`}
      >
        <div
          className={`h-full rounded-full transition-all ${status.barClassName}`}
          style={{ width: `${lebarBar}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Pemakaian {persenFormat.format(Math.min(persentase, 9999))}% dari
        pemasukan. Aman &lt; 70%, Waspada 70–100%, Melebihi ≥ 100%.
      </p>
    </section>
  );
}
