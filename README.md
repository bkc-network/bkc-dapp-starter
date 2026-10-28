# BKC dApp Starter

Connect a wallet, send BKC, call a contract — on **BKC**, a Cosmos SDK chain whose accounts
sign with **ML-DSA-65 (FIPS 204)** and which runs an EVM over those same accounts.

Two folders: a Hardhat project you deploy from, and a Vite + React page that talks to what
you deployed.

## Before you start

- **Node 20 or newer.**
- **[BKC Wallet](https://chromewebstore.google.com/detail/bkc-wallet/mhpnnnnnbjljknnfjpfmhlfidjjgfcei)**
  — the browser extension. No other wallet can hold an account here; see
  [the one difference](#the-one-difference).
- **[Testnet BKC](https://faucet.bkc.network)** — deploying and every write costs gas.

The chain is already the public testnet. The only value you supply is your own key.

## Quick start

```bash
git clone https://github.com/bkc-network/bkc-dapp-starter && cd bkc-dapp-starter

cd contract && npm install
npm run account:new     # prints a mnemonic, a seed and the address they share
                        # put either one in .env as BKC_MNEMONIC or BKC_SEED
                        # fund that address: https://faucet.bkc.network
npm run deploy          # deploys Counter, and writes its address to ../.env

cd .. && npm install
npm run dev             # http://localhost:3000
```

## What is inside

| Path | What it is |
| --- | --- |
| `contract/contracts/Counter.sol` | ordinary Solidity, no BKC anything |
| `contract/scripts/deploy.js` | deploy, write once, hand the address to the page |
| `src/wallet.ts` | **the only file that knows this chain is unusual** |
| `src/send.ts` | plain ethers: a native transfer and its input checks |
| `src/counter.ts` | plain ethers: an ABI and two constructors |
| `src/errors.ts` | what the chain says, turned into a sentence a person can read |
| `src/panels/` | one file per panel: Account, SendBkc, Counter |
| `src/chain.ts` | which node to talk to. That is the whole configuration |

`wallet.ts` is 15 lines of real code. Everything downstream is ethers as you already write
it, and what comes back is an ordinary Ethereum hash, receipt and event log:

```ts
const tx = await writable(COUNTER_ADDRESS, signer).increment();
const receipt = await tx.wait();
```

## The one difference

BKC accounts are ML-DSA-65 keys, **not secp256k1**. No account here can produce the ECDSA
signature an Ethereum transaction carries, and the node refuses `eth_sendRawTransaction`.

So a write travels as a Cosmos message (`/bkc.bkc.v1.MsgExecuteEvmCall`) signed with your
ML-DSA key. `@bkc-network-lib/hardhat` does that inside Hardhat's provider and
`@bkc-network-lib/sdk` behind an ethers `Signer`. Your contracts, scripts and tests do not
change.

Two consequences worth knowing before you hit them:

- **Your key is a BIP-39 mnemonic or a 32-byte seed, not a private key.** Set one of
  `BKC_MNEMONIC` or `BKC_SEED` in `contract/.env`; setting both is refused rather than
  guessed at. A secp256k1 private key is meaningless here — MetaMask cannot hold a BKC
  account, and no configuration will change that.
- **`signMessage` and `signTypedData` fail** — they want an ECDSA signature. Use the
  wallet's `signArbitrary` (ADR-36).

## Two things that will bite

**This chain predates PUSH0, so `evmVersion` is pinned to `paris`.** No current solc
defaults away from it — 0.8.24 defaults to shanghai, 0.8.26 to cancun, and both emit PUSH0.
Drop the pin in `contract/hardhat.config.js` and you deploy a contract the chain cannot run,
with nothing in the compiler output saying so.

**The testnet is rebuilt from genesis sometimes, and your deployed address dies with it.**
The gas price and the Cosmos chain id are asked of the node, so those follow a rebuild on
their own. The address does not — redeploy. `chainId` in `contract/hardhat.config.js` is the
one value written down, because `hardhat verify` needs it before any node is reachable.

## Commands

```bash
# contract/
npm run account:new     # generate a development account (no chain, no gas)
npm run doctor          # endpoints, account, balance, gas price - run this when stuck
npm run deploy          # also writes VITE_COUNTER_ADDRESS to ../.env
npm test                # deploys and writes for real: costs gas
npm run verify -- 0xYourContract

# root
npm run dev             # http://localhost:3000
npm test                # addresses, amounts, error text. No chain, under a second
npm run build
```

## When something does not work

| Symptom | Cause |
| --- | --- |
| "BKC Wallet was not detected" | extension missing, or the page loaded before it injected — reload |
| `npm run deploy` fails on balance | fund the address at the [faucet](https://faucet.bkc.network) |
| Counter reads `—` with an error naming the address | the address is dead, most likely a testnet reset. Redeploy |
| Connect fails before any wallet prompt | the node did not answer; the error names what |

`cd contract && npm run doctor` answers most of these, and every line it fails carries what
to do about it.

## Licence

MIT. See [LICENSE](LICENSE).
