"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BN } from "@coral-xyz/anchor";
import { useWallet } from "@solana/react-hooks";
import type { WalletSession } from "@solana/client";
import { createProgram } from "@/lib/anchor";
import {
  fetchPollById,
  fetchVoterState,
  formatTimestamp,
  isPollActive,
  type DecodedPoll,
} from "@/lib/fetchPolls";

interface Props {
  pollId: string;
}

function getSession(
  wallet: ReturnType<typeof useWallet>
): WalletSession | null {
  if (wallet.status === "connected") return wallet.session;
  return null;
}

function calcPercent(part: number, total: number): string {
  if (total === 0) return "0%";
  return ((part / total) * 100).toFixed(1) + "%";
}

export function PollDetail({ pollId }: Props) {
  const wallet = useWallet();
  const session = getSession(wallet);
  const [poll, setPoll] = useState<DecodedPoll | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [voterState, setVoterState] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const mounted = useRef(false);

  const fetchData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const program = createProgram(session);
      const pollData = await fetchPollById(program, new BN(pollId));
      if (!mounted.current) return;
      setPoll(pollData);

      if (pollData) {
        const voterData = await fetchVoterState(
          program,
          new BN(pollId),
          program.provider.publicKey
        );
        if (mounted.current) setVoterState(voterData);
      }
    } catch (err) {
      if (mounted.current)
        setError(err instanceof Error ? err.message : "Failed to load poll");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [session, pollId]);

  useEffect(() => {
    mounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  const [now] = useState(() => Math.floor(Date.now() / 1000));

  async function castVote(voteType: object) {
    if (!session) {
      setActionError("Connect a wallet first.");
      return;
    }
    setActionError(null);
    setTxSignature(null);
    setSending(true);
    try {
      const program = createProgram(session);
      const sig = await program.methods
        .castVote(new BN(pollId), voteType)
        .rpc();
      setTxSignature(sig);
      await fetchData();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to cast vote"
      );
    } finally {
      setSending(false);
    }
  }

  async function handleClose() {
    if (!session) {
      setActionError("Connect a wallet first.");
      return;
    }
    setActionError(null);
    setTxSignature(null);
    setSending(true);
    try {
      const program = createProgram(session);
      const sig = await program.methods.closePoll(new BN(pollId)).rpc();
      setTxSignature(sig);
      await fetchData();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to close poll"
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading poll</p>;
  }

  if (error) {
    return <p className="text-sm font-semibold text-danger">{error}</p>;
  }

  if (!poll) {
    return <p className="text-sm text-muted">Poll not found.</p>;
  }

  const active = isPollActive(poll.stateRaw);
  const started = now >= poll.startTime;
  const ended = now >= poll.endTime;
  const hasVoted = voterState?.hasVoted ?? false;

  return (
    <section className="space-y-5 rounded-xl border border-border bg-background p-6 shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              active
                ? "bg-success/20 text-success"
                : "bg-surface-alt text-muted"
            }`}
          >
            {poll.state}
          </span>
          <span className="text-xs text-muted">ID: {poll.pollId}</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{poll.title}</h1>
        <p className="text-sm text-muted">{poll.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Start
          </p>
          <p className="text-foreground">{formatTimestamp(poll.startTime)}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            End
          </p>
          <p className="text-foreground">{formatTimestamp(poll.endTime)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Results ({poll.totalVote} total votes)
        </p>
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Up Vote</span>
              <span className="text-muted">
                {poll.totalUpVote} (
                {calcPercent(poll.totalUpVote, poll.totalVote)})
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-surface-alt">
              <div
                className="h-2.5 rounded-full bg-success transition-all"
                style={{
                  width: calcPercent(poll.totalUpVote, poll.totalVote),
                }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Down Vote</span>
              <span className="text-muted">
                {poll.totalDownVote} (
                {calcPercent(poll.totalDownVote, poll.totalVote)})
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-surface-alt">
              <div
                className="h-2.5 rounded-full bg-danger transition-all"
                style={{
                  width: calcPercent(poll.totalDownVote, poll.totalVote),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {active && started && !ended ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Cast Your Vote
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void castVote({ upVote: {} })}
              disabled={sending || hasVoted}
              className="rounded-lg border border-success/40 bg-success/10 px-4 py-2 text-sm font-medium text-success hover:bg-success/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Up Vote
            </button>
            <button
              type="button"
              onClick={() => void castVote({ downVote: {} })}
              disabled={sending || hasVoted}
              className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Down Vote
            </button>
            <button
              type="button"
              onClick={() => void castVote({ abstain: {} })}
              disabled={sending || hasVoted}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
            >
              Abstain
            </button>
          </div>
          {hasVoted ? (
            <p className="text-sm font-medium text-success">
              You have already voted on this poll.
            </p>
          ) : null}
        </div>
      ) : null}

      {active && ended ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-warning">
            This poll has ended but is still open. Close it to finalize.
          </p>
          <button
            type="button"
            onClick={() => void handleClose()}
            disabled={sending}
            className="rounded-lg bg-warning px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Closing\u2026" : "Close Poll"}
          </button>
        </div>
      ) : null}

      {!started ? (
        <p className="text-sm text-muted">This poll has not started yet.</p>
      ) : null}

      {txSignature ? (
        <div className="rounded border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          <p className="font-semibold">Transaction sent</p>
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

      {actionError ? (
        <p className="text-sm font-semibold text-danger">{actionError}</p>
      ) : null}
    </section>
  );
}
