import Link from "next/link";
import { PollDetail } from "@/components/ui/poll-detail";

interface Props {
  params: Promise<{ pollId: string }>;
}

export default async function PollPage({ params }: Props) {
  const { pollId } = await params;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-10">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-accent hover:text-accent-hover hover:underline"
        >
          Back to polls
        </Link>
        <p className="text-xl font-semibold uppercase tracking-wide text-accent">
          solpoll
        </p>
      </div>
      <PollDetail pollId={pollId} />
    </main>
  );
}
