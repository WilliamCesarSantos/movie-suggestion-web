<!--
Sync Impact Report
- Version change: N/A (template) -> 1.0.0
- Modified principles:
	- Template Principle 1 -> I. Stack Tecnologica Oficial
	- Template Principle 2 -> II. Estrutura Modular Simples
	- Template Principle 3 -> III. Gestao de Estado com Hooks Nativos
	- Template Principle 4 -> IV. Integracao de API Tipada e Isolada
	- Template Principle 5 -> V. Curva de Aprendizado Frontend Assistida
- Added sections:
	- Padroes Tecnicos
	- Fluxo de Trabalho e Revisao
- Removed sections:
	- Nenhuma
- Templates requiring updates:
	- .specify/templates/plan-template.md: ✅ updated
	- .specify/templates/spec-template.md: ✅ updated
	- .specify/templates/tasks-template.md: ✅ updated
	- .specify/templates/commands/*.md: ⚠ pending (directory not found)
- Follow-up TODOs:
	- Nenhum
-->

# Front-End Constitution

## Core Principles

### I. Stack Tecnologica Oficial
Todo desenvolvimento frontend MUST usar React com Vite, TypeScript e Tailwind CSS.
Mudancas de stack, substituicao de framework ou adicao de camada concorrente MUST
ser aprovadas antes da implementacao. Rationale: manter consistencia de entrega,
evitar fragmentacao e reduzir custo de manutencao.

### II. Estrutura Modular Simples
A arquitetura de pastas MUST seguir padrao modular simples com foco em:
`src/components`, `src/services` e `src/hooks`.
Novos diretorios so podem ser criados com justificativa clara no artefato da feature.
Rationale: manter navegacao previsivel e reduzir complexidade acidental.

### III. Gestao de Estado com Hooks Nativos
A gestao de estado MUST priorizar hooks nativos do React, especialmente `useState`
e `useEffect`. Ferramentas complexas de estado global, incluindo Redux, MUST NOT ser
adotadas sem aprovacao explicita. Rationale: evitar sobreengenharia e consolidar
fundamentos de React.

### IV. Integracao de API Tipada e Isolada
Chamadas HTTP MUST ficar isoladas em `src/services` usando `fetch` nativo.
Contratos de request/response MUST usar tipagem estrita em TypeScript baseada no
OpenAPI fornecido. Rationale: diminuir acoplamento na UI e aumentar seguranca de
tipos na integracao backend/frontend.

### V. Curva de Aprendizado Frontend Assistida
Como o perfil principal e backend senior aprendendo frontend, toda entrega MUST ser
legivel, direta e acompanhada de explicacao breve sobre decisoes de estrutura,
componentes e servicos. Rationale: acelerar dominio pratico de frontend sem elevar
complexidade desnecessaria.

## Padroes Tecnicos

- UI e composicao de componentes em React + TypeScript.
- Estilizacao via Tailwind CSS com classes utilitarias claras e previsiveis.
- Regras de negocio fora de componentes visuais sempre que aplicavel.
- Integracoes externas concentradas em servicos e nunca misturadas no JSX.

## Fluxo de Trabalho e Revisao

- Antes da implementacao, a feature MUST declarar impacto em componentes, hooks e
	servicos.
- Toda PR MUST confirmar que a estrutura modular simples foi mantida.
- Toda PR MUST confirmar ausencia de Redux ou alternativa complexa sem aprovacao.
- Toda PR MUST confirmar que chamadas API usam `fetch` nativo e tipagem baseada em
	OpenAPI.

## Governance
Esta constituicao prevalece sobre convencoes locais conflitantes.
Qualquer excecao MUST ser registrada na especificacao/plano e aprovada.

Politica de versao da constituicao:
- MAJOR: mudancas incompativeis de principio ou remocao de regra obrigatoria.
- MINOR: adicao de novo principio ou secao normativa.
- PATCH: esclarecimentos sem mudanca normativa.

Revisoes de conformidade MUST ocorrer em toda PR antes de merge.

**Version**: 1.0.0 | **Ratified**: 2026-06-13 | **Last Amended**: 2026-06-13
