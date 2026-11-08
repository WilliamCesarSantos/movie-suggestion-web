---
name: analyze-code-quality
description: Checklist de boas práticas para analisar o código React/TypeScript do projeto. Use ao revisar PRs ou código entregue pelo react-developer.
---

# Analyze Code Quality

Aplique este checklist em cada arquivo revisado.

## 1. TypeScript
- [ ] Sem `any` sem comentário justificando.
- [ ] Sem `as X` sem validação prévia.
- [ ] Props e retornos de funções públicas tipados explicitamente.
- [ ] DTOs da API batem com `openapi.yml`.

## 2. React
- [ ] Hooks no topo, nunca dentro de `if`/`for`.
- [ ] `useEffect` com array de dependências correto.
- [ ] Sem loops de renderização (`setState` dentro de render).
- [ ] Keys em listas são IDs estáveis, não índices.
- [ ] Memoização (`useMemo`, `useCallback`) justificada por medição ou dependência de referência estável.

## 3. Componentização
- [ ] Componente < 150 linhas. Se maior, sugerir split.
- [ ] Responsabilidade única: renderização OU lógica, não ambos misturados.
- [ ] Props drilling > 2 níveis → sugerir contexto ou composição.

## 4. API e estado
- [ ] Sem fetch fora de TanStack Query ou action handler.
- [ ] Erros tratados — nunca `.catch(() => {})` silencioso.
- [ ] Estados de loading/erro/vazio renderizados.
- [ ] `staleTime` definido explicitamente para queries.

## 5. Acessibilidade
- [ ] Botões usam `<button type="button">`.
- [ ] Links usam `<a>` ou `<Link>` do router — não `onClick` em `<div>`.
- [ ] Imagens têm `alt` descritivo.
- [ ] Inputs têm `<label>` associado.
- [ ] Modais têm `role="dialog"`, `aria-modal`, focus trap.
- [ ] Contraste de texto AA (verificar visualmente no `app-validator`).

## 6. Performance
- [ ] Imagens fora do viewport inicial com `loading="lazy"`.
- [ ] Listas longas sem virtualização? OK se < 200 itens visíveis; acima disso, sugerir.
- [ ] `IntersectionObserver` e event listeners são removidos no cleanup.

## 7. Segurança
- [ ] Sem `dangerouslySetInnerHTML`.
- [ ] Token nunca em `console.log`.
- [ ] URLs de terceiros (posters) exibidas apenas via `<img src>`, nunca em `href` de link clicável.

## 8. Testabilidade
- [ ] Lógica complexa extraída para hook/função pura, facilitando testes.
- [ ] Sem dependência global escondida (ex: `Date.now()` direto em lógica — use clock injetável).

## Formato do report
Para cada arquivo:
```
### src/components/MovieCard/MovieCard.tsx

🟢 OK em: TypeScript, React hooks, acessibilidade.
🟡 Sugestão L23: considere extrair o `onClick` para `useCallback` se este componente for renderizado dentro de uma lista grande.
🔴 Bloqueante L45: `key={index}` em lista que pode reordenar — use `movie.id`.
```
