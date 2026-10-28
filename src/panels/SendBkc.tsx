/** A native transfer: the simplest write this chain takes. */
import { useState } from "react";

import { explorerTx } from "../chain";
import { readableError, type ReportError } from "../errors";
import { parseAmount, resolveRecipient, sendBkc } from "../send";
import type { Connection } from "../wallet";

interface Props {
  connection: Connection | null;
  onDone: () => void;
  onError: ReportError;
}

export function SendBkc({ connection, onDone, onError }: Props) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState<string | null>(null);

  const recipient = resolveRecipient(to);
  const wei = parseAmount(amount);
  const ready = Boolean(connection) && recipient !== null && wei !== null && !busy;

  async function submit() {
    if (!connection || !recipient || wei === null) return;

    setBusy(true);
    setHash(null);
    onError("");

    try {
      setHash(await sendBkc(connection.signer, recipient, wei));
      setAmount("");
      onDone();
    } catch (cause) {
      onError(readableError(cause, "sending BKC"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2>Send BKC</h2>

      <label className="field">
        <span>Recipient — either spelling of the account works</span>
        <input
          value={to}
          onChange={(event) => setTo(event.target.value)}
          placeholder="0x… or bkc1…"
          disabled={!connection || busy}
          spellCheck={false}
        />
      </label>

      <label className="field">
        <span>Amount in BKC</span>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.1"
          inputMode="decimal"
          disabled={!connection || busy}
        />
      </label>

      <div className="row">
        <button className={busy ? "gold busy" : "gold"} onClick={submit} disabled={!ready}>
          {busy && <span className="spinner" aria-hidden="true" />}
          {busy ? "Waiting for a block" : "Send"}
        </button>

        {/* say which field is wrong, but only once there is something to be wrong about */}
        {to.trim() !== "" && recipient === null && <span className="hint">Not a BKC address</span>}
        {amount.trim() !== "" && wei === null && <span className="hint">Not a positive amount</span>}
      </div>

      {hash && (
        <p className="hint">
          Sent ·{" "}
          <a href={explorerTx(hash)} target="_blank" rel="noreferrer">
            view transaction
          </a>
        </p>
      )}
    </section>
  );
}
