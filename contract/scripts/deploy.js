/**
 * Deploy Counter, write to it once, and hand the address to the web app by writing
 * ../.env - inside this repository, never a sibling checkout. Vite reads it on reload,
 * so nobody copies a hex string between two folders.
 */
const fs = require("node:fs");
const path = require("node:path");
const hre = require("hardhat");

/** The variable the web app reads, and the file it reads it from (one directory up). */
const ADDRESS_KEY = "VITE_COUNTER_ADDRESS";
const envPath = path.resolve(__dirname, "../../.env");

/**
 * Set one key in .env without touching the others. Rewritten rather than appended, or
 * deploying twice leaves two lines and parse order decides the winner.
 */
function writeAddress(address) {
  const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const kept = existing
    .split("\n")
    .filter((line) => !line.startsWith(`${ADDRESS_KEY}=`))
    .join("\n")
    .trim();

  const body = [kept, `${ADDRESS_KEY}=${address}`].filter(Boolean).join("\n");
  fs.writeFileSync(envPath, `${body}\n`);
}

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log(`deploying from  ${await signer.getAddress()}`);

  const counter = await (await hre.ethers.getContractFactory("Counter")).deploy();
  await counter.waitForDeployment();
  const address = await counter.getAddress();
  console.log(`Counter         ${address}`);

  const receipt = await (await counter.increment()).wait();
  console.log(`increment()     ${receipt.hash}`);
  console.log(`value           ${await counter.value()}`);

  writeAddress(address);
  console.log(`\nwrote ${ADDRESS_KEY} to ../.env - the web app will use it on reload`);
  console.log(`next: npm run verify -- ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
