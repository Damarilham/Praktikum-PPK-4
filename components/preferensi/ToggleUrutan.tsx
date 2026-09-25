"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPreferensiUrutan } from "@/lib/actions/preferensi";
import type { UrutanTransaksi } from "@/lib/preferensi";

export default function ToggleUrutan({ current }: { current: UrutanTransaksi }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(urutan: UrutanTransaksi) {
    startTransition(async () => {
      await setPreferensiUrutan(urutan);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2 text-sm">
      <button
        onClick={() => handleChange("terbaru")}
        disabled={isPending}
        className={current === "terbaru" ? "font-semibold underline" : ""}
      >
        Terbaru
      </button>
      <button
        onClick={() => handleChange("terlama")}
        disabled={isPending}
        className={current === "terlama" ? "font-semibold underline" : ""}
      >
        Terlama
      </button>
    </div>
  );
}
