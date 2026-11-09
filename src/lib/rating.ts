import type { RecordWatchedRequest } from "@/api/types";

export type Reaction = RecordWatchedRequest["reaction"];

/**
 * Maps a 1..10 rating to the backend `reaction` enum, per the project rule:
 *   rating < 5          → "disliked"
 *   5 <= rating <= 7    → "neutral"
 *   rating > 7          → "liked"
 */
export function mapReaction(rating: number): Reaction {
  if (rating < 5) {
    return "disliked";
  }
  if (rating <= 7) {
    return "neutral";
  }
  return "liked";
}

export function ratingLabel(rating: number | null): string {
  if (rating === null || rating === 0) {
    return "Toque numa estrela para avaliar";
  }
  if (rating < 5) {
    return "Você odiou — disliked";
  }
  if (rating <= 7) {
    return "Meh — neutral";
  }
  return "Você amou! — liked";
}
