import { ASSIGNABLE_ROLES } from "./roles";

type RolesFieldsetProps = {
  isEdit: boolean;
  selected: string[];
  preserved: string[];
  error?: string;
  disabled: boolean;
  onToggle: (role: string) => void;
};

export function RolesFieldset({ isEdit, selected, preserved, error, disabled, onToggle }: RolesFieldsetProps) {
  return (
    <fieldset disabled={disabled} aria-describedby={error ? "user-roles-error" : undefined}>
      <legend className="mb-2 text-sm font-medium text-neutral-200">
        {isEdit ? "Roles" : "Roles * (selecione ao menos uma)"}
      </legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ASSIGNABLE_ROLES.map((role, i) => (
          <label key={role} className="flex items-center gap-2 text-sm text-neutral-200">
            <input
              id={i === 0 ? "user-roles-first" : undefined}
              type="checkbox"
              checked={selected.includes(role)}
              onChange={() => onToggle(role)}
              className="h-4 w-4 accent-[#e50914]"
            />
            {role}
          </label>
        ))}
      </div>
      {preserved.length > 0 && (
        <p className="mt-2 text-xs text-neutral-400">Roles especiais mantidas ao salvar: {preserved.join(", ")}.</p>
      )}
      {error && (
        <p id="user-roles-error" className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </fieldset>
  );
}
