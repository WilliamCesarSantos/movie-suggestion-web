import { useMutation } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { triggerImport } from "@/api/moviesImport";
import type { TriggerImportResponse } from "@/api/types";
import { IMPORT_MAX_PAGES } from "@/lib/importTerms";

export function useImportMovies(): UseMutationResult<TriggerImportResponse, unknown, string[]> {
  return useMutation({
    mutationFn: (searchTerms: string[]) =>
      triggerImport({ searchTerms, maxPages: IMPORT_MAX_PAGES }),
  });
}
