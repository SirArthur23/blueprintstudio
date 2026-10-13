import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(fileURLToPath(import.meta.url));
const exporting = process.env.BLUEPRINT_STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
if (basePath && (!basePath.startsWith("/") || basePath.endsWith("/") || basePath.includes(".."))) {
  throw new Error("NEXT_PUBLIC_BASE_PATH must be empty or a path such as /blueprintstudio without a trailing slash.");
}

const nextConfig: NextConfig = {
  typedRoutes: true,
  ...(exporting ? { output: "export", distDir: ".next-release", trailingSlash: true } : {}),
  basePath,
  turbopack: {
    root: appRoot,
  },
};

export default nextConfig;
