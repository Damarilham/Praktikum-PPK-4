"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const MONTHS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

function MonthSelectorInner({
  bulan,
  tahun,
}: {
  bulan: number;
  tahun: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(newBulan: number, newTahun: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("bulan", String(newBulan));
    params.set("tahun", String(newTahun));
    return `${pathname}?${params.toString()}`;
  }

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="bulan" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Bulan
      </label>
      <select
        id="bulan"
        value={bulan}
        onChange={(e) => (window.location.href = buildHref(Number(e.target.value), tahun))}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500"
      >
        {MONTHS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <label htmlFor="tahun" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Tahun
      </label>
      <select
        id="tahun"
        value={tahun}
        onChange={(e) => (window.location.href = buildHref(bulan, Number(e.target.value)))}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500"
      >
        {yearOptions.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function MonthSelector({
  bulan,
  tahun,
}: {
  bulan: number;
  tahun: number;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-wrap items-center gap-3" style={{ color: "#6b7280" }}>
          <span className="text-sm font-medium">Bulan</span>
          <select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" disabled>
            <option>Memuat...</option>
          </select>
          <span className="text-sm font-medium">Tahun</span>
          <select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" disabled>
            <option>Memuat...</option>
          </select>
        </div>
      }
    >
      <MonthSelectorInner bulan={bulan} tahun={tahun} />
    </Suspense>
  );
}