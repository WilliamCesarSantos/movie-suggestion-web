---
name: write-react-code
description: Padrões de código React/TypeScript para o projeto movie-suggestion-web. Use ao implementar componentes, hooks, chamadas de API ou páginas.
---

# Write React Code

Padrões obrigatórios ao escrever código no projeto.

## Estrutura de pastas
```
src/
├── api/
│   ├── client.ts         # axios configurado + interceptor de token
│   ├── types.ts          # DTOs espelhando openapi.yml
│   ├── movies.ts         # getMovies, getMovieById, recordWatched
│   └── auth.ts           # login
├── components/
│   ├── MovieCard/
│   │   ├── MovieCard.tsx
│   │   └── index.ts
│   └── ...
├── hooks/
│   ├── useInfiniteMovies.ts
│   └── useAuth.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── CatalogPage.tsx
│   └── MovieDetailsPage.tsx
├── routes/
│   └── AppRouter.tsx
├── lib/
│   └── storage.ts        # wrapper do localStorage
├── App.tsx
└── main.tsx
```

## Padrões de componente
```tsx
import type { MovieSummary } from "@/api/types";

type MovieCardProps = {
  movie: MovieSummary;
  onClick: (id: string) => void;
};

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(movie.id)}
      className="group relative overflow-hidden rounded-lg transition hover:scale-105"
    >
      <img
        src={movie.poster}
        alt={`${movie.title} (${movie.year})`}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </button>
  );
}
```

## Padrão de chamada de API (TanStack Query)
```ts
export function useInfiniteMovies(title?: string) {
  return useInfiniteQuery({
    queryKey: ["movies", title ?? ""],
    queryFn: ({ pageParam }) => getMovies({ cursor: pageParam, title }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.nextCursor : undefined,
    staleTime: 60_000,
  });
}
```

## Scroll infinito
Use `IntersectionObserver` em um sentinela no final da lista:
```tsx
const sentinelRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const el = sentinelRef.current;
  if (!el) return;
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, { rootMargin: "400px" });
  io.observe(el);
  return () => io.disconnect();
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);
```

## Autenticação
- Token em `localStorage` sob chave `movie_token`.
- Axios interceptor adiciona `Authorization: Bearer <token>`.
- Response interceptor: 401 → limpa token e redireciona para `/login`.

## Simulação de reprodução
Modal com barra de progresso animada via `setInterval` ou CSS `@keyframes`. Nunca use `<video>` real. Botão "Fechar" sempre acessível.

## Proibições
- Nada de `any` ou `@ts-ignore` sem comentário justificando.
- Nada de `useState` para dados do servidor — use TanStack Query.
- Nada de inline styles — Tailwind apenas.
- Nada de `index` como `key` quando a lista muda.
