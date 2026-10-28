require("@bkc-network-lib/hardhat");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config({ quiet: true });

/**
 * What the chain is stays here; what is yours - the key, the node - stays in .env. The
 * `bkc` block is the plugin's: a write here is a Cosmos message, so a signer needs the
 * Cosmos endpoint as well as the EVM one.
 */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // This chain predates PUSH0, and no solc defaults away from it: 0.8.24 defaults to
      // shanghai, 0.8.26 to cancun, both of which emit it. Drop this pin and the deploy
      // produces bytecode the chain cannot run, with nothing in the output saying so.
      evmVersion: "paris",
    },
  },
  // BKC is not on Sourcify, so its notice on every verify is noise.
  sourcify: { enabled: false },
  networks: {
    bkc: {
      // The defaults are the public testnet, so a fresh clone runs with no .env at all.
      url: process.env.BKC_EVM_RPC ?? "https://rpc.bkc.network",
      chainId: 262144,
      bkc: {
        cosmosRpcUrl: process.env.BKC_COSMOS_RPC ?? "https://comet-rpc.bkc.network",
        // One or the other, never both - the plugin rejects that rather than picking one.
        mnemonic: process.env.BKC_MNEMONIC,
        seed: process.env.BKC_SEED,
        explorerUrl: process.env.BKC_EXPLORER ?? "https://explorer.bkc.network",
      },
    },
  },
};
