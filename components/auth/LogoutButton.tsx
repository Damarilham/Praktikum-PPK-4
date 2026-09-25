"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton({
  className = "rounded-md border px-3 py-1.5 text-sm font-medium",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleLogout} disabled={loading} className={className}>
      {loading ? "Keluar..." : "Logout"}
    </button>
  );
}
