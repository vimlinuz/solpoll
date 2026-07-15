"use client";

import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import type { WalletSession } from "@solana/client";
import idl from "@/anchor-idl/idl.json";

const { Connection, PublicKey, Message, Transaction } = web3;

export const RPC_URL = "https://api.devnet.solana.com";
export const PROGRAM_ID = "FQC1y8nNHPZqYtc7aTJ7rRkRwVqZdtevjg1dHCEKiB6x";

let _connection: ReturnType<typeof createConnection> | null = null;

function createConnection() {
  return new Connection(RPC_URL, "confirmed");
}

function getConnection() {
  if (!_connection) {
    _connection = createConnection();
  }
  return _connection;
}

export function createProgram(walletSession: WalletSession) {
  const connection = getConnection();

  const anchorWallet = {
    publicKey: new PublicKey(walletSession.account.address),
    signTransaction: async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tx: any
    ) => {
      if (!walletSession.signTransaction)
        throw new Error("Wallet does not support signing");

      const msgBytes = tx.serializeMessage();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kitTx: any = {
        messageBytes: new Uint8Array(msgBytes),
        signatures: {} as Record<string, Uint8Array | null>,
      };

      for (const sig of tx.signatures) {
        const addr = sig.publicKey.toBase58();
        kitTx.signatures[addr] = sig.signature
          ? new Uint8Array(sig.signature)
          : null;
      }

      const signedKitTx = await walletSession.signTransaction(kitTx);

      const message = Message.from(new Uint8Array(signedKitTx.messageBytes));
      const signedTx = Transaction.populate(message, []);

      for (const [addr, sigBytes] of Object.entries(
        signedKitTx.signatures as Record<string, Uint8Array | null>
      )) {
        if (sigBytes) {
          signedTx.addSignature(new PublicKey(addr), Buffer.from(sigBytes));
        }
      }

      return signedTx;
    },
    signAllTransactions: async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      txs: any[]
    ) => {
      if (!walletSession.signTransaction)
        throw new Error("Wallet does not support signing");

      const results = [];
      for (const tx of txs) {
        const msgBytes = tx.serializeMessage();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const kitTx: any = {
          messageBytes: new Uint8Array(msgBytes),
          signatures: {} as Record<string, Uint8Array | null>,
        };

        for (const sig of tx.signatures) {
          const addr = sig.publicKey.toBase58();
          kitTx.signatures[addr] = sig.signature
            ? new Uint8Array(sig.signature)
            : null;
        }

        const signedKitTx = await walletSession.signTransaction(kitTx);

        const message = Message.from(new Uint8Array(signedKitTx.messageBytes));
        const signedTx = Transaction.populate(message, []);

        for (const [addr, sigBytes] of Object.entries(
          signedKitTx.signatures as Record<string, Uint8Array | null>
        )) {
          if (sigBytes) {
            signedTx.addSignature(new PublicKey(addr), Buffer.from(sigBytes));
          }
        }

        results.push(signedTx);
      }
      return results;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  const provider = new AnchorProvider(connection, anchorWallet, {
    commitment: "confirmed",
  });

  return new Program(idl, provider);
}
