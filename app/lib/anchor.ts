"use client";

import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import type { WalletSession } from "@solana/client";
import idl from "@/anchor-idl/idl.json";

const { Connection, PublicKey, VersionedTransaction, VersionedMessage } = web3;

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
    signTransaction: async (tx: any) => {
      if (!walletSession.signTransaction)
        throw new Error("Wallet does not support signing");

      const msgBytes = tx.serializeMessage();

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

      const returnedMsgBytes = new Uint8Array(signedKitTx.messageBytes);
      const message = VersionedMessage.deserialize(returnedMsgBytes);
      const sigMap = signedKitTx.signatures as Record<string, Uint8Array | null>;
      const requiredSigners = message.staticAccountKeys.slice(
        0,
        message.header.numRequiredSignatures
      );
      const signatures: Uint8Array[] = requiredSigners.map((signer: any) => {
        const sig = sigMap[signer.toBase58()];
        return sig ? new Uint8Array(sig) : new Uint8Array(64);
      });

      return new VersionedTransaction(message, signatures);
    },
    signAllTransactions: async (txs: any[]) => {
      if (!walletSession.signTransaction)
        throw new Error("Wallet does not support signing");

      const results = [];
      for (const tx of txs) {
        const msgBytes = tx.serializeMessage();

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

        const returnedMsgBytes = new Uint8Array(signedKitTx.messageBytes);
        const message = VersionedMessage.deserialize(returnedMsgBytes);
        const sigMap = signedKitTx.signatures as Record<string, Uint8Array | null>;
        const requiredSigners = message.staticAccountKeys.slice(
          0,
          message.header.numRequiredSignatures
        );
        const signatures: Uint8Array[] = requiredSigners.map((signer: any) => {
          const sig = sigMap[signer.toBase58()];
          return sig ? new Uint8Array(sig) : new Uint8Array(64);
        });

        results.push(new VersionedTransaction(message, signatures));
      }

      return results;
    },
  } as any;

  const provider = new AnchorProvider(connection, anchorWallet, {
    commitment: "confirmed",
  });

  return new Program(idl, provider);
}
