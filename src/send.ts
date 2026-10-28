/** A native transfer: ordinary ethers, plus the checks that keep the button honest. */
import { isAddress, parseEther, type Signer, tryToEvmAddress } from "@bkc-network-lib/sdk";

/** An account has two spellings; a user pastes either. Returns the EVM form, or null. */
export function resolveRecipient(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  return isAddress(trimmed) ? trimmed : tryToEvmAddress(trimmed);
}

/** Rejects what `parseEther` would throw on, so the button stays disabled instead. */
export function parseAmount(input: string): bigint | null {
  const trimmed = input.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;

  try {
    const wei = parseEther(trimmed);
    return wei > 0n ? wei : null;
  } catch {
    return null;
  }
}

/** Signs, broadcasts, waits for the block. Returns the transaction hash. */
export async function sendBkc(signer: Signer, to: string, wei: bigint): Promise<string> {
  const tx = await signer.sendTransaction({ to, value: wei });
  const receipt = await tx.wait();

  return receipt?.hash ?? tx.hash;
}
