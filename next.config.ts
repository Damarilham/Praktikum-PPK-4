import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Next.js dev server memblokir request JS/data internal kalau origin
  // browser tidak dikenal -> React gagal hydrate -> form jatuh ke submit
  // HTML biasa (ini penyebab bug login/register sebelumnya).
  // Tambahkan IP LAN agar akses via URL Network (http://192.168.x.x:3000)
  // tidak diblokir Next.js dev server. Kalau IP laptop berubah (DHCP),
  // tambahkan IP baru di sini lalu restart dev server.
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.1.10"],
};

export default nextConfig;
