import { Link } from 'react-router-dom';
import type { MovieRecommendation } from '../../api/schemas/movieSchemas';

export function MovieRecommendationCard({ movie }: { movie: MovieRecommendation }) {
  return (
    <article className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <h3 className="text-lg font-semibold">{movie.title}</h3>
      <p className="mt-2 text-sm text-slate-300">{movie.overviewShort}</p>
      <Link className="mt-4 inline-block text-cyan-400" to={`/movies/${movie.id}`}>
        Ver detalhes
      </Link>
    </article>
  );
}
