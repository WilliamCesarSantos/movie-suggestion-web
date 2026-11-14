type RoleChipsProps = { roles: string[] };

const chip = "rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200";

export function RoleChips({ roles }: RoleChipsProps) {
  const visible = roles.slice(0, 2);
  const extra = roles.length - visible.length;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((r) => (
        <span key={r} className={chip}>
          {r}
        </span>
      ))}
      {extra > 0 && (
        <span className={chip} title={roles.join(", ")}>
          +{extra}
        </span>
      )}
    </div>
  );
}
