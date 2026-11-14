import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

/**
 * Owns the users list URL state: page, name/email filters (debounced into the URL)
 * and the controlled filter inputs.
 */
export function useUsersListParams() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const nameParam = params.get("name") ?? "";
  const emailParam = params.get("email") ?? "";

  const [nameInput, setNameInput] = useState(nameParam);
  const [emailInput, setEmailInput] = useState(emailParam);
  const debName = useDebouncedValue(nameInput, 300);
  const debEmail = useDebouncedValue(emailInput, 300);

  // Latest values for effects/callbacks that must not re-run when the URL changes.
  const latest = useRef({ setParams, nameParam, emailParam });
  useEffect(() => {
    latest.current = { setParams, nameParam, emailParam };
  });

  useEffect(() => {
    const { setParams: set, nameParam: n, emailParam: e } = latest.current;
    if (debName === n && debEmail === e) return;
    const next = new URLSearchParams();
    if (debName) next.set("name", debName);
    if (debEmail) next.set("email", debEmail);
    set(next, { replace: true });
  }, [debName, debEmail]);

  const goToPage = useCallback((p: number) => {
    latest.current.setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (p <= 1) next.delete("page");
      else next.set("page", String(p));
      return next;
    });
    window.scrollTo?.({ top: 0 });
  }, []);

  const clearFilters = useCallback(() => {
    setNameInput("");
    setEmailInput("");
    latest.current.setParams(new URLSearchParams(), { replace: true });
  }, []);

  return {
    page,
    nameParam,
    emailParam,
    nameInput,
    emailInput,
    setNameInput,
    setEmailInput,
    goToPage,
    clearFilters,
  };
}
