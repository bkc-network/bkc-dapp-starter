/**
 * The only file that knows this chain is unusual, and it is one SDK call: it waits for the
 * extension, asks the node what chain this is, and returns an ordinary ethers Signer.
 */
import { connectBkcWallet, type InjectedBkcWallet, type Signer } from "@bkc-network-lib/sdk";

import { ENDPOINTS } from "./chain";

export interface Connection {
  /** EVM form, `0x…` - what the contracts see */
  readonly address: string;
  /** bech32 form of the same account - what staking and governance see */
  readonly bech32: string;
  readonly signer: Signer;
}

/** Only so a disabled button can say why. Nothing else writes `window.bkc`. */
export function walletPresent(): boolean {
  const carrier = globalThis as { bkc?: { providers?: { keplr?: InjectedBkcWallet } } };

  return Boolean(carrier.bkc?.providers?.keplr);
}

/** Prompts the user. Throws if they refuse, or if the node cannot be reached. */
export async function connect(): Promise<Connection> {
  const { account, signer } = await connectBkcWallet(ENDPOINTS);

  return { address: account.evmAddress, bech32: account.address, signer };
}
