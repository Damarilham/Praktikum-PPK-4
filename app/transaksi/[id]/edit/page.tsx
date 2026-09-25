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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Ubah Transaksi</h1>
      <form action={ubahTransaksi} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={transaksi.id} />
        <label className="flex flex-col gap-1 text-sm">
          <span>Jenis</span>
          <select
            name="jenis"
            required
            defaultValue={transaksi.jenis}
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
            defaultValue={transaksi.nominal}
            className="rounded-md border border-zinc-400 bg-transparent px-3 py-2 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Kategori</span>
          <input
            type="text"
            name="kategori"
            defaultValue={transaksi.kategori ?? ""}
            className="rounded-md border border-zinc-400 bg-transparent px-3 py-2 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Tanggal</span>
          <input
            type="date"
            name="tanggal"
            required
            defaultValue={formatTanggal(transaksi.tanggal)}
            className="rounded-md border border-zinc-400 bg-transparent px-3 py-2 text-base"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Deskripsi</span>
          <textarea
            name="deskripsi"
            rows={3}
            defaultValue={transaksi.deskripsi ?? ""}
            className="rounded-md border border-zinc-400 bg-transparent px-3 py-2 text-base"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-3 py-2 font-medium text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Simpan Perubahan
        </button>
      </form>
    </main>
  );
}