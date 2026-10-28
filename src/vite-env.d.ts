/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Written by `cd contract && npm run deploy`. The one value this app needs. */
  readonly VITE_COUNTER_ADDRESS?: string;
  /** Default to the public testnet; set to point at another node. */
  readonly VITE_BKC_EVM_RPC?: string;
  readonly VITE_BKC_COSMOS_RPC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
