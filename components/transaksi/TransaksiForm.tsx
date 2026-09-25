"use client";

import { useState } from "react";
import type { JenisTransaksi, Transaksi } from "@/app/generated/prisma/client";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  initialData?: Transaksi;
  onSuccess: () => void;
  onClose: () => void;
};

const JENIS_OPTIONS: { value: JenisTransaksi; label: string }[] = [
  { value: "PEMASUKAN", label: "Pemasukan" },
  { value: "PENGELUARAN", label: "Pengeluaran" },
];

export default function TransaksiForm({
  mode,
  initialData,
  onSuccess,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    jenis: (initialData?.jenis ?? "PENGELUARAN") as JenisTransaksi,
    nominal: initialData?.nominal ?? "",
    kategori: initialData?.kategori ?? "",
    deskripsi: initialData?.deskripsi ?? "",
    tanggal: initialData
      ? new Date(initialData.tanggal).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  });

  function validate() {
    const newErrors: Record<string, string> = {};

    if (!formData.jenis) {
      newErrors.jenis = "Jenis wajib dipilih";
    }

    const nominalNum = Number(formData.nominal);
    if (formData.nominal === "" || isNaN(nominalNum)) {
      newErrors.nominal = "Nominal wajib diisi";
    } else if (nominalNum < 0) {
      newErrors.nominal = "Nominal tidak boleh negatif";
    } else if (!Number.isInteger(nominalNum)) {
      newErrors.nominal = "Nominal harus bilangan bulat";
    }

    if (!formData.tanggal) {
      newErrors.tanggal = "Tanggal wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        jenis: formData.jenis,
        nominal: Number(formData.nominal),
        kategori: formData.kategori || null,
        deskripsi: formData.deskripsi || null,
        tanggal: new Date(formData.tanggal).toISOString(),
      };

      const url = mode === "create" ? "/api/transaksi" : `/api/transaksi/${initialData!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details?.fieldErrors) {
          const fieldErrors: Record<string, string> = {};
          for (const [key, val] of Object.entries(data.details.fieldErrors)) {
            fieldErrors[key] = (val as string[]).join(", ");
          }
          setErrors(fieldErrors);
        } else {
          setErrors({ form: data.error ?? "Terjadi kesalahan" });
        }
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setErrors({ form: "Terjadi kesalahan jaringan" });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {mode === "create" ? "Tambah Transaksi" : "Edit Transaksi"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="jenis" className="block text-sm font-medium text-gray-700 mb-1">
              Jenis <span className="text-red-500">*</span>
            </label>
            <select
              id="jenis"
              name="jenis"
              value={formData.jenis}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {JENIS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.jenis && (
              <p className="mt-1 text-sm text-red-600">{errors.jenis}</p>
            )}
          </div>

          <div>
            <label htmlFor="nominal" className="block text-sm font-medium text-gray-700 mb-1">
              Nominal <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="nominal"
              name="nominal"
              value={formData.nominal}
              onChange={handleChange}
              min="0"
              step="1"
              placeholder="Contoh: 50000"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.nominal && (
              <p className="mt-1 text-sm text-red-600">{errors.nominal}</p>
            )}
          </div>

          <div>
            <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="tanggal"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.tanggal && (
              <p className="mt-1 text-sm text-red-600">{errors.tanggal}</p>
            )}
          </div>

          <div>
            <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <input
              type="text"
              id="kategori"
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              placeholder="Contoh: Makanan, Transport, dll"
              maxLength={100}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              placeholder="Catatan tambahan..."
              maxLength={500}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {errors.form && (
            <p className="text-sm text-red-600 text-center">{errors.form}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : mode === "create" ? "Tambah" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}