import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    /*
     * The pure half only: address parsing, amount parsing, and turning a chain error into a
     * sentence. They need no chain, no browser and no wallet, so they run in under a second
     * and a contributor can run them before they have a funded account.
     *
     * Everything that talks to the chain is covered by actually using it - `contract/`'s
     * `npm test` deploys and writes for real.
     */
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
