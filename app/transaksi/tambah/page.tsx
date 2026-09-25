import { tambahTransaksi } from "@/lib/actions/transaksi-tambah";

export default function TambahTransaksiPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Tambah Transaksi</h1>
        <p className="mt-1 text-sm text-zinc-500">Catat pemasukan atau pengeluaranmu</p>
        <form action={tambahTransaksi} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            <span>Jenis</span>
            <select
              name="jenis"
              required
              defaultValue="PENGELUARAN"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="PEMASUKAN">Pemasukan</option>
              <option value="PENGELUARAN">Pengeluaran</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            <span>Nominal</span>
            <input
              type="number"
              name="nominal"
              required
              min={1}
              step={1}
              placeholder="mis. 50000"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            <span>Kategori</span>
            <input
              type="text"
              name="kategori"
              placeholder="mis. Makanan, Transportasi"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            <span>Tanggal</span>
            <input
              type="date"
              name="tanggal"
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            <span>Deskripsi</span>
            <textarea
              name="deskripsi"
              rows={3}
              placeholder="Opsional"
              className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            Simpan Transaksi
          </button>
        </form>
      </div>
    </main>
  );
}