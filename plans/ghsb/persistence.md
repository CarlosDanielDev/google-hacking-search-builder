# Story — Histórico e favoritos: localStorage com export/import JSON, tudo local

Label: `story`.

Parent: #{{ghsb}}

Copiar ou abrir uma query válida a grava no histórico (últimas 50, dedupe exato); botão de estrela salva o `DorkState` como favorito com nome; drawer "Salvos" lista favoritos (aplicar de volta no builder) e histórico (clique = recria o estado, lixeira = remove). Exportar baixa JSON de favoritos+histórico; importar lê JSON com validação (schema checado — arquivo malformado = erro PT-BR inline, estado atual intacto). localStorage embrulhado em try/catch (modo privado/cheio = app funciona sem persistir, sem crash).

Módulo `src/lib/storage.ts` define `loadState`/`saveHistory`/`importSnapshot`; UI em `src/components/saved/`.

## Done when

- [ ] copiar query válida grava no histórico com dedupe (teste `saveHistory` em `storage.test.ts`: copiar 2× a mesma = 1 entrada; entrada mais recente primeiro) — owner: implementer
- [ ] favorito salvo sobrevive a reload (teste `loadState` com vitest + jsdom recarregando o provider) — owner: implementer
- [ ] importar JSON malformado mostra erro PT-BR e não altera favoritos existentes (teste `importSnapshot` com payload inválido) — owner: implementer
- [ ] localStorage indisponível (stub que lança) → app funciona, sem favoritos, sem erro no console (teste com `vi.stubGlobal`) — owner: reviewer

## ADR stub

localStorage vs. IndexedDB. Recomendação (para discordar): localStorage — payload é JSON pequeno (50 históricos + favoritos), API síncrona, zero lib. Versão do schema no objeto (`v: 1`) para migrações futuras sem parser tolerante demais.

## Out of scope

Sync na nuvem/contas (decisão do épico `{{ghsb}}`); histórico ilimitado (50 = teto consciente, sobra pouco uso real).

## Handoff

- `git worktree add -b feat/{{persistence.n}}-salvos ../google-hacking-search-builder-{{persistence.n}} origin/main`
- Gate: `npm run gate`. `Closes #{{persistence}}`.
