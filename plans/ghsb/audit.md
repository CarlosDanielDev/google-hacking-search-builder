# Story — Auditoria poka-yoke de ponta a ponta e fechamento do gate

Label: `story`.

Parent: #{{ghsb}}

Com as fatias montadas (`{{presets}}` + `{{persistence}}` fechadas), auditoria final do fluxo inteiro — alvo → tópicos → operadores → preview → copiar/abrir → salvar/recarregar — contra o padrão poka-yoke: nenhuma ação destrutiva sem confirmação (reset, remover favorito), nenhum estado silenciosamente inválido, nenhum caminho sem volta (importar sobrescreve? precisa confirmar), foco/teclado navegáveis, erros legíveis em PT-BR em todos os pontos. Achados corrigidos nesta mesma fatia; regressão coberta por teste quando o achado for de regra do motor. Superfície auditada: `src/state/DorkProvider.tsx` define `useDork`; critério do gate: `package.json` define `gate`.

## Done when

- [ ] relatório da auditoria colado como comentário no PR com cada achado severidade-tagged e status corrigido/não-aplicável (saída JSON da skill `poka-yoke`) — owner: implementer
- [ ] cada achado de fluxo corrigido tem teste de regressão (`src/lib/*.test.ts`) ou correção de UI verificada no diff — owner: reviewer
- [ ] `npm run gate` verde + `gh run list --limit 1` verde na main após merge — owner: implementer
- [ ] smoke manual registrado no PR: os 3 fluxos (`preset→copiar`, `domínio inválido→erro`, `favorito→reload→aplicar`) executados com resultado esperado — owner: reviewer

## ADR stub

Auditoria por skill de poka-yoke vs. checklist ad-hoc. Recomendação (para discordar): usar a skill `poka-yoke` (auditoria de fluxo/validação/saída silenciosa com saída JSON severidade-ordenada) — checklist pronto e menos sujeito a viés de quem acabou de escrever o código.

## Out of scope

Features novas (qualquer ideia que aparecer vira issue nova, não entra aqui); Playwright/E2E (fora do épico por decisão de `{{ghsb}}`).

## Handoff

- `git worktree add -b feat/{{audit.n}}-auditoria ../google-hacking-search-builder-{{audit.n}} origin/main`
- Gate: `npm run gate`. Skills: `poka-yoke`, `superpowers:verification-before-completion`. `Closes #{{audit}}`.
