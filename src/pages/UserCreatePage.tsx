import { Link } from "react-router-dom";
import { Header } from "@/components/Header/Header";
import { UserForm } from "@/components/UserForm/UserForm";

export function UserCreatePage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Link to="/users" className="text-sm text-neutral-300 hover:text-white">
          &lt; Voltar para Usuários
        </Link>
        <h1 className="mb-6 mt-3 text-2xl font-semibold">Novo usuário</h1>
        <UserForm mode="create" />
      </main>
    </div>
  );
}
