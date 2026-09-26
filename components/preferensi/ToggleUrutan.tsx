"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPreferensiUrutan } from "@/lib/actions/preferensi";
import type { UrutanTransaksi } from "@/lib/preferensi";

const OPTIONS: { label: string; value: UrutanTransaksi }[] = [
  { label: "Terbaru", value: "terbaru" },
  { label: "Terlama", value: "terlama" },
];

export default function ToggleUrutan({ current }: { current: UrutanTransaksi }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(urutan: UrutanTransaksi) {
    if (urutan === current || isPending) return;
    startTransition(async () => {
      await setPreferensiUrutan(urutan);
      router.refresh();
    });
  }

  return (
    <div
      className="flex items-center gap-1 rounded-xl p-1 text-sm"
      style={{ background: "#1e1e1e", border: "1px solid #2e2e2e" }}
    >
      {OPTIONS.map(({ label, value }) => {
        const isActive = current === value;
        return (
          <button
            key={value}
            onClick={() => handleChange(value)}
            disabled={isPending}
            className="relative rounded-lg px-4 py-1.5 font-medium transition-all duration-200 disabled:opacity-60"
            style={
              isActive
                ? {
                    background: "#ffffff",
                    color: "#0f0f0f",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                  }
                : {
                    background: "transparent",
                    color: "#9ca3af",
                  }
            }
          >
            {isPending && isActive ? (
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 animate-spin rounded-full border-2"
                  style={{ borderColor: "#555 #555 #555 transparent" }}
                />
                {label}
              </span>
            ) : (
              label
            )}
          </button>
        );
      })}
    </div>
  );
}
