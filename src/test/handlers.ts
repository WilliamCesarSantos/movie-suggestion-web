import { http, HttpResponse } from "msw";

const API = "http://localhost:8080/api/v1";

export type MockUser = { id: string; name: string; email: string; roles: string[]; createdAt: string };

/** 45 deterministic users: "User 01" ... "User 45" (3 pages of 20). Built fresh per call, no shared state. */
export function buildUsers(count = 45): MockUser[] {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: `u${n}`,
      name: `User ${n}`,
      email: `user${n}@example.com`,
      roles: ["movies:read"],
      createdAt: "2026-05-30T12:00:00Z",
    };
  });
}

export const handlers = [
  http.post(`${API}/login`, async () => {
    return HttpResponse.json({
      token: "test-token",
      email: "test@example.com",
      roles: ["*"],
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    });
  }),

  http.get(`${API}/movies`, ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    if (!cursor) {
      return HttpResponse.json({
        data: [
          { id: "1", title: "The Matrix", year: "1999", poster: "https://example.com/1.jpg", imdbRating: 8.7 },
          { id: "2", title: "Inception", year: "2010", poster: "https://example.com/2.jpg", imdbRating: 8.8 },
        ],
        nextCursor: "page2",
        prevCursor: null,
        hasNext: true,
        hasPrev: false,
        limit: 10,
        count: 2,
        total: 4,
      });
    }
    return HttpResponse.json({
      data: [
        { id: "3", title: "Interstellar", year: "2014", poster: "https://example.com/3.jpg", imdbRating: 8.6 },
        { id: "4", title: "Blade Runner 2049", year: "2017", poster: "https://example.com/4.jpg", imdbRating: 8.0 },
      ],
      nextCursor: null,
      prevCursor: "page1",
      hasNext: false,
      hasPrev: true,
      limit: 10,
      count: 2,
      total: 4,
    });
  }),

  http.get(`${API}/users`, ({ request }) => {
    const url = new URL(request.url);
    const name = (url.searchParams.get("name") ?? "").toLowerCase();
    const email = (url.searchParams.get("email") ?? "").toLowerCase();
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
    const all = buildUsers().filter(
      (u) => u.name.toLowerCase().includes(name) && u.email.toLowerCase().includes(email)
    );
    const start = (page - 1) * pageSize;
    return HttpResponse.json({ data: all.slice(start, start + pageSize), total: all.length, page, pageSize });
  }),

  http.post(`${API}/users`, async ({ request }) => {
    const body = (await request.json()) as { name: string; email: string; roles: string[] };
    return HttpResponse.json(
      { id: "new-id", name: body.name, email: body.email, roles: body.roles, createdAt: "2026-11-13T10:00:00Z" },
      { status: 201 }
    );
  }),

  http.get(`${API}/users/:id`, ({ params }) => {
    const u = buildUsers().find((x) => x.id === params.id);
    if (!u) return HttpResponse.json({ message: "not found" }, { status: 404 });
    return HttpResponse.json({ ID: u.id, Name: u.name, Email: u.email, CreatedAt: u.createdAt });
  }),

  http.patch(`${API}/users/:id`, async ({ params, request }) => {
    const u = buildUsers().find((x) => x.id === params.id);
    if (!u) return HttpResponse.json({ message: "not found" }, { status: 404 });
    const body = (await request.json()) as { name?: string; roles?: string[] };
    return HttpResponse.json({ ...u, name: body.name ?? u.name, roles: body.roles ?? u.roles });
  }),
];
