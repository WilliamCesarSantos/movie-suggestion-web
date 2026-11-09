import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/roles";

type ProtectedRouteProps = {
  children: ReactNode;
  requireAuth: boolean;
  requireRoles?: string | string[];
};

export function ProtectedRoute({ children, requireAuth, requireRoles }: ProtectedRouteProps) {
  const { isAuthenticated, roles } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireRoles && !hasRole(roles, requireRoles)) {
    return (
      <main
        role="alert"
        aria-live="assertive"
        className="flex min-h-screen w-full items-center justify-center bg-[#0b0b0f] px-6"
      >
        <section className="w-full max-w-md rounded-2xl bg-[#17171d] p-8 text-center shadow-xl">
          <h1 className="text-xl font-semibold text-white">Acesso negado</h1>
          <p className="mt-3 text-sm text-neutral-300">
            Você não tem permissão para acessar esta página.
          </p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#e50914] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c1070f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#17171d]"
          >
            Voltar ao catálogo
          </Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
