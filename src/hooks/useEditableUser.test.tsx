import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { useEditableUser } from "./useEditableUser";
import type { ListUsersItem } from "@/api/types";

const API = "http://localhost:8080/api/v1";

const item: ListUsersItem = {
  id: "u07",
  name: "User 07",
  email: "user07@example.com",
  roles: ["users:read"],
  createdAt: "2026-05-30T12:00:00Z",
};

function setup(client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

describe("useEditableUser", () => {
  it("uses router state without any request", () => {
    let calls = 0;
    server.use(
      http.get(`${API}/users/:id`, () => {
        calls++;
        return HttpResponse.json({});
      })
    );
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditableUser("u07", item), { wrapper });
    expect(result.current.user).toEqual(item);
    expect(result.current.isLoading).toBe(false);
    expect(calls).toBe(0);
  });

  it("ignores router state for a different id", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditableUser("u08", item), { wrapper });
    await waitFor(() => expect(result.current.user?.id).toBe("u08"));
  });

  it("falls back to the cached list", () => {
    const { client, wrapper } = setup();
    client.setQueryData(["users", "list", 1, "", ""], { data: [item], total: 1, page: 1, pageSize: 20 });
    const { result } = renderHook(() => useEditableUser("u07", null), { wrapper });
    expect(result.current.user).toEqual(item);
    expect(result.current.isLoading).toBe(false);
  });

  it("resolves via GET /users/{id} then GET /users?email= (roles come from the list)", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditableUser("u05", null), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.user?.id).toBe("u05"));
    expect(result.current.user?.roles).toEqual(["movies:read"]);
  });

  it("surfaces a 403 from the detail endpoint", async () => {
    server.use(http.get(`${API}/users/:id`, () => HttpResponse.json({ message: "forbidden" }, { status: 403 })));
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditableUser("u05", null), { wrapper });
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.user).toBeNull();
  });

  it("errors when the list does not contain the user", async () => {
    server.use(http.get(`${API}/users`, () => HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 1 })));
    const { wrapper } = setup();
    const { result } = renderHook(() => useEditableUser("u05", null), { wrapper });
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.user).toBeNull();
  });
});
