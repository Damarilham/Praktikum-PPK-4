"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { JenisTransaksi } from "@/app/generated/prisma/client";

type Props = {
  aktif?: JenisTransaksi;
};

const FILTER_OPTIONS: { label: string; value: string | null }[] = [
  { label: "Semua", value: null },
  { label: "Pemasukan", value: "pemasukan" },
  { label: "Pengeluaran", value: "pengeluaran" },
];

function FilterJenisInner({ aktif }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildHref(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("jenis", value);
    } else {
      params.delete("jenis");
    }
    return `${pathname}?${params.toString()}`;
  }

  const aktifLower = aktif?.toLowerCase();

  return (
    <div className="flex gap-2 text-sm">
      {FILTER_OPTIONS.map(({ label, value }) => {
        const isActive = aktifLower === (value ?? undefined) || (!aktifLower && !value);
        return (
          <Link
            key={label}
            href={buildHref(value)}
            className="rounded-full px-3 py-1 border transition-colors text-sm font-medium"
            style={
              isActive
                ? {
                    background: "#6366f1",
                    color: "#ffffff",
                    borderColor: "#6366f1",
                  }
                : {
                    background: "#1e1e1e",
                    color: "#9ca3af",
                    borderColor: "#2e2e2e",
                  }
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export default function FilterJenis(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex gap-2 text-sm" style={{ color: "#6b7280" }}>
          Loading filter...
        </div>
      }
    >
      <FilterJenisInner {...props} />
    </Suspense>
  );
}
