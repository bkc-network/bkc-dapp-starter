/** Publish the source to the explorer: `hardhat verify`, plus the one retry it needs. */
const { spawnSync } = require("node:child_process");

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: npm run verify -- <address> [constructor args...]");
  console.error("The address is the one `npm run deploy` printed.");
  process.exit(1);
}

/** Runs hardhat verify, echoing what it prints and keeping a copy to read. */
function verify(extra = []) {
  const run = spawnSync("npx", ["hardhat", "verify", "--network", "bkc", ...args, ...extra], {
    encoding: "utf8",
  });

  process.stdout.write(run.stdout ?? "");
  process.stderr.write(run.stderr ?? "");
  return { status: run.status ?? 1, output: `${run.stdout ?? ""}${run.stderr ?? ""}` };
}

const first = verify();

// The explorer matches by bytecode, so a contract identical to one verified earlier is
// refused - and reported as a success, which is why the message decides here.
if (/already been verified/i.test(first.output) && !args.includes("--force")) {
  console.log("\nAnother address already carries this bytecode. Verifying this one with --force:\n");
  process.exit(verify(["--force"]).status);
}

process.exit(first.status);
