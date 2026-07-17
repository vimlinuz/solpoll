"use client";
import { useState, useMemo, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useWalletConnection } from "@solana/react-hooks";

function truncate(address: string) {
  return `${address.slice(0, 4)}\u2026${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const {
    connect,
    connected,
    connecting,
    connectors,
    disconnect,
    wallet,
  } = useWalletConnection();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const picker = useMemo(
    () => {
      const supported = connectors.filter((c) => c.isSupported());
      return supported.length > 0 ? supported : connectors;
    },
    [connectors],
  );

  async function handleConnect(connectorId: string) {
    setError(null);
    try {
      await connect(connectorId, { autoConnect: true });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect");
    }
  }

  async function handleDisconnect() {
    setError(null);
    try {
      await disconnect();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to disconnect");
    }
  }

  const address = wallet?.account.address.toString() ?? null;

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition opacity-50"
      >
        <span>Connect wallet</span>
      </button>
    );
  }

  if (!connected || !address) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={connecting}
          className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition disabled:opacity-50"
        >
          <span>{connecting ? "Connecting\u2026" : "Connect wallet"}</span>
          <span className="text-xs text-muted">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>
        {open ? (
          <div className="absolute z-10 mt-2 w-full min-w-60 rounded-xl border border-border bg-background p-3 shadow-lg">
            {picker.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Select wallet
                </p>
                <div className="space-y-1.5">
                  {picker.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => void handleConnect(c.id)}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-muted">Connect</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">
                No wallet found. Install a Solana wallet like Phantom.
              </p>
            )}
            {error ? (
              <p className="mt-2 text-sm font-semibold text-danger">{error}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition"
      >
        <span className="font-mono">{truncate(address)}</span>
        <span className="text-xs text-muted">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      {open ? (
        <div className="absolute z-10 mt-2 w-full min-w-60 rounded-xl border border-border bg-background p-3 shadow-lg">
          <div className="space-y-3">
            <div className="rounded border border-border bg-surface px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Connected
              </p>
              <p
                className="font-mono text-sm text-foreground"
                title={address}
              >
                {truncate(address)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleDisconnect()}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
            >
              Disconnect
            </button>
          </div>
          {error ? (
            <p className="mt-2 text-sm font-semibold text-danger">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
