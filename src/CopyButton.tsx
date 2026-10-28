/** Copy one short string, and say so for a moment. */
import { useEffect, useRef, useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Clear on unmount: the tick is 1.6s away, and a panel can disappear before it fires.
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // The clipboard needs a secure context. Nothing to recover: the text is on screen.
    }
  }

  return (
    <button className="copy" onClick={() => void copy()} title={label} aria-label={label}>
      {copied ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="11" height="11" rx="2.5" />
          <path d="M5 15V6a2.5 2.5 0 0 1 2.5-2.5H15" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
