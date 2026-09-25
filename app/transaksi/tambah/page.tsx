import { tambahTransaksi } from "@/lib/actions/transaksi-tambah";

export default function TambahTransaksiPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Tambah Transaksi</h1>
      <form action={tambahTransaksi} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>Jenis</span>
          <select
            name="jenis"
            required
            defaultValue="PENGELUARAN"
            className="rounded-md border border-zinc-400 bg-transparent px-3 py-2 text-base"
          >
            <option value="PEMASUKAN">Pemasukan</option>
            <option value="PENGELUARAN">Pengeluaran</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Nominal</span>
          <input
            type="number"
            name="nominal"
            required
            min={1}
            step={1}
            placeholder="mis. 50000"
            className="rounded-md border border-zinc-400 bg-transparent px-3 py-2 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Kategori</span>
          <input
            type="text"
            name="kategori"
            placeholder="mis. Makanan, Transportasi"
            className="rounded-md border border-zinc-400 bg-transparent px-3 py-2 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Tanggal</span>
          <input
            type="date"
            name="tanggal"
            required
            className="rounded-md border border-zinc-400 bg-transparent px-3 py-2 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Deskripsi</span>
          <textarea
            name="deskripsi"
            rows={3}
            placeholder="Opsional"
            className="rounded-md border border-zinc-400 bg-transparent px-3 py-2 text-base"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-3 py-2 font-medium text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Simpan Transaksi
        </button>
      </form>
    </main>
  );
}