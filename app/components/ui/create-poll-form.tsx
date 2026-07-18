"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { BN } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { createProgram } from "@/lib/anchor";
import { nowUnixSeconds } from "@/lib/fetchPolls";

export function CreatePollForm({
  onCreatedAction,
}: {
  onCreatedAction: () => void;
}) {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startInMin, setStartInMin] = useState("0");
  const [durationMin, setDurationMin] = useState("10");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!publicKey || !signTransaction) {
      setError("Connect a wallet first.");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const startOffset = Number(startInMin);
    const duration = Number(durationMin);

    if (!trimmedTitle || trimmedTitle.length > 32) {
      setError("Title must be 1-32 characters.");
      return;
    }
    if (!trimmedDesc || trimmedDesc.length > 256) {
      setError("Description must be 1-256 characters.");
      return;
    }
    if (!startInMin || startOffset < 0) {
      setError("Start must be 0 or more minutes from now.");
      return;
    }
    if (!durationMin || duration < 1) {
      setError("Duration must be at least 1 minute.");
      return;
    }

    const now = nowUnixSeconds();
    const start = now + startOffset * 60;
    const end = start + duration * 60;

    setError(null);
    setSending(true);
    setTxSignature(null);

    try {
      const program = createProgram({
        publicKey,
        signTransaction,
        signAllTransactions: async (txs) =>
          Promise.all(txs.map((tx) => signTransaction(tx))),
      });
      const pollId = new BN(nowUnixSeconds());

      const sig = await program.methods
        .initializePoll(
          pollId,
          trimmedTitle,
          trimmedDesc,
          new BN(start),
          new BN(end),
        )
        .rpc();

      setTxSignature(sig);
      setTitle("");
      setDescription("");
      setStartInMin("0");
      setDurationMin("10");
      onCreatedAction();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create poll");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-background p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Create Poll
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          Start a new poll on Solpoll
        </h2>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div className="space-y-1.5">
          <label
            htmlFor="title"
            className="text-sm font-semibold text-foreground"
          >
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Best DeFi protocol?"
            maxLength={32}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="description"
            className="text-sm font-semibold text-foreground"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your poll here"
            maxLength={256}
            rows={3}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="startInMin"
              className="text-sm font-semibold text-foreground"
            >
              Starts in (minutes)
            </label>
            <input
              id="startInMin"
              type="number"
              min="0"
              value={startInMin}
              onChange={(e) => setStartInMin(e.target.value)}
              placeholder="0"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="durationMin"
              className="text-sm font-semibold text-foreground"
            >
              Duration (minutes)
            </label>
            <input
              id="durationMin"
              type="number"
              min="1"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              placeholder="10"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted">
            Poll ID is the current Unix timestamp
          </p>
          <button
            type="submit"
            disabled={!publicKey || sending}
            suppressHydrationWarning
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 size={16} className="inline animate-spin" /> Creating
              </>
            ) : (
              "Create Poll"
            )}
          </button>
        </div>
      </form>

      {txSignature ? (
        <div className="rounded border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          <p className="font-semibold">Poll created</p>
          <a
            className="text-accent underline"
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
          >
            View on Solana Explorer
          </a>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm font-semibold text-danger">{error}</p>
      ) : null}
    </section>
  );
}
