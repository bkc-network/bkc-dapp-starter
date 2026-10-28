/**
 * The contract half: a read and two writes, in plain ethers. Nothing here is BKC-specific,
 * which is the whole claim this starter exists to demonstrate.
 */
import type { Provider } from "@bkc-network-lib/sdk";
import { useCallback, useEffect, useState } from "react";

import { COUNTER_ADDRESS, explorerAddress, explorerTx } from "../chain";
import { readableError, type ReportError } from "../errors";
import { CopyButton } from "../CopyButton";
import { readOnly, writable } from "../counter";
import type { Connection } from "../wallet";

/** What to run, in one piece, so it can be copied as one. */
const DEPLOY_COMMAND = "cd contract && npm install && npm run deploy";

const MAX_UINT256 = 2n ** 256n - 1n;

interface Props {
  provider: Provider;
  connection: Connection | null;
  onWrote: () => void;
  onError: ReportError;
}

export function Counter({ provider, connection, onWrote, onError }: Props) {
  const [value, setValue] = useState<bigint | null>(null);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState<"increment" | "set" | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  /** A read: no signing, no fee, works before anyone connects. */
  const refresh = useCallback(async () => {
    if (!COUNTER_ADDRESS) return;

    try {
      setValue((await readOnly(COUNTER_ADDRESS, provider).value()) as bigint);
    } catch (cause) {
      // Most likely a dead address: this testnet is rebuilt, and deployments die with it.
      onError(readableError(cause, `reading the contract at ${COUNTER_ADDRESS}`));
    }
  }, [provider, onError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function write(kind: "increment" | "set") {
    if (!connection) return;

    setBusy(kind);
    setHash(null);
    onError("");

    try {
      const counter = writable(COUNTER_ADDRESS, connection.signer);
      const tx = kind === "increment" ? await counter.increment() : await counter.set(BigInt(target));
      const receipt = await tx.wait();

      setHash(receipt?.hash ?? tx.hash);
      if (kind === "set") setTarget("");
      await refresh();
      onWrote();
    } catch (cause) {
      onError(readableError(cause, `calling ${kind}()`));
    } finally {
      setBusy(null);
    }
  }

  const canWrite = Boolean(connection) && busy === null;

  // `set` takes a uint256; a longer number costs the user a prompt to learn that.
  const validTarget = /^\d+$/.test(target.trim()) && BigInt(target.trim() || "0") <= MAX_UINT256;

  // Nothing to show or press until something is deployed: say what to run instead.
  if (!COUNTER_ADDRESS) {
    return (
      <section>
        <h2>Counter</h2>
        <div className="notice-inline">
          <strong>No contract yet.</strong>
          <p>Deploy one and this page picks it up on reload:</p>
          <div className="command">
            <code>{DEPLOY_COMMAND}</code>
            <CopyButton text={DEPLOY_COMMAND} label="Copy the deploy command" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2>
        Counter
        <a href={explorerAddress(COUNTER_ADDRESS)} target="_blank" rel="noreferrer">
          <span className="pill">{`${COUNTER_ADDRESS.slice(0, 8)}…`}</span>
        </a>
      </h2>

      <p className="count">{value === null ? "—" : value.toString()}</p>

      <div className="row">
        <button
          className={busy === "increment" ? "gold busy" : "gold"}
          onClick={() => write("increment")}
          disabled={!canWrite}
        >
          {busy === "increment" && <span className="spinner" aria-hidden="true" />}
          {busy === "increment" ? "Waiting for a block" : "increment()"}
        </button>

        <input
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          placeholder="10"
          inputMode="numeric"
          disabled={!canWrite}
          className="narrow"
          aria-label="New counter value"
        />

        <button
          onClick={() => write("set")}
          disabled={!canWrite || !validTarget}
          className={busy === "set" ? "busy" : undefined}
        >
          {busy === "set" && <span className="spinner" aria-hidden="true" />}
          {busy === "set" ? "Waiting for a block" : "set(n)"}
        </button>
      </div>

      {hash && (
        <p className="hint">
          <a href={explorerTx(hash)} target="_blank" rel="noreferrer">
            View transaction
          </a>
        </p>
      )}
    </section>
  );
}
