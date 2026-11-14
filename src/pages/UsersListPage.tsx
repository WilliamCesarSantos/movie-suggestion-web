import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header/Header";
import { Pagination } from "@/components/Pagination/Pagination";
import { UsersCards } from "@/components/UsersCards/UsersCards";
import { UsersFilters } from "@/components/UsersFilters/UsersFilters";
import { UsersTable } from "@/components/UsersTable/UsersTable";
import { useHasRole } from "@/hooks/useHasRole";
import { useUsers, USERS_PAGE_SIZE } from "@/hooks/useUsers";
import { useUsersListParams } from "@/hooks/useUsersListParams";
import type { ListUsersItem } from "@/api/types";

function readToast(state: unknown): string | null {
  if (typeof state !== "object" || state === null) return null;
  const toast = (state as Record<string, unknown>).toast;
  return typeof toast === "string" ? toast : null;
}

export function UsersListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const canWrite = useHasRole(["users:write"]);
  const {
    page,
    nameParam,
    emailParam,
    nameInput,
    emailInput,
    setNameInput,
    setEmailInput,
    goToPage,
    clearFilters,
  } = useUsersListParams();

  const [toast, setToast] = useState<string | null>(() => readToast(location.state));

  // Consume the router-state toast so it does not reappear on reload.
  useEffect(() => {
    if (readToast(location.state) === null) return;
    navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
  }, [location.state, location.pathname, location.search, navigate]);

  const { data, isLoading, isError, error, isPlaceholderData, refetch } = useUsers(page, {
    name: nameParam,
    email: emailParam,
  });

  const status = isAxiosError(error) ? error.response?.status : undefined;
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? USERS_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const users: ListUsersItem[] = data?.data ?? [];
  const hasFilters = nameParam !== "" || emailParam !== "";

  useEffect(() => {
    if (status === 403) navigate("/forbidden", { replace: true });
    if (status === 400 && page !== 1) goToPage(1);
  }, [status, page, navigate, goToPage]);

  useEffect(() => {
    if (data && !isPlaceholderData && page > totalPages) goToPage(totalPages);
  }, [data, isPlaceholderData, page, totalPages, goToPage]);

  const readOnlyNotice = !canWrite;
  const showFilters = canWrite || total > pageSize;
  const showPagination = total > pageSize;
  const fetchingPage = isPlaceholderData;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const newUserButton = canWrite ? (
    <Link
      to="/users/new"
      aria-label="Novo usuário"
      className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[#c1070f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
    >
      <span className="sm:hidden">+ Novo</span>
      <span className="hidden sm:inline">+ Novo usuário</span>
    </Link>
  ) : null;

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Usuários</h1>
            <p className="text-sm text-neutral-400">Gerencie contas e permissões</p>
          </div>
          {newUserButton}
        </div>

        {toast && (
          <div role="status" className="mt-4 flex items-center justify-between rounded-lg bg-green-900/40 px-4 py-3 text-sm">
            <span>{toast}</span>
            <button type="button" aria-label="Dispensar aviso" onClick={() => setToast(null)} className="ml-4 rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
              ×
            </button>
          </div>
        )}

        {readOnlyNotice && (
          <p className="mt-4 rounded-lg bg-neutral-800 px-4 py-3 text-sm text-neutral-300">
            Você tem permissão somente de leitura. Exibindo apenas o seu usuário.
          </p>
        )}

        {showFilters && (
          <UsersFilters
            name={nameInput}
            email={emailInput}
            onNameChange={setNameInput}
            onEmailChange={setEmailInput}
            onClear={clearFilters}
          />
        )}

        <div className="mt-4">
          {isLoading && (
            <div role="status" aria-busy="true" className="animate-pulse space-y-2">
              <span className="sr-only">Carregando...</span>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-12 rounded bg-neutral-800" />
              ))}
            </div>
          )}

          {isError && status !== 403 && (
            <div role="alert" className="mx-auto max-w-sm rounded-lg bg-[#17171d] p-6 text-center">
              <p>Não foi possível carregar os usuários.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoading && !isError && users.length === 0 && (
            <div className="rounded-lg bg-[#17171d] p-8 text-center">
              <p>Nenhum usuário encontrado.</p>
              {hasFilters ? (
                <>
                  <p className="mt-1 text-sm text-neutral-400">Tente outros termos.</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-3 rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
                  >
                    Limpar filtros
                  </button>
                </>
              ) : (
                canWrite && (
                  <Link to="/users/new" className="mt-3 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold">
                    + Novo usuário
                  </Link>
                )
              )}
            </div>
          )}

          {users.length > 0 && (
            <div className={fetchingPage ? "opacity-60" : undefined}>
              {fetchingPage && (
                <p role="status" className="mb-2 text-sm text-neutral-400">
                  Carregando...
                </p>
              )}

              <UsersCards users={users} canWrite={canWrite} />
              <UsersTable users={users} canWrite={canWrite} busy={fetchingPage} />

              <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-neutral-400">
                  Exibindo {start}-{end} de {total}
                </p>
                {showPagination && (
                  <Pagination page={page} totalPages={totalPages} disabled={fetchingPage} onChange={goToPage} />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
