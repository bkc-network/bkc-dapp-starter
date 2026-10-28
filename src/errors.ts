/** How a panel reports a failure upwards. `""` clears; only one message shows at a time. */
export type ReportError = (message: string) => void;

/**
 * What the chain says, turned into one sentence a person can read. Pure, so it tests
 * without a browser; the original goes to the console for whoever has to fix it.
 */
export function readableError(error: unknown, context: string): string {
  console.error(`[bkc-starter] ${context}`, error);

  const message = (error as Error)?.message ?? String(error);

  if (/user rejected|request rejected|denied|declined/i.test(message)) {
    return "You rejected the request in your wallet.";
  }
  if (/insufficient funds|insufficient balance/i.test(message)) {
    return "Not enough BKC to cover the amount and the fee.";
  }
  // Two writes from one account cannot be in flight: the second is rejected.
  if (/sequence|account sequence mismatch/i.test(message)) {
    return "Another transaction from this account is still in flight. Wait a moment and try again.";
  }
  if (/no chain info for/i.test(message)) {
    return "Your wallet does not know this chain. Add the BKC network to it and reload.";
  }
  if (/failed to fetch|fetch failed|network error|ECONNREFUSED/i.test(message)) {
    return "Could not reach the node. Check your connection, or the endpoints in src/chain.ts.";
  }
  if (/BKC Wallet was not found|no bkc wallet/i.test(message)) {
    return "BKC Wallet was not found. Install the extension and reload.";
  }

  // An unknown error still reaches the page: truncated beats generic.
  return message.length > 200 ? `${message.slice(0, 200)}…` : message;
}
