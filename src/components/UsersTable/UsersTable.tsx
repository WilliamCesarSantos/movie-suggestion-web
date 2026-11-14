import { RoleChips } from "@/components/RoleChips/RoleChips";
import { UserEditLink } from "@/components/UserEditLink/UserEditLink";
import type { ListUsersItem } from "@/api/types";

type UsersTableProps = { users: ListUsersItem[]; canWrite: boolean; busy: boolean };

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : dateFmt.format(d);
}

export function UsersTable({ users, canWrite, busy }: UsersTableProps) {
  return (
    <table aria-busy={busy || undefined} className="hidden w-full text-left text-sm sm:table">
      <thead className="border-b border-white/10 text-neutral-400">
        <tr>
          <th scope="col" className="px-3 py-2 font-medium">Nome</th>
          <th scope="col" className="px-3 py-2 font-medium">E-mail</th>
          <th scope="col" className="px-3 py-2 font-medium">Roles</th>
          <th scope="col" className="hidden px-3 py-2 font-medium lg:table-cell">Criado em</th>
          {canWrite && <th scope="col" className="px-3 py-2 text-right font-medium">Ações</th>}
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="border-b border-white/5 hover:bg-neutral-800/50">
            <td className="px-3 py-2">{u.name}</td>
            <td className="px-3 py-2">{u.email}</td>
            <td className="px-3 py-2">
              <RoleChips roles={u.roles} />
            </td>
            <td className="hidden px-3 py-2 lg:table-cell">{formatDate(u.createdAt)}</td>
            {canWrite && (
              <td className="px-3 py-2 text-right">
                <UserEditLink user={u} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
