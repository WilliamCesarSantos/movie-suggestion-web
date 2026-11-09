import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordWatched } from "@/api/movies";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StarRating } from "@/components/StarRating/StarRating";
import { mapReaction, ratingLabel } from "@/lib/rating";

export function MovieRatingPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const state: unknown = location.state;
  const title =
    typeof state === "object" &&
    state !== null &&
    "title" in state &&
    typeof (state as { title: unknown }).title === "string"
      ? (state as { title: string }).title
      : undefined;
  const [rating, setRating] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: (value: number) => recordWatched(id as string, { rating: value, reaction: mapReaction(value) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["movies"] });
      navigate("/catalog", { replace: true });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating !== null && id) {
      mutation.mutate(rating);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-white">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-surface p-8 text-center shadow-xl">
        <h1 className="text-xl font-semibold">Avaliar filme</h1>
        {title && <p className="mt-1 text-neutral-300">{title}</p>}
        <div className="mt-6">
          <StarRating value={rating} onChange={setRating} />
        </div>
        <p aria-live="polite" className="mt-4 text-sm text-neutral-300">
          {ratingLabel(rating)}
        </p>
        {mutation.isError && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            Não foi possível enviar sua avaliação. Tente novamente.
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <PrimaryButton
            type="submit"
            disabled={rating === null || !id}
            isLoading={mutation.isPending}
            loadingLabel="Enviando..."
          >
            Enviar avaliação
          </PrimaryButton>
          <button
            type="button"
            onClick={() => navigate("/catalog")}
            className="text-sm text-neutral-400 hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  );
}
