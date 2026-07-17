import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* As fotos das OS ficam em um store PRIVADO e são servidas pela rota
     autenticada /api/os-fotos/[id] — não precisam de remotePatterns. */
};

export default nextConfig;
