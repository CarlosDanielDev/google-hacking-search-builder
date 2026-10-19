# Story — Motor de dorks puro: catálogo de operadores, regras poka-yoke e montagem da query

Label: `story`.

Parent: #{{ghsb}}

Coração do app: módulo TypeScript puro (zero React) que recebe o estado da busca e devolve ou a query montada ou os erros exatos que a bloqueiam — nunca uma query inválida. Cada regra poka-yoke combinada nesta sessão vira um teste; a suíte é o contrato.

Especificação fechada (é o contrato — implementar literal):

**Estado** (`src/lib/dork.ts` define `DorkState`): `sites: string[]` (FQDNs), `topics: string[]`, `slots` (onde os tópicos entram): `intitle | intext | inurl | intitle+intext`, operadores opcionais: `filetype: string[]`, `exclude: string[]`, `phrase: string`, `range: {min?: number; max?: number}`, `before?/after?: string (YYYY-MM-DD)`, `related?: string`, `wildcard: boolean`, `useAll: {title|text|url}` (variante `allintitle:` etc.).

**Catálogo** (`src/lib/operators.ts` define `OPERATORS`): famílias `site, filetype, intitle/allintitle, inurl/allinurl, intext/allintext, inanchor/allinanchor, phrase, or, exclude, wildcard, range, before, after, related, tag` — cada uma com `status: "live" | "blocked"`; `cache, link, info, +termo` entram com `status: "blocked"` (mortos no Google hoje) e nunca geram texto.

**Montagem** (`src/lib/dork.ts` define `buildQuery`): ordem fixa — `site:` (vários viram `site:a OR site:b` agrupados), termos de tópico no slot (`intitle:"x y"`), frase exata entre aspas, `filetype:`, `before:`/`after:`, range `1..100`, `related:`, exclusões `-termo`, wildcard `*`. Saída sempre: `{ query: string; url: string }` com `url = https://www.google.com/search?q=` + `encodeURIComponent(query)`.

**Regras poka-yoke** (`validateState` — cada linha = 1+ teste com nome óbvio):
1. família duplicada mesclada (nunca `site:a site:b` sem `OR`); `useAll` + slot simples da mesma família = conflito, erro antes de gerar
2. termo multi-palavra sempre entre aspas; aspas impossíveis de desbalancear (o motor escapa `"` interno)
3. teto de 32 palavras do Google: `wordCount(query) > 32` = bloqueio com contagem exata no erro
4. `sites` só aceita FQDN (sem esquema, sem caminho, sem espaço); `"https://t.me"` vira `"t.me"` ou erro
5. estado vazio (sem sites, sem tópicos, sem operadores) = erro "query vazia", nada gerado
6. só-exclusões (tópicos vazios e apenas `-termos`) = erro — Google exige termo positivo
7. `before < after` = erro de intervalo; data em outro formato = erro
8. `filetype` fora da lista permitida (extensão 1–5 chars alfanum) = erro
9. `range` com `min > max` = erro; negativos rejeitados

## Done when

- [ ] `npx vitest run src/lib` verde com caso cobrindo cada regra 1–9 (mín. 12 testes; nomes citam a regra) — owner: implementer
- [ ] propriedade de idempotência: `buildQuery(validate(s))` rodado 2× produz a mesma string (teste) — owner: implementer
- [ ] `buildQuery` nunca retorna query com aspas ímpares ou `site:` duplo sem `OR` (testes de saída) — owner: reviewer
- [ ] README do módulo (`src/lib/README.md`) documenta as 9 regras em PT-BR — owner: reviewer

## ADR stub

Motor puro + tipos no mesmo pacote `src/lib` vs. lib separada. Recomendação (para discordar): um pacote só — app pequeno, extração é custo sem ganho. Erros: union type `DorkError` tipado por regra (não string solta) — a UI de `{{ui-output}}` traduz cada variante para PT-BR.

## Out of scope

Qualquer DOM/React (motor puro — `{{ui-inputs}}`/`{{ui-palette}}`/`{{ui-output}}` consomem); persistência (`{{persistence}}`); presets (`{{presets}}`).

## Handoff

- `git worktree add -b feat/{{core.n}}-motor-dorks ../google-hacking-search-builder-{{core.n}} origin/main`
- Gate: `npm run gate`. Skill: `superpowers:test-driven-development` (regras 1–9 viram testes antes do código). `Closes #{{core}}`.
