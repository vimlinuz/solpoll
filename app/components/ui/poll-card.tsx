"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { WalletSession } from "@solana/client";
import { createProgram } from "@/lib/anchor";
import {
  fetchAllPolls,
  formatTimestamp,
  isPollActive,
  type DecodedPoll,
} from "@/lib/fetchPolls";
import Link from "next/link";

interface Props {
  walletSession?: WalletSession | null;
}

export function PollList({ walletSession }: Props) {
  const [polls, setPolls] = useState<DecodedPoll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");
  const mounted = useRef(false);

  const fetchPolls = useCallback(async () => {
    if (!walletSession) return;
    setLoading(true);
    setError(null);
    try {
      const program = createProgram(walletSession);
      const data = await fetchAllPolls(program);
      if (mounted.current) {
        data.sort((a, b) => b.endTime - a.endTime);
        setPolls(data);
      }
    } catch (err) {
      if (mounted.current)
        setError(err instanceof Error ? err.message : "Failed to fetch polls");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [walletSession]);

  useEffect(() => {
    mounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPolls();
    return () => {
      mounted.current = false;
    };
  }, [fetchPolls]);

  return (
    <section className="space-y-4 rounded-xl border border-border bg-background p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Polls
          </p>
          <h2 className="text-xl font-semibold text-foreground">All Polls</h2>
        </div>
        <button
          type="button"
          onClick={() => void fetchPolls()}
          disabled={loading}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface disabled:opacity-50"
        >
          {loading ? "Loading" : "Refresh"}
        </button>
      </div>

      {error ? (
        <p className="text-sm font-semibold text-danger">{error}</p>
      ) : null}

      <div className="flex gap-1 rounded-lg bg-surface p-1 text-sm">
        {(["all", "active", "closed"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium capitalize transition ${
              filter === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {(() => {
        const filtered =
          filter === "all"
            ? polls
            : polls.filter((p) =>
                filter === "active"
                  ? isPollActive(p.stateRaw)
                  : !isPollActive(p.stateRaw)
              );

        return loading && filtered.length === 0 ? (
          <p className="text-sm text-muted"><Loader2 size={16} className="inline animate-spin" /> Loading polls</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted">
            No {filter === "all" ? "" : filter} polls found.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((poll) => (
              <Link
                key={poll.pollId}
                href={`/polls/${poll.pollId}`}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-border hover:bg-background"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    {poll.title}
                  </p>
                  <p className="text-xs text-muted">
                    {formatTimestamp(poll.startTime)} -{" "}
                    {formatTimestamp(poll.endTime)}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted">{poll.totalVote} votes</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-semibold ${
                      isPollActive(poll.stateRaw)
                        ? "bg-success/20 text-success"
                        : "bg-surface-alt text-muted"
                    }`}
                  >
                    {poll.state}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        );
      })()}
    </section>
  );
}
