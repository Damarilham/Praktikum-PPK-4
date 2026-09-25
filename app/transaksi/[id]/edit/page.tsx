import { notFound } from "next/navigation";
import { getCurrentUser, getPrisma } from "@/lib/actions/transaksi-tambah";
import { ubahTransaksi } from "@/lib/actions/transaksi-ubah";

function formatTanggal(tanggal: Date): string {
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
  const hari = String(tanggal.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

export default async function EditTransaksiPage(props: PageProps<"/transaksi/[id]/edit">) {
  const { id } = await props.params;

  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  const transaksiId = Number(id);
  if (!Number.isInteger(transaksiId) || transaksiId <= 0) {
    notFound();
  }

  const transaksi = await getPrisma().transaksi.findFirst({
    where: { id: transaksiId, userId: user.id },
  });

  if (!transaksi) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Ubah Transaksi</h1>
        <p className="mt-1 text-sm text-zinc-500">Perbarui detail transaksi milikmu</p>
        <form action={ubahTransaksi} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="id" value={transaksi.id} />
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            <span>Jenis</span>
            <select
              name="jenis"
              required
              defaultValue={transaksi.jenis}
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
              defaultValue={transaksi.nominal}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            <span>Kategori</span>
            <input
              type="text"
              name="kategori"
              defaultValue={transaksi.kategori ?? ""}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            <span>Tanggal</span>
            <input
              type="date"
              name="tanggal"
              required
              defaultValue={formatTanggal(transaksi.tanggal)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            <span>Deskripsi</span>
            <textarea
              name="deskripsi"
              rows={3}
              defaultValue={transaksi.deskripsi ?? ""}
              className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            Simpan Perubahan
          </button>
        </form>
      </div>
    </main>
  );
}