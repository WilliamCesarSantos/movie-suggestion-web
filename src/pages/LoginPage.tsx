import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthCard } from "@/components/AuthCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/hooks/useAuth";

type LoginStatus = "idle" | "submitting" | "error" | "success-redirecting";

function mapLoginError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 400) {
      return "Preencha email e senha corretamente.";
    }
    if (status === 401) {
      return "Email ou senha inválidos.";
    }
  }
  return "Não foi possível entrar agora. Tente novamente em instantes.";
}

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/catalog", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status === "error") {
      alertRef.current?.focus();
    }
  }, [status]);

  const trimmedEmail = email.trim();
  const canSubmit =
    trimmedEmail.length > 0 &&
    password.length > 0 &&
    status !== "submitting" &&
    status !== "success-redirecting";

  const isBusy = status === "submitting" || status === "success-redirecting";

  const handleFieldChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    if (errorMessage) {
      setErrorMessage(null);
      setStatus((prev) => (prev === "error" ? "idle" : prev));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    setStatus("submitting");
    setErrorMessage(null);
    try {
      await login(trimmedEmail, password);
      setStatus("success-redirecting");
      navigate("/catalog", { replace: true });
    } catch (error) {
      setErrorMessage(mapLoginError(error));
      setStatus("error");
    }
  };

  return (
    <AuthCard title="Entrar na sua conta">
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={handleSubmit}
      >
        <TextField
          ref={emailInputRef}
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          readOnly={isBusy}
          aria-describedby={errorMessage ? "login-error" : undefined}
          onChange={(event) => handleFieldChange(setEmail)(event.target.value)}
          placeholder="you@email.com"
        />
        <TextField
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={1}
          value={password}
          readOnly={isBusy}
          aria-describedby={errorMessage ? "login-error" : undefined}
          onChange={(event) => handleFieldChange(setPassword)(event.target.value)}
          placeholder="••••••••"
        />

        {errorMessage ? (
          <p
            id="login-error"
            ref={alertRef}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
            className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {errorMessage}
          </p>
        ) : null}

        <PrimaryButton
          type="submit"
          aria-label="Entrar"
          disabled={!canSubmit}
          isLoading={isBusy}
          loadingLabel="Entrando..."
        >
          Entrar
        </PrimaryButton>
      </form>
    </AuthCard>
  );
}
