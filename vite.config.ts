import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, Plugin } from "vite";

const proxyPlugin: Plugin = {
  name: "dev-image-proxy",
  configureServer(server) {
    server.middlewares.use("/proxy", async (req, res) => {
      try {
        const urlObj = new URL(req.url || "", "http://localhost");
        const target = urlObj.searchParams.get("url");
        if (!target) {
          res.statusCode = 400;
          res.end("Missing url param");
          return;
        }

        const upstream = await fetch(target);
        res.statusCode = upstream.status;
        // Pass through content-type if present
        const contentType = upstream.headers.get("content-type");
        if (contentType) {
          res.setHeader("Content-Type", contentType);
        }
        // Allow browser to consume the resource cross-origin in dev
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "no-cache");

        const arrayBuffer = await upstream.arrayBuffer();
        res.end(Buffer.from(arrayBuffer));
      } catch (err: any) {
        res.statusCode = 502;
        res.end(`Proxy error: ${err?.message || "unknown"}`);
      }
    });
  },
};

export default defineConfig({
  plugins: [react(), proxyPlugin],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
