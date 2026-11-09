import { Link } from "react-router-dom";

export function UsersListPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background text-white">
      <h1 className="text-2xl font-semibold">Em breve</h1>
      <p className="text-neutral-400">Usuários</p>
      <Link to="/catalog" className="mt-4 text-sm text-accent underline">
        Voltar ao catálogo
      </Link>
    </main>
  );
}
