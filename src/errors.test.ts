import { beforeEach, describe, expect, it, vi } from "vitest";

import { readableError } from "./errors";

describe("readableError", () => {
  beforeEach(() => {
    // the function logs the original on purpose; the tests are about what the page shows
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("names a rejection as the user's own choice, not a failure", () => {
    expect(readableError(new Error('user rejected action (action="sendTransaction")'), "send")).toBe(
      "You rejected the request in your wallet.",
    );
  });

  it("explains an empty account in terms of what is missing", () => {
    expect(readableError(new Error("insufficient funds for gas * price + value"), "send")).toMatch(
      /Not enough BKC/,
    );
  });

  it("explains a sequence clash as something to wait out", () => {
    expect(readableError(new Error("account sequence mismatch, expected 7, got 6"), "send")).toMatch(
      /still in flight/,
    );
  });

  it("recognises the wallet refusing an unknown chain", () => {
    expect(readableError(new Error("There is no chain info for bkc-testnet"), "connect")).toMatch(
      /Add the BKC network/,
    );
  });

  it("recognises an unreachable node", () => {
    expect(readableError(new TypeError("Failed to fetch"), "read")).toMatch(/Could not reach the node/);
  });

  it("passes an unknown message through rather than hiding it", () => {
    expect(readableError(new Error("reverted: Counter: too large"), "write")).toBe(
      "reverted: Counter: too large",
    );
  });

  it("truncates a wall of text", () => {
    const long = readableError(new Error("x".repeat(500)), "write");

    expect(long.length).toBeLessThanOrEqual(201);
    expect(long.endsWith("…")).toBe(true);
  });

  it("survives something that is not an Error at all", () => {
    expect(readableError("plain string", "write")).toBe("plain string");
    expect(readableError(undefined, "write")).toBe("undefined");
  });

  it("logs the original, with context, for whoever has to debug it", () => {
    const cause = new Error("user rejected");
    readableError(cause, "sending BKC");

    expect(console.error).toHaveBeenCalledWith("[bkc-starter] sending BKC", cause);
  });
});
