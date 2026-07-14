"use client";

import { useState } from "react";
import { useWallet } from "@solana/react-hooks";
import type { WalletSession } from "@solana/client";
import { WalletConnectButton } from "@/components/ui/wallet-connect-button";
import { CreatePollForm } from "@/components/ui/create-poll-form";
import { PollList } from "@/components/ui/poll-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function useWalletSession(): WalletSession | undefined {
  const wallet = useWallet();
  if (wallet.status === "connected") {
    return wallet.session;
  }
  return undefined;
}

export default function HomePage() {
  const walletSession = useWalletSession();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xl font-semibold uppercase tracking-wide text-accent">
            solpoll
          </p>
          <p className="text-sm text-muted">Decentralized polling on Solana</p>
        </div>
        <ThemeToggle />
      </header>

      <section className="space-y-3 rounded border border-border bg-background p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Wallet
            </p>
            <p className="text-sm text-muted">
              Connect to create polls and vote.
            </p>
          </div>
          <div className="sm:min-w-60">
            <WalletConnectButton />
          </div>
        </div>
      </section>

      <CreatePollForm onCreatedAction={handleCreated} />
      <PollList key={refreshKey} walletSession={walletSession} />
    </main>
  );
}
