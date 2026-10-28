/** Who is connected, in both of the spellings this chain gives an account. */
import { explorerAddress, FAUCET_URL, WALLET_URL } from "../chain";
import type { Connection } from "../wallet";

/** Short enough to fit a line, long enough to compare against a wallet. */
function short(address: string): string {
  return `${address.slice(0, 10)}…${address.slice(-8)}`;
}

interface Props {
  connection: Connection | null;
  balance: string | null;
  hasWallet: boolean;
  busy: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function Account({ connection, balance, hasWallet, busy, onConnect, onDisconnect }: Props) {
  return (
    <section>
      <h2>
        Account
        {connection && <span className="pill live">Connected</span>}
      </h2>

      {connection ? (
        <>
          <dl>
            <dt>Balance</dt>
            <dd className="balance">{balance === null ? "…" : `${Number(balance).toFixed(4)} BKC`}</dd>

            <dt>EVM</dt>
            <dd>
              <a href={explorerAddress(connection.address)} target="_blank" rel="noreferrer">
                {short(connection.address)}
              </a>
            </dd>

            <dt>Bech32</dt>
            <dd>{short(connection.bech32)}</dd>
          </dl>

          {/* An empty account can do nothing else here, so say where to fix it. */}
          {balance !== null && Number(balance) === 0 && (
            <p className="hint">
              <a href={FAUCET_URL} target="_blank" rel="noreferrer">
                Get testnet BKC
              </a>{" "}
              — every write costs gas.
            </p>
          )}

          <p className="hint">
            <button className="ghost" onClick={onDisconnect}>
              Disconnect
            </button>
          </p>
        </>
      ) : (
        <>
          <button onClick={onConnect} disabled={busy || !hasWallet} className={busy ? "busy" : undefined}>
            {busy && <span className="spinner" aria-hidden="true" />}
            {busy ? "Waiting for the wallet" : "Connect wallet"}
          </button>

          {!hasWallet && (
            <p className="hint">
              BKC Wallet was not detected.{" "}
              <a href={WALLET_URL} target="_blank" rel="noreferrer">
                Install the extension
              </a>{" "}
              and reload — no other wallet can hold an account here, because BKC signs with
              ML-DSA-65 and has no secp256k1 key.
            </p>
          )}
        </>
      )}
    </section>
  );
}
