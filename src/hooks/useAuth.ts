import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "@/api/auth";
import { storage } from "@/lib/storage";
import { queryClient } from "@/lib/queryClient";

type AuthState = {
  isAuthenticated: boolean;
  roles: string[];
  email: string | null;
};

function readAuthState(): AuthState {
  const token = storage.getToken();
  return {
    isAuthenticated: token !== null,
    roles: token !== null ? storage.getRoles() : [],
    email: token !== null ? storage.getEmail() : null,
  };
}

export function useAuth() {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(() => readAuthState());

  useEffect(() => {
    const onStorage = () => setState(readAuthState());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi({ email, password });
    storage.setToken(res.token);
    storage.setRoles(res.roles ?? []);
    storage.setEmail(res.email ?? email);
    setState({ isAuthenticated: true, roles: res.roles ?? [], email: res.email ?? email });
    return res;
  }, []);

  const logout = useCallback(() => {
    storage.clearToken();
    queryClient.clear();
    setState({ isAuthenticated: false, roles: [], email: null });
    navigate("/login", { replace: true });
  }, [navigate]);

  return {
    isAuthenticated: state.isAuthenticated,
    roles: state.roles,
    email: state.email,
    login,
    logout,
  };
}
