"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { web3 } from "@coral-xyz/anchor";
const { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } = web3;

function parseLamports(input: string) {
  const value = Number(input);
  if (!Number.isFinite(value) || value <= 0) return null;
  const lamports = BigInt(Math.floor(value * Number(LAMPORTS_PER_SOL)));
  return lamports > 0 ? lamports : null;
}

export function SolTransferCard() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isSending, setIsSending] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [error, setError] = useState<string | null>(null);

  const statusText = publicKey ? "Wallet connected" : "Wallet disconnected";

  async function sendSol() {
    if (!publicKey) {
      setError("Connect a wallet first.");
      return;
    }
    const lamports = parseLamports(amount);
    if (!lamports) {
      setError("Enter an amount greater than 0.");
      return;
    }
    const dest = destination.trim();
    if (!dest) {
      setError("Enter a destination address.");
      return;
    }
    setError(null);
    setIsSending(true);
    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(dest),
          lamports: Number(lamports),
        }),
      );

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setSignature(sig);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send SOL");
      return;
    } finally {
      setIsSending(false);
    }
    setAmount("0.001");
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-background p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          SOL Transfer
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          Send SOL with the connected wallet
        </h2>
        <p className="text-sm text-muted">
          Uses the connected signer as the fee payer and authorizes the
          transfer.
        </p>
      </div>
      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-foreground"
          htmlFor="destination"
        >
          Destination address
        </label>
        <input
          id="destination"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          placeholder="Destination wallet address"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-foreground"
          htmlFor="amount"
        >
          Amount (SOL)
        </label>
        <input
          id="amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          type="number"
          min="0"
          step="0.001"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Status: {statusText}</p>
        <button
          type="button"
          onClick={() => void sendSol()}
          disabled={!publicKey || isSending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? (
            <>
              <Loader2 size={16} className="inline animate-spin" /> Sending
            </>
          ) : (
            "Send SOL"
          )}
        </button>
      </div>
      {signature ? (
        <div className="rounded border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          <p className="font-semibold">Transfer sent</p>
          <a
            className="text-accent underline"
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
          >
            View on Solana Explorer <ArrowRight size={14} className="inline" />
          </a>
        </div>
      ) : null}
      {error ? (
        <p className="text-sm font-semibold text-danger">{error}</p>
      ) : null}
    </section>
  );
}
