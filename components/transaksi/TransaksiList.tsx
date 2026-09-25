"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Transaksi } from "@/app/generated/prisma/client";
import TransaksiForm from "./TransaksiForm";

type Props = {
  initialTransaksi: Transaksi[];
};

export default function TransaksiList({ initialTransaksi }: Props) {
  const router = useRouter();
  const [transaksi, setTransaksi] = useState<Transaksi[]>(initialTransaksi);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaksi, setEditingTransaksi] = useState<Transaksi | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function refresh() {
    router.refresh();
  }

  function handleCreate() {
    setEditingTransaksi(null);
    setShowForm(true);
  }

  function handleEdit(t: Transaksi) {
    setEditingTransaksi(t);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingTransaksi(null);
  }

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/transaksi/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Gagal menghapus transaksi");
        return;
      }
      setTransaksi((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setDeletingId(null);
    }
  }

  function handleFormSuccess() {
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h1>
        <button
          onClick={handleCreate}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Tambah Transaksi
        </button>
      </div>

      {transaksi.length === 0 ? (
        <p className="text-center text-gray-400 py-16">Belum ada transaksi.</p>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Deskripsi</th>
                <th className="px-4 py-3 text-left">Jenis</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transaksi.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(t.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">{t.kategori ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{t.deskripsi ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.jenis === "PEMASUKAN"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.jenis === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      t.jenis === "PEMASUKAN" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.jenis === "PENGELUARAN" ? "-" : "+"}
                    Rp{t.nominal.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(t)}
                        disabled={deletingId === t.id}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        {deletingId === t.id ? "Menghapus..." : "Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <TransaksiForm
          mode={editingTransaksi ? "edit" : "create"}
          initialData={editingTransaksi ?? undefined}
          onSuccess={handleFormSuccess}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}