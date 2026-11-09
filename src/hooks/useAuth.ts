import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "@/api/auth";
import { storage } from "@/lib/storage";

type AuthState = {
  isAuthenticated: boolean;
  roles: string[];
};

function readAuthState(): AuthState {
  const token = storage.getToken();
  return {
    isAuthenticated: token !== null,
    roles: token !== null ? storage.getRoles() : [],
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
    setState({ isAuthenticated: true, roles: res.roles ?? [] });
    return res;
  }, []);

  const logout = useCallback(() => {
    storage.clearToken();
    setState({ isAuthenticated: false, roles: [] });
    navigate("/login", { replace: true });
  }, [navigate]);

  return {
    isAuthenticated: state.isAuthenticated,
    roles: state.roles,
    login,
    logout,
  };
}
