"use client";
import { useState } from "react";
import {
  useConnectWallet,
  useDisconnectWallet,
  useWallet,
} from "@solana/react-hooks";

const CONNECTORS = [
  { id: "wallet-standard:phantom", label: "Phantom" },
  { id: "wallet-standard:solflare", label: "Solflare" },
  { id: "wallet-standard:backpack", label: "Backpack" },
  { id: "wallet-standard:jupiter", label: "Jupiter" },
  { id: "wallet-standard:trust", label: "Trust Wallet" },
  { id: "wallet-standard:brave", label: "Brave Wallet" },
  { id: "wallet-standard:exodus", label: "Exodus" },
  { id: "wallet-standard:glow", label: "Glow" },
];

function truncate(address: string) {
  return `${address.slice(0, 4)}\u2026${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const wallet = useWallet();
  const connectWallet = useConnectWallet();
  const disconnectWallet = useDisconnectWallet();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const isConnected = wallet.status === "connected";
  const address = isConnected
    ? wallet.session.account.address.toString()
    : null;

  async function handleConnect(connectorId: string) {
    setError(null);
    try {
      await connectWallet(connectorId, { autoConnect: true });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect");
    }
  }

  async function handleDisconnect() {
    setError(null);
    try {
      await disconnectWallet();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to disconnect");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition"
      >
        {address ? (
          <span className="font-mono">{truncate(address)}</span>
        ) : (
          <span>Connect wallet</span>
        )}
        <span className="text-xs text-muted">{open ? "\u25b2" : "\u25bc"}</span>
      </button>

      {open ? (
        <div className="absolute z-10 mt-2 w-full min-w-60 rounded-xl border border-border bg-background p-3 shadow-lg">
          {isConnected ? (
            <div className="space-y-3">
              <div className="rounded border border-border bg-surface px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Connected
                </p>
                <p
                  className="font-mono text-sm text-foreground"
                  title={address ?? ""}
                >
                  {address ? truncate(address) : ""}
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
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Wallet Standard
              </p>
              <div className="space-y-1.5">
                {CONNECTORS.map((connector) => (
                  <button
                    key={connector.id}
                    type="button"
                    onClick={() => void handleConnect(connector.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
                  >
                    <span>{connector.label}</span>
                    <span className="text-xs text-muted">Connect</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {error ? (
            <p className="mt-2 text-sm font-semibold text-danger">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
