/** The contract from the page's side: ethers, exactly as on any EVM chain. */
import { Contract, type Provider, type Signer } from "@bkc-network-lib/sdk";

/**
 * Hand-written: contract/artifacts/ is a build output and gitignored, so a fresh clone has
 * none. Add a function to Counter.sol, add its line here.
 */
export const COUNTER_ABI = [
  "function value() view returns (uint256)",
  "function increment()",
  "function set(uint256 newValue)",
  "event Changed(uint256 value, address by)",
] as const;

export function readOnly(address: string, provider: Provider): Contract {
  return new Contract(address, COUNTER_ABI, provider);
}

export function writable(address: string, signer: Signer): Contract {
  return new Contract(address, COUNTER_ABI, signer);
}
