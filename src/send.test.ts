import { describe, expect, it } from "vitest";

import { parseAmount, resolveRecipient } from "./send";

/** Two spellings of one account, derived from a throwaway seed. Nobody holds it. */
const EVM = "0x83EE80FCbcaF4872Ed023E55Cb10D7a2b4F1336A";
const BECH32 = "bkc1s0hgpl9u4ay89mgz8e2ukyxh5260zvm2c6f3gu";

describe("resolveRecipient", () => {
  it("takes the EVM spelling unchanged", () => {
    expect(resolveRecipient(EVM)).toBe(EVM);
  });

  it("takes the bech32 spelling of the same account and returns the EVM one", () => {
    expect(resolveRecipient(BECH32)?.toLowerCase()).toBe(EVM.toLowerCase());
  });

  it("ignores surrounding whitespace, because pasting brings it along", () => {
    expect(resolveRecipient(`  ${EVM}  `)).toBe(EVM);
  });

  it("rejects an address from another chain", () => {
    expect(resolveRecipient("cosmos1y96c5wjespw343ajek8lhtg84zsuduqtkdmrpz")).toBeNull();
  });

  it("rejects a truncated address rather than guessing", () => {
    expect(resolveRecipient(EVM.slice(0, -2))).toBeNull();
  });

  it("rejects nothing at all", () => {
    expect(resolveRecipient("")).toBeNull();
    expect(resolveRecipient("   ")).toBeNull();
  });
});

describe("parseAmount", () => {
  it("reads whole and fractional BKC as wei", () => {
    expect(parseAmount("1")).toBe(10n ** 18n);
    expect(parseAmount("0.5")).toBe(5n * 10n ** 17n);
  });

  it("keeps all 18 decimals", () => {
    expect(parseAmount("0.000000000000000001")).toBe(1n);
  });

  it("rejects zero, which would be a transaction that moves nothing", () => {
    expect(parseAmount("0")).toBeNull();
    expect(parseAmount("0.0")).toBeNull();
  });

  it("rejects what is not a positive decimal", () => {
    expect(parseAmount("-1")).toBeNull();
    expect(parseAmount("1e18")).toBeNull();
    expect(parseAmount("abc")).toBeNull();
    expect(parseAmount("")).toBeNull();
  });

  it("rejects more precision than the denom has, instead of throwing", () => {
    expect(parseAmount("0.0000000000000000001")).toBeNull();
  });
});
