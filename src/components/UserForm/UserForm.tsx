import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { TextField } from "@/components/TextField/TextField";
import { PrimaryButton } from "@/components/PrimaryButton/PrimaryButton";
import { useUserFormSubmit } from "@/hooks/useUserFormSubmit";
import { RolesFieldset } from "./RolesFieldset";
import { isUserRole } from "./roles";

export { ASSIGNABLE_ROLES } from "./roles";

type UserFormProps = {
  mode: "create" | "edit";
  userId?: string;
  initial?: { name: string; email: string; roles: string[] };
  isOwner?: boolean;
};

type Errors = { name?: string; email?: string; password?: string; roles?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function focusField(field: keyof Errors): void {
  const id = field === "roles" ? "user-roles-first" : `user-${field}`;
  document.getElementById(id)?.focus();
}

function sameRoles(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((r) => b.includes(r));
}

export function UserForm({ mode, userId, initial, isOwner = false }: UserFormProps) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";
  const canEditProfile = !isEdit || isOwner;

  const initialRoles = useMemo(
    () => (initial?.roles ?? (isEdit ? [] : ["movies:read"])).filter((r) => isUserRole(r)),
    [initial, isEdit]
  );

  // Roles outside the assignable list (e.g. wildcard "*") cannot be toggled here; keep them on save.
  const preservedRoles = useMemo(
    () => (isEdit ? (initial?.roles ?? []).filter((r) => !isUserRole(r)) : []),
    [initial, isEdit]
  );

  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<string[]>(initialRoles);
  const [errors, setErrors] = useState<Errors>({});
  const [focusTarget, setFocusTarget] = useState<keyof Errors | null>(null);

  const rolesChanged = !sameRoles(roles, initialRoles);
  const { submit, isSubmitting, banner, clearBanner } = useUserFormSubmit({
    isEdit,
    isOwner,
    userId,
    initialName: initial?.name ?? "",
    rolesChanged,
    preservedRoles,
    onEmailConflict: () => {
      setErrors({ email: "Este e-mail já está cadastrado." });
      setFocusTarget("email");
    },
  });

  // Fields are disabled while submitting; focus once they are enabled again.
  useEffect(() => {
    if (focusTarget === null || isSubmitting) return;
    focusField(focusTarget);
    setFocusTarget(null);
  }, [focusTarget, isSubmitting]);

  const dirty = isEdit
    ? (canEditProfile && (name.trim() !== (initial?.name ?? "") || password !== "")) ||
      rolesChanged
    : true;

  const toggleRole = (role: string) =>
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));

  const validate = (): Errors => {
    const e: Errors = {};
    if (canEditProfile && !name.trim()) e.name = "O nome é obrigatório.";
    if (!isEdit && !EMAIL_RE.test(email.trim())) e.email = "Informe um e-mail válido.";
    if (!isEdit && password.length < 6) e.password = "A senha deve ter no mínimo 6 caracteres.";
    if (isEdit && isOwner && password !== "" && password.length < 6) {
      e.password = "A senha deve ter no mínimo 6 caracteres.";
    }
    if (roles.length === 0 && preservedRoles.length === 0) e.roles = "Selecione ao menos uma role.";
    return e;
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    clearBanner();
    const found = validate();
    setErrors(found);
    const first = (["name", "email", "password", "roles"] as const).find((k) => found[k]);
    if (first) {
      focusField(first);
      return;
    }
    submit({ name, email, password, roles });
  };

  const onCancel = () => {
    if (dirty && isEdit && !window.confirm("Descartar alterações?")) return;
    navigate("/users");
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-busy={isSubmitting || undefined}
      className="w-full max-w-xl space-y-5 rounded-2xl bg-[#17171d] p-6 shadow-xl"
    >
      {banner && (
        <div role="alert" className="rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-200">
          {banner}
        </div>
      )}
      {isEdit && !isOwner && (
        <p className="rounded-lg bg-neutral-800 px-4 py-3 text-sm text-neutral-300">
          Você pode alterar apenas as roles deste usuário. Nome e senha só podem ser alterados pelo próprio usuário.
        </p>
      )}

      <TextField
        id="user-name"
        label={isEdit ? "Nome" : "Nome *"}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        disabled={isSubmitting || !canEditProfile}
        aria-disabled={!canEditProfile || undefined}
        autoComplete="off"
      />
      <TextField
        id="user-email"
        label={isEdit ? "E-mail (não pode ser alterado)" : "E-mail *"}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        disabled={isSubmitting || isEdit}
        aria-disabled={isEdit || undefined}
        autoComplete="off"
      />
      <div className="flex items-end gap-2">
        <TextField
          id="user-password"
          label={isEdit ? "Nova senha (opcional, mínimo 6)" : "Senha * (mínimo 6 caracteres)"}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint={isEdit && isOwner ? "Deixe em branco para manter a atual." : undefined}
          disabled={isSubmitting || !canEditProfile}
          aria-disabled={!canEditProfile || undefined}
          autoComplete="new-password"
        />
        <button
          type="button"
          aria-pressed={showPassword}
          onClick={() => setShowPassword((v) => !v)}
          disabled={!canEditProfile}
          className="mb-0.5 rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          {showPassword ? "ocultar" : "mostrar"}
        </button>
      </div>

      <RolesFieldset
        isEdit={isEdit}
        selected={roles}
        preserved={preservedRoles}
        error={errors.roles}
        disabled={isSubmitting}
        onToggle={toggleRole}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-white/20 px-4 py-2.5 text-sm text-white hover:bg-white/10 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          Cancelar
        </button>
        <PrimaryButton
          type="submit"
          className="sm:w-auto"
          isLoading={isSubmitting}
          loadingLabel={isEdit ? "Salvando..." : "Cadastrando..."}
          disabled={isEdit && !dirty}
        >
          {isEdit ? "Salvar" : "Cadastrar"}
        </PrimaryButton>
      </div>
    </form>
  );
}
