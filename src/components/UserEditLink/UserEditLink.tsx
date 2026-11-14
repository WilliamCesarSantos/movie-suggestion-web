import { Link } from "react-router-dom";
import type { ListUsersItem } from "@/api/types";

type UserEditLinkProps = { user: ListUsersItem };

function PencilIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
      <path d="M13.6 2.3a1.5 1.5 0 0 1 2.1 0l2 2a1.5 1.5 0 0 1 0 2.1L7.5 16.6 3 17.5l.9-4.5L13.6 2.3z" />
    </svg>
  );
}

export function UserEditLink({ user }: UserEditLinkProps) {
  return (
    <Link
      to={`/users/${user.id}/edit`}
      state={{ user }}
      aria-label={`Editar usuário ${user.name}`}
      title="Editar"
      className="inline-flex h-11 w-11 items-center justify-center rounded text-neutral-300 hover:bg-neutral-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:h-9 sm:w-9"
    >
      <PencilIcon />
    </Link>
  );
}
