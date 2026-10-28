/** Which node to talk to, and where to read a transaction afterwards. */

/** An empty string in a .env file is not an override, it is an unset value. */
function read(value: string | undefined, orElse: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : orElse;
}

/**
 * Two endpoints: reads are EVM JSON-RPC, a write is a Cosmos message through CometBFT.
 * Both allow this origin, so there is no dev proxy. No chain id and no gas price here -
 * the SDK asks the node, so neither goes stale when the testnet is rebuilt.
 */
export const ENDPOINTS = {
  evmRpcUrl: read(import.meta.env.VITE_BKC_EVM_RPC, "https://rpc.bkc.network"),
  cosmosRpcUrl: read(import.meta.env.VITE_BKC_COSMOS_RPC, "https://comet-rpc.bkc.network"),
};

/** No node reports this one. Edit it to point at your own explorer. */
const EXPLORER_URL = "https://explorer.bkc.network";

/** Where to send someone who has no wallet, or no BKC to pay with. */
export const WALLET_URL =
  "https://chromewebstore.google.com/detail/bkc-wallet/mhpnnnnnbjljknnfjpfmhlfidjjgfcei";
export const FAUCET_URL = "https://faucet.bkc.network";

/** Empty until `cd contract && npm run deploy` writes it to .env. */
export const COUNTER_ADDRESS = import.meta.env.VITE_COUNTER_ADDRESS?.trim() ?? "";

export function explorerTx(hash: string): string {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function explorerAddress(address: string): string {
  return `${EXPLORER_URL}/address/${address}`;
}
