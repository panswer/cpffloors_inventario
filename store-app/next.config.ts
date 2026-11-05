import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose"],
  webpack: (config, { dev }) => {
    if (dev || isDev) {
      config.watchOptions = {
        // Habilita sondeo (polling) para detectar cambios en volúmenes compartidos (Windows <-> Docker)
        poll: 1000,
        aggregateTimeout: 300,
        // Ignora carpetas pesadas y logs para evitar loops o sobrecarga
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/logs/**",
          "**/*.log",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
