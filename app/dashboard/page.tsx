import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/services/auth";
import LogoutButton from "@/components/auth/LogoutButton";

// PLACEHOLDER — ganti dengan dashboard sungguhan (FR-04, tugas P2).
// Cuma dipakai P1 untuk memastikan alur register/login/session/logout jalan.
export default async function DashboardPlaceholderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-xl font-semibold">Halo, {user.nama} 👋</h1>
      <p className="text-sm text-gray-500">{user.email}</p>
      <p className="text-sm text-gray-500">
        Ini halaman dashboard placeholder — auth sudah jalan kalau kamu bisa
        lihat halaman ini setelah login.
      </p>
      <LogoutButton />
    </div>
  );
}
