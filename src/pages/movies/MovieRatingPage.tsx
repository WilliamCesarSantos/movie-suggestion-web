import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { isForbiddenError } from '../../api/client/errorPolicy';
import { AccessDeniedState } from '../../components/feedback/AccessDeniedState';
import { useSession } from '../../features/auth/sessionStore';
import { classifyRating, useSubmitWatchedRating } from '../../features/movies/useSubmitWatchedRating';

export function MovieRatingPage() {
  const { id } = useParams();
  const { session } = useSession();
  const submit = useSubmitWatchedRating(session?.accessToken);
  const [rating, setRating] = useState(7);
  const [error, setError] = useState<string | null>(null);

  if (isForbiddenError(submit.error)) {
    return <AccessDeniedState />;
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Avaliar filme</h1>
      <p className="mt-2 text-slate-300">Nota inteira entre 0 e 10.</p>
      <input
        type="number"
        min={0}
        max={10}
        step={1}
        value={rating}
        onChange={(event) => setRating(Number(event.target.value))}
        className="mt-4 w-full rounded bg-slate-800 p-3"
      />
      <button
        className="mt-4 rounded bg-cyan-700 px-4 py-2"
        onClick={() => {
          if (!id) return;
          if (!Number.isInteger(rating) || rating < 0 || rating > 10) {
            setError('A nota deve ser um inteiro entre 0 e 10.');
            return;
          }
          setError(null);
          submit.mutate({ movieId: id, rating });
        }}
      >
        Enviar avaliação
      </button>
      {error ? <p className="mt-3 text-red-400">{error}</p> : null}
      {submit.isError && !isForbiddenError(submit.error) ? <p className="mt-3 text-red-400">Falha ao enviar avaliação.</p> : null}
      {submit.isSuccess ? <p className="mt-3">Classificação: {classifyRating(rating)}</p> : null}
    </main>
  );
}
