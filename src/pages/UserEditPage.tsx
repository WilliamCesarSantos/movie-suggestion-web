import { useEffect } from "react";
import { isAxiosError } from "axios";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header/Header";
import { UserForm } from "@/components/UserForm/UserForm";
import { useAuth } from "@/hooks/useAuth";
import { UserNotFoundError, useEditableUser } from "@/hooks/useEditableUser";
import type { ListUsersItem } from "@/api/types";

function readUserFromState(state: unknown): ListUsersItem | null {
  if (typeof state !== "object" || state === null) return null;
  const user = (state as Record<string, unknown>).user;
  if (typeof user !== "object" || user === null) return null;
  const u = user as Record<string, unknown>;
  const valid =
    typeof u.id === "string" &&
    typeof u.name === "string" &&
    typeof u.email === "string" &&
    typeof u.createdAt === "string" &&
    Array.isArray(u.roles) &&
    u.roles.every((r) => typeof r === "string");
  return valid ? (user as ListUsersItem) : null;
}

export function UserEditPage() {
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { email: myEmail } = useAuth();
  const fromState = readUserFromState(location.state);
  const { user, isLoading, error } = useEditableUser(id, fromState);

  const status = isAxiosError(error) ? error.response?.status : undefined;
  const notFound = status === 404 || error instanceof UserNotFoundError;

  useEffect(() => {
    if (status === 403) {
      navigate("/users", { replace: true, state: { toast: "Abra a edição a partir da listagem." } });
    }
  }, [status, navigate]);

  const isOwner = !!user && !!myEmail && user.email.toLowerCase() === myEmail.toLowerCase();

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Link to="/users" className="text-sm text-neutral-300 hover:text-white">
          &lt; Voltar para Usuários
        </Link>
        <h1 className="mb-6 mt-3 text-2xl font-semibold">Editar usuário</h1>
        {isLoading && (
          <div role="status" aria-busy="true" className="w-full max-w-xl animate-pulse space-y-4 rounded-2xl bg-[#17171d] p-6">
            <span className="sr-only">Carregando...</span>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded bg-neutral-800" />
            ))}
          </div>
        )}
        {notFound && (
          <div role="alert" className="w-full max-w-xl rounded-2xl bg-[#17171d] p-6 text-center">
            <p>Usuário não encontrado.</p>
            <Link to="/users" className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold">
              Voltar para Usuários
            </Link>
          </div>
        )}
        {!isLoading && !user && !notFound && status !== 403 && error !== null && (
          <div role="alert" className="w-full max-w-xl rounded-2xl bg-[#17171d] p-6 text-center">
            <p>Não foi possível carregar o usuário.</p>
            <Link to="/users" className="mt-4 inline-block text-sm text-accent underline">
              Voltar para Usuários
            </Link>
          </div>
        )}
        {user && <UserForm key={user.id} mode="edit" userId={user.id} initial={user} isOwner={isOwner} />}
      </main>
    </div>
  );
}
