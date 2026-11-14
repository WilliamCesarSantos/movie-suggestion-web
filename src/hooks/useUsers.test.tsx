import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { useUsers } from "./useUsers";

const API = "http://localhost:8080/api/v1";

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useUsers", () => {
  it("requests the page with pageSize 20 and omits empty filters", async () => {
    let search = "";
    server.use(
      http.get(`${API}/users`, ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json({ data: [], total: 0, page: 2, pageSize: 20 });
      })
    );
    const { result } = renderHook(() => useUsers(2, { name: "", email: "" }), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const q = new URLSearchParams(search);
    expect(q.get("page")).toBe("2");
    expect(q.get("pageSize")).toBe("20");
    expect(q.has("name")).toBe(false);
    expect(q.has("email")).toBe(false);
  });

  it("sends name and email filters", async () => {
    let search = "";
    server.use(
      http.get(`${API}/users`, ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20 });
      })
    );
    const { result } = renderHook(() => useUsers(1, { name: "ana", email: "a@b" }), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const q = new URLSearchParams(search);
    expect(q.get("name")).toBe("ana");
    expect(q.get("email")).toBe("a@b");
  });

  it("exposes the error on a failed request", async () => {
    server.use(http.get(`${API}/users`, () => HttpResponse.json({ message: "boom" }, { status: 500 })));
    const { result } = renderHook(() => useUsers(1, { name: "", email: "" }), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
