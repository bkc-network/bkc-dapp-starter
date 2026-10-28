/**
 * These tests run against the real chain - there is no local BKC node to spin up, because
 * a write needs the Cosmos side of a real one. Each `npm test` therefore deploys and
 * spends gas, and takes seconds rather than milliseconds.
 */
const assert = require("node:assert/strict");
const hre = require("hardhat");

describe("Counter", function () {
  // A write settles through Cosmos consensus, so the default 2s mocha timeout is far too
  // short - an ML-DSA signature is 3.3 KB and blocks are about a second apart.
  this.timeout(180000);

  let counter;

  before(async () => {
    counter = await (await hre.ethers.getContractFactory("Counter")).deploy();
    await counter.waitForDeployment();
  });

  it("starts at zero", async () => {
    assert.equal(await counter.value(), 0n);
  });

  it("counts up", async () => {
    await (await counter.increment()).wait();
    assert.equal(await counter.value(), 1n);
  });

  it("emits who changed it", async () => {
    const [signer] = await hre.ethers.getSigners();
    const receipt = await (await counter.set(41n)).wait();
    const logs = await counter.queryFilter(
      counter.filters.Changed(),
      receipt.blockNumber,
      receipt.blockNumber,
    );

    assert.equal(logs[0].args[0], 41n);
    assert.equal(logs[0].args[1], await signer.getAddress());
  });
});
