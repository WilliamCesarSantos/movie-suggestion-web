---
name: write-unit-tests
description: Padrões para testes unitários com Vitest e React Testing Library. Use ao escrever arquivos *.test.tsx para componentes e hooks.
---

# Write Unit Tests

Testes unitários validam um componente ou hook isoladamente.

## Stack
- Vitest (runner compatível com Jest).
- React Testing Library (`@testing-library/react`).
- `@testing-library/user-event` para interações.
- `@testing-library/jest-dom` para matchers (`toBeInTheDocument`, etc.).

## Localização
Ao lado do arquivo testado:
```
src/components/MovieCard/MovieCard.tsx
src/components/MovieCard/MovieCard.test.tsx
```

## Template de componente
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieCard } from "./MovieCard";

const sampleMovie = {
  id: "abc-123",
  title: "The Matrix",
  year: "1999",
  poster: "https://example.com/poster.jpg",
  imdbRating: 8.7,
};

describe("MovieCard", () => {
  it("renders the poster with accessible alt text", () => {
    render(<MovieCard movie={sampleMovie} onClick={() => {}} />);
    expect(screen.getByAltText("The Matrix (1999)")).toBeInTheDocument();
  });

  it("calls onClick with movie id when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<MovieCard movie={sampleMovie} onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith("abc-123");
  });
});
```

## Template de hook
```ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useAuth } from "./useAuth";

describe("useAuth", () => {
  it("starts unauthenticated", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

## Regras
- **Selectors**: sempre priorize `getByRole`, `getByLabelText`, `getByAltText`, `getByText`. `data-testid` é último recurso.
- **Async**: use `findBy*` em vez de `waitFor` + `getBy*`.
- **Mocks**: mocke apenas boundaries (fetch, localStorage). Nunca mocke o componente sendo testado.
- **Setup/teardown**: `beforeEach(() => vi.clearAllMocks())` quando usar `vi.fn()`.
- **Nomes**: `it("renders X", ...)`, `it("calls Y when Z", ...)` — descritivo.

## Cobertura mínima por componente
1. Renderização com props mínimas.
2. Cada ramo visual (loading, erro, vazio, sucesso) se aplicável.
3. Cada interação do usuário.
4. Regressões já encontradas (um teste por bug fixado).
