import { RoleChips } from "@/components/RoleChips/RoleChips";
import { UserEditLink } from "@/components/UserEditLink/UserEditLink";
import type { ListUsersItem } from "@/api/types";

type UsersCardsProps = { users: ListUsersItem[]; canWrite: boolean };

export function UsersCards({ users, canWrite }: UsersCardsProps) {
  return (
    <ul className="space-y-3 sm:hidden">
      {users.map((u) => (
        <li key={u.id} className="rounded-lg bg-[#17171d] p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium">{u.name}</p>
              <p className="truncate text-sm text-neutral-400">{u.email}</p>
            </div>
            {canWrite && <UserEditLink user={u} />}
          </div>
          <div className="mt-2">
            <RoleChips roles={u.roles} />
          </div>
        </li>
      ))}
    </ul>
  );
}
