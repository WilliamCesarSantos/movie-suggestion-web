import { useState } from 'react';
import { isForbiddenError } from '../../api/client/errorPolicy';
import { AccessDeniedState } from '../../components/feedback/AccessDeniedState';
import { parseImportMovieNames } from '../../features/movies/parseImportMovieNames';
import { useMovieImport } from '../../features/movies/useMovieImport';
import { useSession } from '../../features/auth/sessionStore';

export function MovieImportPage() {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();
  const mutation = useMovieImport(session?.accessToken);

  if (isForbiddenError(mutation.error)) {
    return <AccessDeniedState />;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Movie Import</h1>
      <textarea
        className="h-56 w-full rounded bg-slate-800 p-3"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Um filme por linha"
      />
      <button
        className="mt-4 rounded bg-cyan-600 px-4 py-2"
        onClick={() => {
          const searchTerms = parseImportMovieNames(text);
          if (searchTerms.length === 0) {
            setError('Informe pelo menos um filme para importar.');
            return;
          }
          setError(null);
          mutation.mutate({ searchTerms, maxPages: 1 });
        }}
      >
        Importar
      </button>
      {error ? <p className="mt-3 text-red-400">{error}</p> : null}
      {mutation.isSuccess ? <p className="mt-3 text-emerald-400">Importação enviada.</p> : null}
      {mutation.isError && !isForbiddenError(mutation.error) ? <p className="mt-3 text-red-400">Falha ao importar.</p> : null}
    </main>
  );
}
