import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "@/api/auth";
import { storage } from "@/lib/storage";

export function useAuth() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storage.getToken() !== null);

  useEffect(() => {
    const onStorage = () => setIsAuthenticated(storage.getToken() !== null);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginApi({ email, password });
      storage.setToken(res.token);
      setIsAuthenticated(true);
      return res;
    },
    []
  );

  const logout = useCallback(() => {
    storage.clearToken();
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  return { isAuthenticated, login, logout };
}
