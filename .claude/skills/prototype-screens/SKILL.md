---
name: prototype-screens
description: Padrão oficial para prototipar telas do catálogo em wireframes textuais. Use sempre que precisar criar ou atualizar um protótipo em docs/prototypes/.
---

# Prototype Screens

Produza wireframes textuais consistentes antes do código ser escrito.

## Localização
Salve em `docs/prototypes/<kebab-case>.md`. Exemplos:
- `docs/prototypes/login.md`
- `docs/prototypes/catalog.md`
- `docs/prototypes/movie-details.md`
- `docs/prototypes/player-simulation.md`

## Template

```markdown
# <Nome da Tela>

## Objetivo
<1-2 frases sobre o propósito da tela>

## Rota
`/catalog`

## Dados da API
- `GET /api/v1/movies?limit=20&cursor=<opaque>` → `RecommendationsPageResponse`
- Campos exibidos: `id`, `title`, `year`, `poster`, `imdbRating`

## Wireframe (desktop)
```
+---------------------------------------------------------------+
| LOGO              Pesquisar...              [Avatar | Sair]    |
+---------------------------------------------------------------+
| [Poster] [Poster] [Poster] [Poster] [Poster] [Poster]          |
| [Poster] [Poster] [Poster] [Poster] [Poster] [Poster]          |
| ...                                                            |
|                       (carregando ao chegar no fim)            |
+---------------------------------------------------------------+
```

## Wireframe (mobile)
```
+-----------------+
| LOGO     [☰]    |
+-----------------+
| [Poster][Poster]|
| [Poster][Poster]|
| [Poster][Poster]|
+-----------------+
```

## Estados
- **Loading inicial**: skeleton de 12 cards.
- **Vazio**: mensagem "Nenhum filme encontrado" com CTA.
- **Erro**: card de erro com botão "Tentar novamente".
- **Sucesso**: grid com posters.
- **Carregando próxima página**: spinner no final do grid.

## Interações
- Clique no poster → `/movies/:id`.
- Scroll até 80% da página → dispara `fetchNextPage`.
- Clique em "Sair" → limpa token e redireciona para `/login`.

## Responsividade
- `< 640px`: 2 colunas.
- `640–1024px`: 4 colunas.
- `> 1024px`: 6 colunas.

## Acessibilidade
- Cada poster tem `alt="<title> (<year>)"`.
- Botão "Sair" com `aria-label`.
- Foco visível em todos os elementos interativos.
```

## Regras
- Sempre inclua wireframe desktop E mobile.
- Nunca omita estados de loading/erro/vazio.
- Liste explicitamente os campos consumidos da API — isso vira contrato com o react-developer.
- Reuse componentes entre telas (ex: `MovieCard`, `Header`) — mencione isso no protótipo.
