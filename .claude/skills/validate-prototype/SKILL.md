---
name: validate-prototype
description: Checklist para comparar a implementação em execução com o protótipo correspondente em docs/prototypes/. Use no app-validator após abrir o Chrome.
---

# Validate Prototype

Comparação sistemática entre o protótipo textual e a tela renderizada.

## Procedimento

### 1. Carregar protótipo
Leia `docs/prototypes/<tela>.md` e extraia:
- Lista de elementos esperados (campos, botões, ícones).
- Estados especificados (loading, erro, vazio, sucesso).
- Interações descritas.
- Responsividade (breakpoints e colunas).
- Dados da API consumidos.

### 2. Observar a tela renderizada
Com Chrome aberto (via skill `chrome-browser`):
- Compare visualmente a hierarquia.
- Dispare cada interação listada no protótipo.
- Redimensione a janela para validar cada breakpoint.
- Force cada estado:
  - **Loading**: throttle de rede em DevTools.
  - **Erro**: desligue o backend momentaneamente.
  - **Vazio**: faça busca por string inexistente.
  - **Sucesso**: fluxo normal.

### 3. Checklist de aderência

Para cada item do protótipo:
- [ ] Presente na tela
- [ ] Posicionado conforme wireframe
- [ ] Com dados corretos da API
- [ ] Com interação funcionando
- [ ] Com acessibilidade (role, alt, label)

### 4. Checklist específico do projeto
- [ ] Scroll infinito carrega mais itens ao aproximar do fim.
- [ ] Nenhum elemento `<video>` real — apenas simulação.
- [ ] Modal de reprodução tem botão "Fechar" acessível.
- [ ] Token em `localStorage` sobrevive a `F5`.
- [ ] 401 redireciona para `/login`.
- [ ] Grid: 2 cols < 640px, 4 cols até 1024px, 6 cols acima.

## Report

```markdown
# Validação: <feature>

**Protótipo**: docs/prototypes/<arquivo>.md
**Build testado**: commit <hash> | dev server em localhost:5173
**Data**: <YYYY-MM-DD>

## Aderência
| Item do protótipo | Status | Observação |
|---|---|---|
| Header com busca | ✅ | - |
| Grid responsivo | ⚠️ | 3 cols em tablet, protótipo dizia 4 |
| Scroll infinito | ✅ | - |
| Simulação de reprodução | ❌ | Botão "Reproduzir" não abre modal |

## Screenshots
- docs/screenshots/<tela>-desktop.png
- docs/screenshots/<tela>-mobile.png

## Veredicto
APROVADO | REPROVADO | APROVADO COM RESSALVAS

## Próximos passos
<ex: retornar ao react-developer para corrigir X e Y>
```

## Regra
- **Não aprove com ressalvas sem alinhamento explícito** quando uma divergência mudar o contrato do UX. Devolva ao `ux-designer` se o protótipo precisa ser atualizado, ou ao `react-developer` se a implementação precisa alinhar.
