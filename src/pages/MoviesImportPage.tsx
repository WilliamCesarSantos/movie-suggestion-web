import { useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { Header } from "@/components/Header/Header";
import { useImportMovies } from "@/hooks/useImportMovies";
import { normalizeSearchTerms } from "@/lib/importTerms";

function plural(n: number): string {
  return n === 1 ? "1 filme" : `${n} filmes`;
}

interface ImportError {
  message: string;
  retryable: boolean;
}

function toImportError(error: unknown): ImportError | null {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status === 401) return null;
  if (status === 400) {
    return { message: "Os títulos informados são inválidos. Revise a lista e tente novamente.", retryable: false };
  }
  if (status === 403) return { message: "Você não tem permissão para importar filmes.", retryable: false };
  return { message: "Não foi possível iniciar a importação. Tente novamente em instantes.", retryable: true };
}

export function MoviesImportPage() {
  const [text, setText] = useState("");
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const mutation = useImportMovies();
  const terms = normalizeSearchTerms(text);
  const count = terms.length;
  const sending = mutation.isPending;
  const canSubmit = count > 0 && !sending;
  const error = mutation.isError ? toImportError(mutation.error) : null;

  function submit() {
    if (!canSubmit) return;
    const sent = terms;
    setSuccessCount(null);
    mutation.mutate(sent, {
      onSuccess: () => {
        setSuccessCount(sent.length);
        setText("");
      },
    });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  }

  function onChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    setSuccessCount(null);
    if (mutation.isError) mutation.reset();
  }

  const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500";

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <main className="mx-auto max-w-[1280px] px-6 py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold">Importar filmes</h1>
          <p className="mb-6 mt-1 text-neutral-400">
            Informe um título por linha. Buscaremos cada um no OMDB.
          </p>

          {successCount !== null && (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 flex flex-col gap-3 rounded-lg border border-green-600/40 bg-green-900/20 p-4 text-green-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <p>
                Importação iniciada para {plural(successCount)}. Eles aparecerão no catálogo depois que o
                processamento terminar, o que pode levar alguns instantes.
              </p>
              <Link
                to="/catalog"
                className={`shrink-0 rounded border border-green-600/40 px-3 py-1.5 text-sm hover:bg-green-900/40 ${focusRing}`}
              >
                Ver catálogo
              </Link>
            </div>
          )}

          <form
            onSubmit={onSubmit}
            aria-busy={sending}
            className="rounded-lg bg-[#17171d] p-5"
          >
            <label htmlFor="titles" className="mb-2 block text-sm font-medium text-neutral-200">
              Títulos para importar
            </label>
            <textarea
              id="titles"
              name="titles"
              value={text}
              onChange={onChange}
              onKeyDown={onKeyDown}
              disabled={sending}
              aria-describedby="titles-help"
              placeholder={"inception\nmatrix\ninterstellar"}
              className={`w-full resize-y sm:h-56 rounded border border-neutral-700 bg-neutral-900 p-3 text-neutral-200 placeholder:text-neutral-600 disabled:opacity-60 ${focusRing}`}
              rows={6}
            />
            <p id="titles-help" className="mt-2 text-sm text-neutral-400">
              Um título por linha. Linhas vazias e repetidas são ignoradas.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-4 flex flex-col gap-2 text-sm text-red-400 sm:flex-row sm:items-center sm:justify-between"
              >
                <p>{error.message}</p>
                {error.retryable && (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!canSubmit}
                    className={`rounded border border-red-400/50 px-3 py-1.5 hover:bg-red-900/20 disabled:opacity-50 ${focusRing}`}
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p role="status" aria-live="polite" className="text-sm text-neutral-200">
                {count === 0 ? "Nenhum título válido" : `${plural(count)} para importar`}
              </p>
              <button
                type="submit"
                disabled={!canSubmit}
                className={`inline-flex items-center justify-center gap-2 rounded bg-accent px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
              >
                {sending && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                )}
                {sending ? "Enviando..." : "Importar filmes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
