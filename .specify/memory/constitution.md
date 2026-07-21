<!--
Sync Impact Report
- Version change: N/A (template) -> 1.0.0
- Modified principles:
	- [PRINCIPLE_1_NAME] -> I. Stack Obrigatoria e Tipagem Estrita
	- [PRINCIPLE_2_NAME] -> II. Contrato de API como Fonte da Verdade
	- [PRINCIPLE_3_NAME] -> III. Autorizacao por Roles com Semantica de Super Admin
	- [PRINCIPLE_4_NAME] -> IV. Protecao de Rotas e Elementos de UI
	- [PRINCIPLE_5_NAME] -> V. Resiliencia de UX para Acesso Negado
- Added sections:
	- Stack Tecnologica Obrigatoria
	- Fluxo de Desenvolvimento e Qualidade
- Removed sections:
	- [SECTION_2_NAME]
	- [SECTION_3_NAME]
- Templates requiring updates:
	- ✅ .specify/templates/plan-template.md
	- ✅ .specify/templates/spec-template.md
	- ✅ .specify/templates/tasks-template.md
	- ✅ .specify/extensions/agent-context/commands/speckit.agent-context.update.md (validated, no update required)
- Deferred placeholders/TODOs: none
-->

# Movie Suggestion Front-end Constitution

## Core Principles

### I. Stack Obrigatoria e Tipagem Estrita
Todo codigo de aplicacao MUST usar TypeScript com strict mode ativo e manter tipagem estrita
nas estruturas de requisicao e resposta da API. O frontend MUST ser implementado com React 19,
usando componentes funcionais e hooks nativos. A camada visual MUST usar Tailwind CSS com
layouts fluidos, estados de hover e foco, e transicoes suaves.
Rationale: consistencia tecnica e seguranca de tipos reduzem regressao, ambiguidades de contrato
e inconsistencias de UX.

### II. Contrato de API como Fonte da Verdade
A integracao de API MUST seguir o contrato OpenAPI definido em
https://github.com/WilliamCesarSantos/movie-suggestion-api/blob/main/openapi.yaml.
Clientes HTTP, tipos de dominio e validacoes de payload MUST refletir o contrato publicado.
Mudancas em endpoints/DTOs MUST atualizar tipos e consumidores no mesmo ciclo de entrega.
Rationale: alinhamento contrato-codigo evita quebra silenciosa entre frontend e backend.

### III. Autorizacao por Roles com Semantica de Super Admin
O app MUST extrair e normalizar as roles do usuario autenticado antes de avaliar permissoes.
A role * MUST conceder acesso total, atuando como Super Admin. Qualquer role ausente,
invalida ou nao mapeada MUST ser tratada como sem permissao explicita.
Rationale: modelo deny-by-default evita escalonamento acidental de privilegios.

### IV. Protecao de Rotas e Elementos de UI
Rotas protegidas MUST exigir permissao explicita por role e bloquear navegacao nao autorizada.
Elementos sensiveis de UI (menus administrativos, acoes de edicao, controles destrutivos)
MUST desaparecer ou ficar visualmente desabilitados quando o usuario nao possuir role valida.
Nenhum controle protegido pode permanecer funcional apenas por ocultacao visual.
Rationale: a regra reforca seguranca no fluxo e evita inconsistencias entre navegacao e interface.

### V. Resiliencia de UX para Acesso Negado
Tentativas de acesso sem role requerida (exemplo: movies:read) MUST renderizar fallback
amigavel com icone informativo de bloqueio e orientacao clara ao usuario.
A interface MUST NOT quebrar, travar ou exibir estado em branco em cenarios de autorizacao negada.
Tratamento de erro de permissao MUST ser testado em rota e componente.
Rationale: resiliencia preserva confianca do usuario e reduz incidentes de suporte.

## Stack Tecnologica Obrigatoria

- Linguagem: TypeScript em strict mode, incluindo tipagem de respostas da API.
- Framework: React 19 com componentes funcionais e hooks nativos.
- Estilizacao: Tailwind CSS para responsividade, acessibilidade visual e transicoes.
- API: Consumo baseado no OpenAPI do repositorio movie-suggestion-api.

## Fluxo de Desenvolvimento e Qualidade

- Toda feature MUST declarar o impacto em autorizacao (roles requeridas, rotas afetadas,
	componentes protegidos) na especificacao.
- Toda implementacao MUST incluir cobertura de teste para caminho autorizado,
	caminho nao autorizado e fallback visual.
- Pull requests MUST incluir checklist de conformidade constitucional com evidencias
	para tipagem estrita, aderencia ao contrato OpenAPI e regras de RBAC.
- Mudancas que alterem fluxo de permissao MUST ser acompanhadas de revisao funcional
	em desktop e mobile.

## Governance

Esta constituicao prevalece sobre praticas locais conflitantes para o frontend Movie Suggestion.
Toda alteracao MUST registrar motivacao, impacto, plano de migracao (quando aplicavel)
e atualizacao dos templates dependentes.

Politica de versionamento da constituicao:
- MAJOR: remocao ou redefinicao incompativel de principios/governanca.
- MINOR: adicao de principio, secao, gate obrigatorio ou ampliacao material de regras.
- PATCH: clarificacoes editoriais sem mudanca normativa.

Processo de emenda:
- Proposta documentada em PR com secao "Constitution Impact".
- Aprovacao por mantenedor responsavel pelo frontend.
- Atualizacao obrigatoria de templates e comandos afetados no mesmo PR.

Compliance review:
- Revisoes de especificacao, plano e tarefas MUST validar aderencia explicita a esta constituicao.
- Nao conformidades MUST ser corrigidas antes do merge ou receber waiver formal e temporario,
	com prazo de remediacao.

**Version**: 1.0.0 | **Ratified**: 2026-07-19 | **Last Amended**: 2026-07-19
