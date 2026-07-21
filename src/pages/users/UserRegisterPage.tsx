import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { isForbiddenError } from '../../api/client/errorPolicy';
import { AccessDeniedState } from '../../components/feedback/AccessDeniedState';
import { useSession } from '../../features/auth/sessionStore';
import { useCreateUser } from '../../features/users/useCreateUser';

interface UserRegisterForm {
  name: string;
  email: string;
  password: string;
}

export function UserRegisterPage() {
  const { register, handleSubmit, reset } = useForm<UserRegisterForm>();
  const { session } = useSession();
  const createUser = useCreateUser(session?.accessToken);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['users:read']);

  if (isForbiddenError(createUser.error)) {
    return <AccessDeniedState />;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">User Register</h1>
      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await createUser.mutateAsync({
            ...values,
            roles: selectedRoles
          });
          reset();
        })}
      >
        <input {...register('name')} className="w-full rounded bg-slate-800 p-3" placeholder="Nome" />
        <input {...register('email')} className="w-full rounded bg-slate-800 p-3" placeholder="E-mail" />
        <input {...register('password')} type="password" className="w-full rounded bg-slate-800 p-3" placeholder="Senha" />
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Roles</legend>
          {['users:read', 'users:write', 'movies:read', 'movies-watch:write', 'movies:write'].map((role) => (
            <label key={role} className="block text-sm">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={(event) => {
                  setSelectedRoles((current) =>
                    event.target.checked ? [...current, role] : current.filter((item) => item !== role)
                  );
                }}
              />{' '}
              {role}
            </label>
          ))}
        </fieldset>
        <button type="submit" className="rounded bg-cyan-700 px-4 py-2">Criar usuário</button>
        {createUser.isSuccess ? <p className="text-emerald-400">Usuário criado com sucesso.</p> : null}
        {createUser.isError && !isForbiddenError(createUser.error) ? (
          <p className="text-red-400">Falha ao criar usuário.</p>
        ) : null}
      </form>
    </main>
  );
}
