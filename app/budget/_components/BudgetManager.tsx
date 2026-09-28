"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BudgetForm from "./BudgetForm";

type BudgetData = {
  id: number;
  nama: string;
  bulan: number;
  tahun: number;
  nominal: number;
};

type Props = {
  bulan: number;
  tahun: number;
  budgets: BudgetData[];
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

export default function BudgetManager({ bulan, tahun, budgets }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetData | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Setelah simpan: pindah ke bulan yang baru disimpan, lalu ambil ulang data server
  function handleSuccess(bulanTersimpan: number, tahunTersimpan: number) {
    router.push(`/budget?bulan=${bulanTersimpan}&tahun=${tahunTersimpan}`);
    router.refresh();
  }

  async function handleDelete(budgetId: number) {
    if (!confirm("Yakin ingin menghapus anggaran ini?")) return;

    setDeletingId(budgetId);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/budget/${budgetId}`, { method: "DELETE" });

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
      setDeletingId(null);
    }
  }

  const totalAnggaran = budgets.reduce((sum, b) => sum + b.nominal, 0);

  return (
    <>
      <section className="rounded-2xl border-2 border-zinc-300 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Anggaran pengeluaran {NAMA_BULAN[bulan - 1]} {tahun}
          </p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Total: {rupiah.format(totalAnggaran)}
          </p>
        </div>

        {budgets.length > 0 ? (
          <div className="space-y-3">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {budget.nama}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {rupiah.format(budget.nominal)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBudget(budget);
                      setShowForm(true);
                    }}
                    disabled={deletingId !== null}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(budget.id)}
                    disabled={deletingId !== null}
                    className="rounded-lg border border-red-400 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950 cursor-pointer transition-colors"
                  >
                    {deletingId === budget.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center py-8">
            Belum ada anggaran untuk bulan ini.
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => {
              setEditingBudget(null);
              setShowForm(true);
            }}
            className="w-full sm:w-auto rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 cursor-pointer transition-colors"
          >
            + Tambah Anggaran
          </button>
        </div>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
        )}
      </section>

      {showForm && (
        <BudgetForm
          mode={editingBudget ? "edit" : "create"}
          bulan={bulan}
          tahun={tahun}
          initialData={editingBudget ?? undefined}
          onSuccess={handleSuccess}
          onClose={() => {
            setShowForm(false);
            setEditingBudget(null);
          }}
        />
      )}
    </>
  );
}