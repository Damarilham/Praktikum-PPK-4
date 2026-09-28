"use client";

import { useEffect, useState } from "react";
import type {
  BudgetSummary as BudgetSummaryData,
  BudgetSummaryStatus,
} from "@/lib/services/budget";

type BudgetSummaryProps = {
  bulan: number;
  tahun: number;
};

type ViewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "notFound" }
  | { status: "success"; data: BudgetSummaryData };

const rupiahFormat = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const percentageFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
});

const statusStyles: Record<
  BudgetSummaryStatus,
  { label: string; bar: string; remaining: string }
> = {
  aman: {
    label: "Aman",
    bar: "bg-emerald-500",
    remaining: "text-emerald-700 dark:text-emerald-400",
  },
  warning: {
    label: "Mendekati batas",
    bar: "bg-amber-500",
    remaining: "text-amber-700 dark:text-amber-400",
  },
  over: {
    label: "Melebihi budget",
    bar: "bg-red-500",
    remaining: "text-red-700 dark:text-red-400",
  },
};

export default function BudgetSummary({
  bulan,
  tahun,
}: BudgetSummaryProps) {
  const [view, setView] = useState<ViewState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      setView({ status: "loading" });

      try {
        const response = await fetch(
          `/api/budget/summary?bulan=${encodeURIComponent(bulan)}&tahun=${encodeURIComponent(tahun)}`,
          { signal: controller.signal },
        );

        if (response.status === 404) {
          setView({ status: "notFound" });
          return;
        }

        const body = (await response.json()) as {
          data?: BudgetSummaryData;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(body.error ?? "Gagal memuat ringkasan budget.");
        }
        if (!body.data) {
          throw new Error("Respons ringkasan budget tidak valid.");
        }

        setView({ status: "success", data: body.data });
      } catch (error) {
        if (controller.signal.aborted) return;
        setView({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Gagal memuat ringkasan budget.",
        });
      }
    }

    void loadSummary();
    return () => controller.abort();
  }, [bulan, tahun]);

  if (view.status === "loading") {
    return (
      <section
        aria-live="polite"
        className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
      >
        Memuat ringkasan budget...
      </section>
    );
  }

  if (view.status === "notFound") {
    return (
      <section
        aria-live="polite"
        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
      >
        Budget untuk {bulan}/{tahun} belum dibuat.
      </section>
    );
  }

  if (view.status === "error") {
    return (
      <section
        aria-live="assertive"
        className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
      >
        {view.message}
      </section>
    );
  }

  const { data } = view;
  const styles = statusStyles[data.status];
  const progressWidth = Math.min(Math.max(data.percentage, 0), 100);
  const cards = [
    { label: "Total Budget", value: data.totalBudget, valueClass: "" },
    { label: "Total Pengeluaran", value: data.totalSpent, valueClass: "" },
    {
      label: "Sisa",
      value: data.remaining,
      valueClass: styles.remaining,
    },
  ];

  return (
    <section
      aria-label="Ringkasan budget bulanan"
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Ringkasan Budget
        </h2>
        <p className={`text-sm font-semibold ${styles.remaining}`}>
          {styles.label}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {cards.map(({ label, value, valueClass }) => (
          <div
            key={label}
            className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
            <p
              className={`mt-1 text-lg font-semibold ${valueClass || "text-zinc-900 dark:text-zinc-50"}`}
            >
              {rupiahFormat.format(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between gap-3 text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">
            Pemakaian budget
          </span>
          <span className={`font-semibold ${styles.remaining}`}>
            {percentageFormat.format(data.percentage)}%
          </span>
        </div>
        <div
          className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
          role="progressbar"
          aria-label="Persentase budget terpakai"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressWidth)}
          aria-valuetext={`${percentageFormat.format(data.percentage)}% terpakai`}
        >
          <div
            className={`h-full rounded-full transition-all ${styles.bar}`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </section>
  );
}
