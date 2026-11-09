import type { MovieSummary } from "@/api/types";

type MovieCardProps = {
  movie: MovieSummary;
  onSelect: (movie: MovieSummary) => void;
};

function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(movie)}
      className="group flex flex-col gap-2 text-left focus-visible:outline-none"
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-surface group-focus-visible:ring-2 group-focus-visible:ring-accent">
        {isHttpUrl(movie.poster) ? (
          <img
            src={movie.poster}
            alt={`Poster de ${movie.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-xs text-neutral-400">
            Sem poster
          </div>
        )}
      </div>
      <span className="line-clamp-2 text-sm text-white">{movie.title}</span>
    </button>
  );
}
