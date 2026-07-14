import { WalletConnectButton } from "@/components/ui/wallet-connect-button";
import { SolTransferCard } from "@/components/ui/sol-transfer-card";
import { ProgramAccountsSection } from "@/components/ui/poll-card";

function lamportsToSol(lamports: number): string {
  return (lamports / 1e9).toFixed(4);
}

export default function HomePage() {
  const program = "FQC1y8nNHPZqYtc7aTJ7rRkRwVqZdtevjg1dHCEKiB6x";
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-10">
      <header className="space-y-3">
        <p className="text-xl font-semibold uppercase tracking-wide text-slate-600">
          solpoll
        </p>
      </header>
      <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Wallet
            </p>
            <p className="text-sm text-slate-700">
              Pick a Wallet Standard connector.
            </p>
          </div>
          <div className="sm:min-w-60">
            <WalletConnectButton />
          </div>
        </div>
      </section>
      <ProgramAccountsSection program={program} />
    </main>
  );
}
