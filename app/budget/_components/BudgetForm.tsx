"use client";

import { useState } from "react";

type Mode = "create" | "edit";

type BudgetData = {
  id: number;
  nama: string;
  bulan: number;
  tahun: number;
  nominal: number;
};

type Props = {
  mode: Mode;
  // Bulan & tahun awal (dari halaman) untuk mode create
  bulan: number;
  tahun: number;
  // Data anggaran yang diubah, hanya dipakai di mode edit
  initialData?: BudgetData;
  // Dipanggil setelah berhasil menyimpan, membawa bulan & tahun yang disimpan
  onSuccess: (bulan: number, tahun: number) => void;
  onClose: () => void;
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

export default function BudgetForm({
  mode,
  bulan,
  tahun,
  initialData,
  onSuccess,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    nama: initialData?.nama ?? "",
    bulan: String(initialData?.bulan ?? bulan),
    tahun: String(initialData?.tahun ?? tahun),
    nominal: initialData ? String(initialData.nominal) : "",
  });

  // Validasi sisi client (validasi utama tetap di server dengan Zod)
  function validate() {
    const newErrors: Record<string, string> = {};

    if (formData.nama.trim() === "") {
      newErrors.nama = "Nama anggaran wajib diisi";
    } else if (formData.nama.length > 50) {
      newErrors.nama = "Nama anggaran maksimal 50 karakter";
    }

    const bulanNum = Number(formData.bulan);
    if (!Number.isInteger(bulanNum) || bulanNum < 1 || bulanNum > 12) {
      newErrors.bulan = "Bulan harus antara 1 sampai 12";
    }

    const tahunNum = Number(formData.tahun);
    if (formData.tahun === "" || !Number.isInteger(tahunNum)) {
      newErrors.tahun = "Tahun wajib diisi";
    }

    const nominalNum = Number(formData.nominal);
    if (formData.nominal === "" || isNaN(nominalNum)) {
      newErrors.nominal = "Nominal wajib diisi";
    } else if (!Number.isInteger(nominalNum)) {
      newErrors.nominal = "Nominal harus bilangan bulat";
    } else if (nominalNum <= 0) {
      newErrors.nominal = "Nominal harus lebih dari 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Mode edit hanya mengirim nominal, mode create mengirim nama + bulan + tahun + nominal
      const payload =
        mode === "create"
          ? {
              nama: formData.nama.trim(),
              bulan: Number(formData.bulan),
              tahun: Number(formData.tahun),
              nominal: Number(formData.nominal),
            }
          : { nominal: Number(formData.nominal) };

      const url =
        mode === "create" ? "/api/budget" : `/api/budget/${initialData!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setErrors({ form: "Response server tidak valid" });
        return;
      }

      if (!res.ok) {
        if (res.status === 401) {
          setErrors({ form: "Sesi berakhir. Silakan login ulang." });
          return;
        }
        if (data.details?.fieldErrors) {
          const fieldErrors: Record<string, string> = {};
          for (const [key, val] of Object.entries(data.details.fieldErrors)) {
            fieldErrors[key] = (val as string[]).join(", ");
          }
          setErrors(fieldErrors);
        } else {
          setErrors({
            form: data.error ?? `Error ${res.status}: ${res.statusText}`,
          });
        }
        return;
      }

      onSuccess(data.data.bulan, data.data.tahun);
      onClose();
    } catch (err) {
      if (err instanceof TypeError) {
        setErrors({ form: "Terjadi kesalahan jaringan. Periksa koneksi Anda." });
      } else {
        console.error("Unexpected error:", err);
        setErrors({ form: "Terjadi kesalahan tak terduga" });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500";
  const labelClass =
    "mb-1 block text-sm font-medium text-gray-700 dark:text-zinc-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-zinc-100">
          {mode === "create" ? "Set Anggaran" : "Ubah Anggaran"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nama" className={labelClass}>
              Nama Anggaran <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              disabled={mode === "edit"}
              maxLength={50}
              placeholder="Contoh: Makan, Transport, Hiburan"
              className={inputClass}
            />
            {errors.nama && (
              <p className="mt-1 text-sm text-red-500">{errors.nama}</p>
            )}
          </div>

          <div>
            <label htmlFor="bulan" className={labelClass}>
              Bulan <span className="text-red-500">*</span>
            </label>
            <select
              id="bulan"
              name="bulan"
              value={formData.bulan}
              onChange={handleChange}
              disabled={mode === "edit"}
              className={inputClass}
            >
              {NAMA_BULAN.map((nama, index) => (
                <option key={nama} value={index + 1}>
                  {nama}
                </option>
              ))}
            </select>
            {errors.bulan && (
              <p className="mt-1 text-sm text-red-500">{errors.bulan}</p>
            )}
          </div>

          <div>
            <label htmlFor="tahun" className={labelClass}>
              Tahun <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="tahun"
              name="tahun"
              value={formData.tahun}
              onChange={handleChange}
              disabled={mode === "edit"}
              min="2000"
              max="2100"
              step="1"
              className={inputClass}
            />
            {errors.tahun && (
              <p className="mt-1 text-sm text-red-500">{errors.tahun}</p>
            )}
          </div>

          <div>
            <label htmlFor="nominal" className={labelClass}>
              Nominal Anggaran <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="nominal"
              name="nominal"
              value={formData.nominal}
              onChange={handleChange}
              min="1"
              step="1"
              placeholder="Contoh: 1500000"
              className={inputClass}
            />
            {errors.nominal && (
              <p className="mt-1 text-sm text-red-500">{errors.nominal}</p>
            )}
          </div>

          {errors.form && (
            <p className="text-center text-sm text-red-500">{errors.form}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {loading ? "Menyimpan..." : mode === "create" ? "Simpan" : "Perbarui"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}