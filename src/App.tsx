/** The shell: what the three panels share, and nothing else. */
import { bkcReader, formatEther } from "@bkc-network-lib/sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ENDPOINTS } from "./chain";
import { readableError } from "./errors";
import { Account } from "./panels/Account";
import { Counter } from "./panels/Counter";
import { SendBkc } from "./panels/SendBkc";
import { type Connection, connect, walletPresent } from "./wallet";

/** That the user connected here before - a flag, never a key. */
const AUTOCONNECT = "bkc-starter.autoconnect";

export default function App() {
  // Also warms the chain lookup, so pressing Connect later does not wait on the network.
  const provider = useMemo(() => bkcReader(ENDPOINTS), []);

  const [hasWallet, setHasWallet] = useState(walletPresent());
  const [connection, setConnection] = useState<Connection | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  // The extension injects itself on load, and sometimes a beat after it.
  useEffect(() => {
    if (hasWallet) return;

    const timer = setInterval(() => setHasWallet(walletPresent()), 500);
    const stop = setTimeout(() => clearInterval(timer), 8000);

    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [hasWallet]);

  const refreshBalance = useCallback(
    async (address: string) => setBalance(formatEther(await provider.getBalance(address))),
    [provider],
  );

  const onConnect = useCallback(
    async (silent = false) => {
      setConnecting(true);
      if (!silent) setError("");

      try {
        const next = await connect();
        setConnection(next);
        localStorage.setItem(AUTOCONNECT, "1");
        await refreshBalance(next.address);
      } catch (cause) {
        // A reconnect nobody asked for should not shout, nor retry every load.
        if (silent) localStorage.removeItem(AUTOCONNECT);
        else setError(readableError(cause, "connecting the wallet"));
      } finally {
        setConnecting(false);
      }
    },
    [refreshBalance],
  );

  /** Reconnect after a reload, once: the extension injects a beat after the page. */
  const reconnected = useRef(false);
  useEffect(() => {
    if (reconnected.current || !hasWallet || connection) return;
    if (localStorage.getItem(AUTOCONNECT) !== "1") return;

    reconnected.current = true;
    void onConnect(true);
  }, [hasWallet, connection, onConnect]);

  /** Every write moves the balance, so each panel says when it has made one. */
  const onWrote = useCallback(() => {
    if (connection) void refreshBalance(connection.address);
  }, [connection, refreshBalance]);

  return (
    <main>
      <header>
        <img src="/bkc-logo.png" alt="BKC" />
        <div>
          <h1>dApp Starter</h1>
          <p>Connect a wallet, send BKC, call a contract. Signed with ML-DSA-65.</p>
        </div>
      </header>

      <Account
        connection={connection}
        balance={balance}
        hasWallet={hasWallet}
        busy={connecting}
        onConnect={() => void onConnect()}
        onDisconnect={() => {
          localStorage.removeItem(AUTOCONNECT);
          setConnection(null);
          setBalance(null);
        }}
      />

      <SendBkc connection={connection} onDone={onWrote} onError={setError} />

      <Counter provider={provider} connection={connection} onWrote={onWrote} onError={setError} />

      {/* polite: a message that appears while the user is mid-task should not interrupt */}
      <div aria-live="polite">{error && <section className="error">{error}</section>}</div>
    </main>
  );
}
