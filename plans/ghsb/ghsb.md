# Feature — Google Hacking Search Builder: app web que monta queries de Google Hacking sem margem para erro

Label: `feature`, `epic`. App 100% client-side (React + Vite + TS + shadcn/Tailwind, PT-BR, dark-first) onde o usuário escolhe um alvo (preset de site como t.me/github.com/pastebin.com ou domínio custom), digita tópicos, ativa operadores de Google Hacking e recebe a query final pronta para colar no Google — com URL já codificada — mais botões de copiar e abrir. A promessa central é poka-yoke: cada regra do motor de validação torna uma classe de erro impossível (duplicatas mescladas, conflitos bloqueados antes de gerar, aspas balanceadas por construção, teto de 32 palavras do Google medido em tempo real, operadores mortos inselecionáveis).

Especificação fechada nesta sessão define (decision record): sem backend e sem chave de API — geração é pura e local; persistência só localStorage; gate = `npm run gate` (tsc + eslint + vitest + build).

Evidência do contrato do motor que as stories implementam: `src/lib/dork.ts` define `buildQuery` e `validateState` (arquivos nascem com a story `{{core}}`).

## Fatia

- `{{scaffold}}` — fundação: Vite + shadcn + gate + CI
- `{{core}}` — motor puro de operadores/validação com vitest cobrindo cada regra poka-yoke
- `{{ui-inputs}}` — alvos (presets + domínio custom) e tópicos
- `{{ui-palette}}` — paleta de operadores com bloqueios visíveis
- `{{ui-output}}` — preview, medidor, copiar/abrir; integra as duas fatias de UI
- `{{presets}}` — galeria de dorks prontos por objetivo
- `{{persistence}}` — histórico, favoritos, export/import JSON
- `{{audit}}` — auditoria poka-yoke de ponta a ponta e fechamento do gate

## Done when

- [ ] todas as stories fechadas por PR mergeado e `npm run gate` verde na main — owner: implementer

## ADR stub

Bifurcação: estado com Zustand vs. contexto React + motor puro. Recomendação (para discordar): motor 100% puro em `src/lib/dork.ts` (sem dependência de React — testável por vitest sem DOM) + `useReducer`/Context na UI; nenhuma lib de estado. Tema: shadcn dark-first com toggle. Idioma da UI: PT-BR; termos de dork permanecem em inglês (são sintaxe do Google).

## Out of scope

Backend/serviços, contas e sync na nuvem (localStorage cobre v1); Playwright/E2E (vitest no motor cobre as regras; E2E entra se UI crescer); APIs oficiais do Google (o produto entrega a query, não os resultados); operadores mortos (`cache:`, `link:`, `info:`, `+termo`) — existem só como itens bloqueados na paleta para educar.

## Handoff

- `git worktree add -b feat/{{ghsb.n}}-epico ../google-hacking-search-builder-{{ghsb.n}} origin/main` — só quando a feature for executada como folha; pais nunca recebem PR.
- O gate do repo (`npm run gate`), os inegociáveis (sem atribuição de IA em commits/PRs), `Closes #{{ghsb}}`.
