import { TextField } from "@/components/TextField/TextField";

type UsersFiltersProps = {
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onClear: () => void;
};

export function UsersFilters({ name, email, onNameChange, onEmailChange, onClear }: UsersFiltersProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="sm:w-64">
        <TextField label="Nome" value={name} onChange={(e) => onNameChange(e.target.value)} />
      </div>
      <div className="sm:w-72">
        <TextField label="E-mail" value={email} onChange={(e) => onEmailChange(e.target.value)} />
      </div>
      <button
        type="button"
        onClick={onClear}
        className="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        Limpar
      </button>
    </div>
  );
}
