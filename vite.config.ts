import react from "@vitejs/plugin-react-swc";
import { defineConfig, Plugin } from "vite";
// @ts-ignore - types may not be resolved immediately after install
import { nodePolyfills } from "vite-plugin-node-polyfills";

function replaceProcessEnv(mode: string): Plugin {
  const nodeEnvRegex = /process(\.env(\.NODE_ENV)|\["env"\]\.NODE_ENV)/g;
  return {
    name: "replace-process-env",
    renderChunk(code) {
      return code.replace(nodeEnvRegex, JSON.stringify(mode));
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.REACT_EXAMPLE_APP_BASE_PATH,
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    react(),
    replaceProcessEnv(mode),
  ],
  optimizeDeps: {
    include: ["buffer"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  build: {
    commonjsOptions: {
      include: [/buffer/, /node_modules/],
    },
  },
}));
