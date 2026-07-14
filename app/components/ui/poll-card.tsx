import { SolanaQueryProvider, useProgramAccounts } from "@solana/react-hooks";

function ProgramAccounts({ program }: { program: string }) {
  const query = useProgramAccounts(program);

  if (query.isLoading) return <p>Loading…</p>;
  if (query.isError) return <p role="alert">RPC error</p>;

  return (
    <div>
      <button onClick={() => query.refresh()}>Refresh</button>
      <ul>
        {query.accounts.map(({ pubkey }) => (
          <li key={pubkey.toString()}>{pubkey.toString()}</li>
        ))}
      </ul>
    </div>
  );
}

export function ProgramAccountsSection({ program }: { program: string }) {
  return (
    <SolanaQueryProvider>
      <ProgramAccounts program={program} />
    </SolanaQueryProvider>
  );
}
