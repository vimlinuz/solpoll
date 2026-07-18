/* eslint-disable @typescript-eslint/no-explicit-any */
import { web3, BN } from "@coral-xyz/anchor";

const { PublicKey } = web3;

function bnToNumber(bn: BN): number {
  return bn.toNumber();
}

export function pollStateToString(state: any): string {
  if (typeof state === "object") {
    if ("active" in state) return "Active";
    if ("closed" in state) return "Closed";
  }
  return String(state);
}

export function isPollActive(state: any): boolean {
  if (typeof state === "object") {
    return "active" in state;
  }
  return state === 0;
}

export function formatTimestamp(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString();
}

export function nowUnixSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export interface DecodedPoll {
  pubkey: string;
  pollId: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  totalUpVote: number;
  totalDownVote: number;
  totalVote: number;
  bump: number;
  state: string;
  stateRaw: any;
}

export function decodePoll(account: any): DecodedPoll {
  const data = account.account;
  return {
    pubkey: account.publicKey.toString(),
    pollId: data.pollId.toString(),
    title: data.title,
    description: data.description,
    startTime: bnToNumber(data.startTime),
    endTime: bnToNumber(data.endTime),
    totalUpVote: bnToNumber(data.totalUpVote),
    totalDownVote: bnToNumber(data.totalDownVote),
    totalVote: bnToNumber(data.totalVote),
    bump: data.bump,
    state: pollStateToString(data.state),
    stateRaw: data.state,
  };
}

export async function fetchAllPolls(program: any): Promise<DecodedPoll[]> {
  const accounts = await program.account.poll.all();
  return accounts.map(decodePoll);
}

export async function fetchPollById(
  program: any,
  pollId: BN,
): Promise<DecodedPoll | null> {
  try {
    const pollIdBytes = new BN(pollId).toArrayLike(Buffer, "le", 8);
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), pollIdBytes],
      new PublicKey(program.programId.toString()),
    );
    const account = await program.account.poll.fetch(pda);
    return decodePoll({ publicKey: pda, account });
  } catch {
    return null;
  }
}

export async function fetchVoterState(
  program: any,
  pollId: BN,
  voterPubkey: any,
): Promise<any | null> {
  try {
    const pollIdBytes = new BN(pollId).toArrayLike(Buffer, "le", 8);
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("voter"), voterPubkey.toBuffer(), pollIdBytes],
      new PublicKey(program.programId.toString()),
    );
    return await program.account.voterState.fetch(pda);
  } catch {
    return null;
  }
}
