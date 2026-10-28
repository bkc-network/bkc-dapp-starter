import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * No `global` shim, unlike the BKC exchange front end: the SDK's global lookup finds `self`,
 * which a browser always has. Add one back only if this app gains server-side rendering.
 */
export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
});
