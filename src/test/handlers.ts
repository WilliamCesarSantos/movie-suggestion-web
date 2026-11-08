import { http, HttpResponse } from "msw";

const API = "http://localhost:8080/api/v1";

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
];
