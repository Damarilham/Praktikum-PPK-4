"use client";

type Props = {
  aktif?: string | null;
  onFilterChange?: (value: string | null) => void;
  disabled?: boolean;
};

const FILTER_OPTIONS: { label: string; value: string | null }[] = [
  { label: "Semua", value: null },
  { label: "Pemasukan", value: "pemasukan" },
  { label: "Pengeluaran", value: "pengeluaran" },
];

export default function FilterJenis({ aktif, onFilterChange, disabled }: Props) {
  const aktifLower = aktif ? aktif.toLowerCase() : null;

  function handleClick(value: string | null) {
    if (disabled) return;
    if (onFilterChange) {
      onFilterChange(value);
    } else {
      const url = new URL(window.location.href);
      if (value) {
        url.searchParams.set("jenis", value);
      } else {
        url.searchParams.delete("jenis");
      }
      window.history.replaceState(null, "", url.toString());
      window.dispatchEvent(new CustomEvent("filter-jenis-change", { detail: value }));
    }
  }

  return (
    <div className="flex gap-2 text-sm" role="group" aria-label="Filter jenis transaksi">
      {FILTER_OPTIONS.map(({ label, value }) => {
        const isActive =
          aktifLower === (value ?? null) || (!aktifLower && !value);
        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => handleClick(value)}
            className="rounded-full px-3 py-1 border transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          </button>
        );
      })}
    </div>
  );
}

