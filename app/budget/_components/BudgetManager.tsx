"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BudgetForm from "./BudgetForm";

type BudgetData = {
  id: number;
  bulan: number;
  tahun: number;
  nominal: number;
};

type Props = {
  bulan: number;
  tahun: number;
  budget: BudgetData | null;
};

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function BudgetManager({ bulan, tahun, budget }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Setelah simpan: pindah ke bulan yang baru disimpan, lalu ambil ulang data server
  function handleSuccess(bulanTersimpan: number, tahunTersimpan: number) {
    router.push(`/budget?bulan=${bulanTersimpan}&tahun=${tahunTersimpan}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!budget) return;
    if (!confirm("Yakin ingin menghapus anggaran bulan ini?")) return;

    setDeleting(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/budget/${budget.id}`, { method: "DELETE" });

      let data;
      try {
        data = await res.json();
      } catch {
        setErrorMessage("Response server tidak valid");
        return;
      }

      if (!res.ok) {
        if (res.status === 401) {
          setErrorMessage("Sesi berakhir. Silakan login ulang.");
        } else {
          setErrorMessage(data.error ?? `Error ${res.status}: ${res.statusText}`);
        }
        return;
      }

      router.refresh();
    } catch (err) {
      if (err instanceof TypeError) {
        setErrorMessage("Terjadi kesalahan jaringan. Periksa koneksi Anda.");
      } else {
        console.error("Unexpected error:", err);
        setErrorMessage("Terjadi kesalahan tak terduga");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <section className="rounded-2xl border-2 border-zinc-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Anggaran pengeluaran {NAMA_BULAN[bulan - 1]} {tahun}
        </p>

        {budget ? (
          <>
            <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {rupiah.format(budget.nominal)}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                disabled={deleting}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer transition-colors"
              >
                Ubah Anggaran
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl border-2 border-red-400 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950 cursor-pointer transition-colors"
              >
                {deleting ? "Menghapus..." : "Hapus Anggaran"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Belum ada anggaran untuk bulan ini.
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 cursor-pointer transition-colors"
              >
                Set Anggaran
              </button>
            </div>
          </>
        )}

        {errorMessage && (
          <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
        )}
      </section>

      {showForm && (
        <BudgetForm
          mode={budget ? "edit" : "create"}
          bulan={bulan}
          tahun={tahun}
          initialData={budget ?? undefined}
          onSuccess={handleSuccess}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
