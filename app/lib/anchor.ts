"use client";

import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import idl from "@/anchor-idl/idl.json";

const { Connection } = web3;

export const RPC_URL = "https://api.devnet.solana.com";
export const PROGRAM_ID = "FQC1y8nNHPZqYtc7aTJ7rRkRwVqZdtevjg1dHCEKiB6x";

interface AnchorWallet {
  publicKey: web3.PublicKey;
  signTransaction<T extends web3.Transaction | web3.VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends web3.Transaction | web3.VersionedTransaction>(txs: T[]): Promise<T[]>;
}

function createConnection() {
  return new Connection(RPC_URL, "confirmed");
}

export function createProgram(wallet: AnchorWallet) {
  const connection = createConnection();

  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  return new Program(idl, provider);
}
