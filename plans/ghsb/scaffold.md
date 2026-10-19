# Chore — Scaffold do app: Vite + React + TS + Tailwind v4 + shadcn, gate `npm run gate` e CI

Label: `chore`.

Parent: #{{ghsb}}

Repo `google-hacking-search-builder` nasce vazio (apenas README na main — verificado nesta sessão: diretório sem arquivos, sem remoto antes da criação). Esta fundação cria o esqueleto que todas as fatias de UI e o motor habitam. Contrato do gate: `package.json` define `gate`; página-base criada aqui: `src/App.tsx` define `App`.

## Por que não é story

Nenhum comportamento muda para o usuário ainda; o ganho é fundação — todo PR seguinte roda o mesmo gate local e no CI, e a paleta de componentes shadcn já vem configurada (Tailwind v4, dark-first, PT-BR nos textos-base).

## Done when

- [ ] `npm run gate` existe no `package.json` e sai 0 rodando `npx tsc -b && npx eslint . && npx vitest run && npm run build` — owner: implementer
- [ ] `.github/workflows/ci.yml` roda o mesmo gate em push/PR na main (checar com `gh run list --limit 1` verde após o push) — owner: implementer
- [ ] `.wave.json` na raiz declara `"base": "main"` e o gate acima — owner: reviewer
- [ ] botão/tema shadcn funcional: página inicial renderiza um `Button` com dark mode ativo por padrão (`src/App.tsx`) — owner: reviewer

## ADR stub

Vite oficial (`npm create vite@latest -- --template react-ts`), Tailwind v4 + shadcn init, vitest (não jest — zero config com Vite), eslint plano do próprio template. npm, não pnpm/bun (menos surpresa entre máquinas). Sem React Router: app de página única.

## Out of scope

Qualquer tela do produto (motor, alvos, paleta — fatias `{{core}}`/`{{ui-inputs}}`/`{{ui-palette}}`); testes de comportamento (vitest entra no gate aqui, casos nascem em `{{core}}`).

## Handoff

- `git worktree add -b chore/{{scaffold.n}}-scaffold ../google-hacking-search-builder-{{scaffold.n}} origin/main`
- Gate: `npm run gate`. Inegociáveis: sem `Co-Authored-By`/atribuição de IA em commits. `Closes #{{scaffold}}`.
