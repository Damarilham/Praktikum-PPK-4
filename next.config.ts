import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Next.js dev server memblokir request JS/data internal kalau origin
  // browser tidak dikenal -> React gagal hydrate -> form jatuh ke submit
  // HTML biasa (ini penyebab bug login/register sebelumnya).
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

export default nextConfig;
