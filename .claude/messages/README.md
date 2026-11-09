# .claude/messages/

Trilha de auditoria das delegações do `orchestrator` para os subagentes.

Cada passo do pipeline produz **dois** arquivos:

- `<task_id>-request.json` — escrito pelo `orchestrator` antes de invocar o subagente.
- `<task_id>-response.json` — escrito pelo subagente ao concluir a tarefa.

## Formato do `task_id`

```
<yyyyMMdd-HHmmss>-<kebab-slug>
```

Exemplo: `20261108-153045-catalog-prototype`

O timestamp garante ordenação cronológica no `ls`; o slug descreve o passo.

## Schema — request

```json
{
  "task_id": "string (obrigatório)",
  "from": "orchestrator",
  "to": "ux-designer | react-developer | code-reviewer | test-developer | test-executor | app-validator",
  "created_at": "ISO-8601 UTC",
  "objective": "Frase curta e orientada a resultado",
  "context": {
    "user_command": "Comando original do usuário em linguagem natural",
    "related_prototypes": ["docs/prototypes/<arquivo>.md"],
    "related_source_files": ["src/<path>"],
    "api_endpoints": ["METHOD /path"],
    "constraints": ["Regras específicas do projeto que se aplicam a esta tarefa"]
  },
  "deliverables": [
    "Descrição do que o subagente deve produzir, com caminhos esperados"
  ],
  "upstream_messages": [
    "20261108-152000-outro-task_id (quando esta tarefa depende de outra)"
  ],
  "acceptance_criteria": [
    "Critério verificável 1",
    "Critério verificável 2"
  ]
}
```

## Schema — response

```json
{
  "task_id": "mesmo id do request",
  "from": "<nome do subagente>",
  "to": "orchestrator",
  "completed_at": "ISO-8601 UTC",
  "status": "completed | blocked | needs_input | failed",
  "deliverables_produced": [
    { "path": "caminho/relativo/arquivo", "kind": "prototype|code|test|report" }
  ],
  "notes": "Resumo em texto livre do que foi feito, decisões tomadas, ressalvas",
  "blockers": [
    "Descrição de qualquer coisa que impediu a conclusão (preencher quando status != completed)"
  ],
  "recommended_next_agent": "nome do próximo agente sugerido, ou null se for terminal"
}
```

### Campos específicos por agente

Alguns agentes podem anexar campos extras no response:

- `code-reviewer` — campo `findings`: lista de `{ file, line, severity: "info|warning|blocker", message }`.
- `test-executor` — campos `unit`, `integration`, `e2e` com `{ passed, failed, skipped }`.
- `app-validator` — campo `verdict`: `"APROVADO" | "REPROVADO" | "APROVADO_COM_RESSALVAS"`.

## Convenções

- Um pipeline = vários pares request/response compartilhando contexto via `upstream_messages`.
- Arquivos **não são apagados** — são a trilha de auditoria. O `.gitignore` decide se eles entram no repo (atualmente não entram, exceto este README).
- Se um ciclo de loop corretivo for executado, o novo `task_id` referencia o anterior em `upstream_messages` para rastreabilidade.
