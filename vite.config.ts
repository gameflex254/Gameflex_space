/**
 * Vendor-neutral Vite config.
 *
 * No hosting-platform wrapper: plugins are declared explicitly so the app can
 * be built and deployed anywhere (Cloudflare, Node, Vercel, Netlify, a VPS).
 *
 * Env knobs:
 *   PORT             dev/preview port (default 8080)
 *   HOST             dev/preview host (default 0.0.0.0)
 *   NITRO_PRESET     deployment target for the server build (default cloudflare_module)
 */
import { fileURLToPath } from "node:url";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env["PORT"] ?? 8080);
  const host = env["HOST"] ?? "0.0.0.0";
  // Nitro only participates in the production build; `vite dev` runs the
  // framework's own SSR dev server.
  const isBuild = command === "build";

  return {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
      dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
    },
    server: { port, host },
    preview: { port, host },
    build: {
      sourcemap: false,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
              return "react-vendor";
            }
            if (id.includes("@tanstack/react-router") || id.includes("@tanstack/react-query")) {
              return "router-vendor";
            }
            if (
              id.includes("@radix-ui") ||
              id.includes("lucide-react") ||
              id.includes("cmdk") ||
              id.includes("vaul") ||
              id.includes("sonner")
            ) {
              return "ui-vendor";
            }
            if (id.includes("@supabase/supabase-js") || id.includes("@supabase/server")) {
              return "supabase-vendor";
            }
            if (id.includes("recharts")) {
              return "chart-vendor";
            }
            if (id.includes("framer-motion")) {
              return "motion-vendor";
            }
            return undefined;
          },
        },
      },
    },
    plugins: [
      tailwindcss(),
      tanstackStart({
        // Route the built server entry through src/server.ts (SSR error wrapper).
        server: { entry: "server" },
      }),
      viteReact(),
      ...(isBuild
        ? nitro({
            preset: env["NITRO_PRESET"] ?? "cloudflare-module",
            // Emit a conventional build layout: static client assets in
            // dist/client, the server bundle in dist/server.
            output: {
              dir: env["BUILD_OUTPUT_DIR"] ?? "dist",
              serverDir: "{{ output.dir }}/server",
              publicDir: "{{ output.dir }}/client",
            },
            cloudflare: { nodeCompat: true, deployConfig: true },
          })
        : []),
    ],
  };
});
