/**
 * Generate a development account: a mnemonic and the seed it derives, two spellings of one
 * account. Put either in .env. The mnemonic is the one worth keeping - a wallet imports it.
 */
const { DirectMldsa65HdWallet, DirectMldsa65Wallet, toEvmAddress } = require("@bkc-network-lib/sdk");
const { stringToPath } = require("@bkc-network-lib/crypto");

/** The path the Hardhat plugin derives with. */
const HD_PATH = "m/44'/118'/0'/0/0";
const PREFIX = "bkc";

async function main() {
  const path = stringToPath(HD_PATH);
  const wallet = await DirectMldsa65HdWallet.generate(24, { prefix: PREFIX, hdPaths: [path] });
  const [account] = await wallet.getAccounts();
  const seed = Buffer.from(await wallet.deriveMldsaSeed(path)).toString("hex");

  const [flat] = await (await DirectMldsa65Wallet.fromSeed(Buffer.from(seed, "hex"), PREFIX)).getAccounts();
  if (flat.address !== account.address) {
    throw new Error("the mnemonic and the seed derived different accounts - do not use either");
  }

  console.log(`mnemonic  ${wallet.mnemonic}`);
  console.log(`seed      ${seed}`);
  console.log(`path      ${HD_PATH}`);
  console.log(`account   ${account.address}`);
  console.log(`          ${toEvmAddress(account.address)}`);
  console.log("\nPut BKC_MNEMONIC or BKC_SEED in .env - either one reaches this account.");
  console.log("Fund the address before deploying: https://faucet.bkc.network");
  console.log("This is a development key printed to a terminal. Do not hold anything of value with it.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
