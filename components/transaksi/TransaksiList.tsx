"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Transaksi } from "@/app/generated/prisma/client";
import type { UrutanTransaksi } from "@/lib/preferensi";
import FilterJenis from "./FilterJenis";
import ToggleUrutan from "@/components/preferensi/ToggleUrutan";
import TransaksiForm from "./TransaksiForm";

export type TransaksiItem = Omit<Transaksi, "tanggal"> & {
  tanggal: Date | string;
};

type Props = {
  initialTransaksi: TransaksiItem[];
  initialJenis?: string;
  urutan?: UrutanTransaksi;
};

export default function TransaksiList({
  initialTransaksi,
  initialJenis,
  urutan,
}: Props) {
  const router = useRouter();
  const [transaksi, setTransaksi] = useState<TransaksiItem[]>(initialTransaksi);
  const [currentJenis, setCurrentJenis] = useState<string | null>(
    initialJenis ? initialJenis.toLowerCase() : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaksi, setEditingTransaksi] = useState<TransaksiItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Sinkronisasi data saat server component me-refresh data (misal dari toggle urutan)
  useEffect(() => {
    setTransaksi(initialTransaksi);
  }, [initialTransaksi]);

  // Sinkronisasi filter saat pengguna menggunakan tombol Back/Forward browser
  useEffect(() => {
    function handlePopState() {
      const params = new URLSearchParams(window.location.search);
      const jenisParam = params.get("jenis");
      setCurrentJenis(jenisParam);
      fetchTransaksi(jenisParam);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  async function fetchTransaksi(jenisFilter: string | null = currentJenis) {
    setIsLoading(true);
    try {
      const query = jenisFilter ? `?jenis=${encodeURIComponent(jenisFilter)}` : "";
      const res = await fetch(`/api/transaksi${query}`);

      if (!res.ok) {
        if (res.status === 401) {
          alert("Sesi berakhir. Silakan login ulang.");
          return;
        }
        const errData = await res.json().catch(() => null);
        alert(errData?.error ?? `Error ${res.status}: ${res.statusText}`);
        return;
      }

      const json = await res.json();
      setTransaksi(json.data);
    } catch (err) {
      console.error("Gagal memuat transaksi:", err);
      alert("Terjadi kesalahan jaringan saat memuat data transaksi.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFilterChange(value: string | null) {
    setCurrentJenis(value);

    // Perbarui URL dengan history.replaceState agar ?jenis= tetap ada (FR-07) tanpa reload halaman
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("jenis", value);
    } else {
      url.searchParams.delete("jenis");
    }
    window.history.replaceState(null, "", url.toString());

    // Fetch data transaksi via AJAX
    fetchTransaksi(value);
  }

  function handleCreate() {
    setEditingTransaksi(null);
    setShowForm(true);
  }

  function handleEdit(t: TransaksiItem) {
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
    const previousTransaksi = transaksi;
    // Optimistic delete: langsung sembunyikan baris sebelum server merespon
    setTransaksi((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/transaksi/${id}`, { method: "DELETE" });

      let data;
      try {
        data = await res.json();
      } catch {
        alert("Response server tidak valid");
        setTransaksi(previousTransaksi);
        return;
      }

      if (!res.ok) {
        if (res.status === 401) {
          alert("Sesi berakhir. Silakan login ulang.");
        } else {
          alert(data.error ?? `Error ${res.status}: ${res.statusText}`);
        }
        setTransaksi(previousTransaksi);
        return;
      }

      // Ambil ulang transaksi dengan filter aktif agar data tetap konsisten
      await fetchTransaksi(currentJenis);
      router.refresh();
    } catch (err) {
      setTransaksi(previousTransaksi);
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
    // Ambil ulang transaksi lewat AJAX dengan filter aktif
    fetchTransaksi(currentJenis);
    router.refresh();
  }

  return (
    <div>
      {/* Toolbar: Kembali ke Dashboard + filter jenis + toggle urutan */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-[#1e1e1e] px-3.5 py-1 text-sm font-medium text-zinc-300 shadow-sm hover:border-indigo-500 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <svg
              className="h-3.5 w-3.5 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            <span>Kembali ke Dashboard</span>
          </Link>

          <FilterJenis
            aktif={currentJenis}
            onFilterChange={handleFilterChange}
            disabled={isLoading}
          />
        </div>

        {urutan && <ToggleUrutan current={urutan} />}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold" style={{ color: "#f0f0f0" }}>
            Riwayat Transaksi
          </h1>
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-400">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <span>Memuat...</span>
            </div>
          )}
        </div>
        <button
          onClick={handleCreate}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer"
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
          {isLoading ? "Memuat transaksi..." : "Belum ada transaksi."}
        </p>
      ) : (
        <div
          className="rounded-xl overflow-hidden transition-all duration-200"
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
            <tbody
              style={{
                opacity: isLoading ? 0.45 : 1,
                transition: "opacity 0.2s ease",
              }}
            >
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
                        className="text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
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
                        className="text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
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
          initialData={
            editingTransaksi ? (editingTransaksi as unknown as Transaksi) : undefined
          }
          onSuccess={handleFormSuccess}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

