import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLogin } from '../../features/auth/useLogin';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<LoginFormValues>();
  const { login } = useLogin();

  return (
    <main className="login-page">
      <form
        className="login-card"
        onSubmit={handleSubmit(async (values) => {
          setError(null);
          try {
            await login(values);
          } catch {
            setError('Falha no login. Verifique suas credenciais.');
          }
        })}
      >
        <h1 className="login-brand">Watch your movies</h1>

        <div className="login-field-group">
          <label className="login-label" htmlFor="email">
            E-mail
          </label>
          <input
            {...register('email')}
            id="email"
            className="login-input"
            type="email"
            autoComplete="email"
            placeholder="Digite seu e-mail"
          />
        </div>

        <div className="login-field-group">
          <label className="login-label" htmlFor="password">
            Senha
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="current-password"
            className="login-input"
            placeholder="Digite sua senha"
          />
        </div>

        <p className="login-error" role="alert" aria-live="polite">
          {error ?? ' '}
        </p>

        <button type="submit" className="login-submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
