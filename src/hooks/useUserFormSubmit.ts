import { useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useCreateUser } from "@/hooks/useCreateUser";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import type { PatchUserRequest } from "@/api/types";

type SubmitValues = { name: string; email: string; password: string; roles: string[] };

type Options = {
  isEdit: boolean;
  isOwner: boolean;
  userId?: string;
  initialName: string;
  rolesChanged: boolean;
  preservedRoles: string[];
  onEmailConflict: () => void;
};

/** Runs the create/update mutation, navigates on success and maps API errors to a banner or field error. */
export function useUserFormSubmit(opts: Options) {
  const navigate = useNavigate();
  const create = useCreateUser();
  const update = useUpdateUser();
  const [banner, setBanner] = useState<string | null>(null);
  const isSubmitting = create.isPending || update.isPending;

  const handleError = (err: unknown) => {
    const status = isAxiosError(err) ? err.response?.status : undefined;
    if (status === 409) opts.onEmailConflict();
    else if (status === 403) setBanner("Você não tem permissão para realizar esta ação.");
    else if (status === 400) setBanner("Dados inválidos. Revise os campos e tente novamente.");
    else if (status === 404) setBanner("Usuário não encontrado.");
    else setBanner("Não foi possível salvar. Tente novamente em instantes.");
  };

  const submit = (v: SubmitValues) => {
    setBanner(null);
    if (!opts.isEdit) {
      create.mutate(
        { name: v.name.trim(), email: v.email.trim(), password: v.password, roles: v.roles },
        {
          onSuccess: () => navigate("/users", { state: { toast: "Usuário cadastrado com sucesso." } }),
          onError: handleError,
        }
      );
      return;
    }

    const payload: PatchUserRequest = {};
    if (opts.isOwner && v.name.trim() !== opts.initialName) payload.name = v.name.trim();
    if (opts.isOwner && v.password !== "") payload.password = v.password;
    if (opts.rolesChanged) payload.roles = [...v.roles, ...opts.preservedRoles];
    if (!opts.userId || Object.keys(payload).length === 0) return;

    update.mutate(
      { id: opts.userId, payload },
      {
        onSuccess: () => {
          const message =
            opts.isOwner && payload.roles !== undefined
              ? "Usuário atualizado com sucesso. Suas permissões mudam no próximo login."
              : "Usuário atualizado com sucesso.";
          navigate("/users", { state: { toast: message } });
        },
        onError: handleError,
      }
    );
  };

  return { submit, isSubmitting, banner, clearBanner: () => setBanner(null) };
}
