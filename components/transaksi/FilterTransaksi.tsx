"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const OPSI_FILTER = [
  { value: null, label: "Semua" },
  { value: "pemasukan", label: "Pemasukan" },
  { value: "pengeluaran", label: "Pengeluaran" },
] as const;

type NilaiJenis = (typeof OPSI_FILTER)[number]["value"];

export default function FilterTransaksi() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const aktif = searchParams.get("jenis");

  function buatHref(jenis: NilaiJenis): string {
    const params = new URLSearchParams(searchParams.toString());
    if (jenis) {
      params.set("jenis", jenis);
    } else {
      params.delete("jenis");
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <nav className="flex items-center gap-2" aria-label="Filter transaksi">
      {OPSI_FILTER.map((opsi) => {
        const isAktif = opsi.value === null ? aktif === null : aktif === opsi.value;
        return (
          <Link
            key={opsi.label}
            href={buatHref(opsi.value)}
            aria-current={isAktif ? "page" : undefined}
            className={[
              "rounded-full border px-3 py-1 text-sm",
              isAktif
                ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-400 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:text-zinc-100",
            ].join(" ")}
          >
            {opsi.label}
          </Link>
        );
      })}
    </nav>
  );
}