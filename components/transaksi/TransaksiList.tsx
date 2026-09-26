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
  const [showForm, setShowForm] = useState(false);
  const [editingTransaksi, setEditingTransaksi] = useState<Transaksi | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  const transaksi = initialTransaksi.filter((t) => !deletedIds.has(t.id));

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
    setDeletedIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/transaksi/${id}`, { method: "DELETE" });

      let data;
      try {
        data = await res.json();
      } catch {
        alert("Response server tidak valid");
        setDeletedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        return;
      }

      if (!res.ok) {
        if (res.status === 401) {
          alert("Sesi berakhir. Silakan login ulang.");
        } else {
          alert(data.error ?? `Error ${res.status}: ${res.statusText}`);
        }
        setDeletedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        return;
      }
      // Success: router.refresh() will re-fetch server data
      refresh();
    } catch (err) {
      setDeletedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (err instanceof TypeError && err.message.includes("fetch")) {
        alert("Terjadi kesalahan jaringan. Periksa koneksi Anda.");
      } else {
        console.error("Unexpected error:", err);
        alert("Terjadi kesalahan tak terduga");
      }
    } finally {
      setDeletingId(null);
    }
  }

  function handleFormSuccess() {
    setDeletedIds(new Set());
    refresh();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" style={{ color: "#f0f0f0" }}>
          Riwayat Transaksi
        </h1>
        <button
          onClick={handleCreate}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          style={{ background: "#6366f1", color: "#ffffff" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#4f46e5")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#6366f1")
          }
        >
          + Tambah Transaksi
        </button>
      </div>

      {transaksi.length === 0 ? (
        <p
          className="text-center py-16 text-sm"
          style={{ color: "#6b7280" }}
        >
          Belum ada transaksi.
        </p>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid #2e2e2e", background: "#1a1a1a" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#222222" }}>
                {["Tanggal", "Kategori", "Deskripsi", "Jenis", "Nominal", "Aksi"].map(
                  (col) => (
                    <th
                      key={col}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
                        col === "Nominal" || col === "Aksi" ? "text-right" : "text-left"
                      }`}
                      style={{ color: "#6b7280", borderBottom: "1px solid #2e2e2e" }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {transaksi.map((t, i) => (
                <tr
                  key={t.id}
                  style={{
                    borderBottom:
                      i < transaksi.length - 1 ? "1px solid #242424" : "none",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "#212121")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "transparent")
                  }
                >
                  {/* Tanggal */}
                  <td className="px-4 py-3" style={{ color: "#9ca3af" }}>
                    {new Date(t.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Kategori */}
                  <td className="px-4 py-3 font-medium" style={{ color: "#d1d5db" }}>
                    {t.kategori ?? "-"}
                  </td>

                  {/* Deskripsi */}
                  <td className="px-4 py-3" style={{ color: "#9ca3af" }}>
                    {t.deskripsi ?? "-"}
                  </td>

                  {/* Jenis badge */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={
                        t.jenis === "PEMASUKAN"
                          ? { background: "#052e16", color: "#4ade80" }
                          : { background: "#2d0a0a", color: "#f87171" }
                      }
                    >
                      {t.jenis === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </td>

                  {/* Nominal */}
                  <td
                    className="px-4 py-3 text-right font-bold"
                    style={{
                      color: t.jenis === "PEMASUKAN" ? "#4ade80" : "#f87171",
                    }}
                  >
                    {t.jenis === "PENGELUARAN" ? "-" : "+"}Rp
                    {t.nominal.toLocaleString("id-ID")}
                  </td>

                  {/* Aksi */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEdit(t)}
                        disabled={deletingId === t.id}
                        className="text-xs font-semibold transition-colors disabled:opacity-40"
                        style={{ color: "#818cf8" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.color = "#a5b4fc")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.color = "#818cf8")
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        className="text-xs font-semibold transition-colors disabled:opacity-40"
                        style={{ color: "#f87171" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.color = "#fca5a5")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.color = "#f87171")
                        }
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
