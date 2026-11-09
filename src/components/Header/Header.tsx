import { useAuth } from "@/hooks/useAuth";
import { Menu } from "@/components/Menu/Menu";

export function Header() {
  const { email, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-background/95 px-4 py-3 backdrop-blur">
      <span className="text-lg font-bold tracking-wide text-accent">MovieSuggestion</span>
      <Menu />
      <div className="ml-auto flex items-center gap-3">
        {email && <span className="hidden max-w-[200px] truncate text-sm text-neutral-300 sm:inline">{email}</span>}
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
