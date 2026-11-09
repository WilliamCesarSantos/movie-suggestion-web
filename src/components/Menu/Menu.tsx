import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useHasRole } from "@/hooks/useHasRole";

const linkClass = "block rounded px-3 py-2 text-sm text-white hover:bg-white/10";

export function Menu() {
  const [open, setOpen] = useState(false);
  const canList = useHasRole(["users:read", "users:write"]);
  const canEdit = useHasRole(["users:write"]);
  const canImport = useHasRole(["movies:write"]);

  const navRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  if (!canList && !canEdit && !canImport) {
    return null;
  }


  const close = () => setOpen(false);

  return (
    <nav ref={navRef} aria-label="Principal" className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="main-menu"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg px-3 py-1.5 text-sm text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Menu
      </button>
      {open && (
        <ul
          id="main-menu"
          className="fixed inset-x-0 top-[57px] z-40 max-h-[80vh] overflow-y-auto border-b border-white/10 bg-surface p-3 shadow-xl sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-2 sm:w-56 sm:rounded-lg sm:border"
        >
          {(canList || canEdit) && (
            <li>
              <p className="px-3 pt-2 text-xs font-semibold uppercase text-neutral-400">Usuários</p>
              <ul>
                {canList && (
                  <li>
                    <Link to="/users" className={linkClass} onClick={close}>
                      Listar
                    </Link>
                  </li>
                )}
                {canEdit && (
                  <li>
                    <Link to="/users/new" className={linkClass} onClick={close}>
                      Cadastrar
                    </Link>
                  </li>
                )}
                {canEdit && (
                  <li>
                    <Link to="/users?mode=edit" className={linkClass} onClick={close}>
                      Editar
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          )}
          {canImport && (
            <li>
              <p className="px-3 pt-2 text-xs font-semibold uppercase text-neutral-400">Filme</p>
              <ul>
                <li>
                  <Link to="/movies-import" className={linkClass} onClick={close}>
                    Importar
                  </Link>
                </li>
              </ul>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
}
