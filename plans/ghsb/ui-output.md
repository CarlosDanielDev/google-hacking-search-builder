# Story — Preview e saída: query viva, medidor de 32 palavras, copiar e abrir no Google — nada sai da página com erro

Label: `story`.

Parent: #{{ghsb}}

Terceira seção, que fecha o loop: painel fixo (sticky) mostrando a query montada em fonte monoespaçada + a URL do Google pronta, medidor de palavras (x/32, muda para vermelho a partir de 28), e os dois botões — Copiar (Clipboard API com fallback de `execCommand`) e Abrir no Google (`window.open`). Poka-yoke de saída: enquanto `validateState` retornar erro, os dois botões ficam desabilitados e o painel mostra TODOS os erros ativos em PT-BR (cada variante de `DorkError` tem uma frase); com estado vazio, painel mostra instrução, nunca query parcial. Botão de reset com confirmação inline (não `confirm()` nativo).

Integra as fatias `{{ui-inputs}}` + `{{ui-palette}}` — é a primeira vez que a página inteira funciona de ponta a ponta. Fonte de verdade do painel: `src/state/DorkProvider.tsx` define `useDork`.

## Done when

- [ ] estado válido → query e URL corretas no painel; clicar Copiar põe a query no clipboard (teste com stub de clipboard) e Abrir chama `window.open` com a URL codificada (teste com mock) — owner: implementer
- [ ] estado com qualquer erro ativo → ambos os botões `disabled` + lista de erros PT-BR visível (teste para ao menos 3 erros distintos: vazio, >32 palavras, domínio inválido) — owner: implementer
- [ ] URL no painel sempre `encodeURIComponent`-codificada (aspa dupla na frase não quebra a URL — teste) — owner: implementer
- [ ] medidor conta as palavras da MESMA string exibida (fonte única de verdade: `buildQuery` — teste) — owner: reviewer

## ADR stub

Debounce no preview vs. recompute síncrono. Recomendação (para discordar): síncrono — `buildQuery` é puro e barato (string building), debounce é complexidade sem medida que a justifique. Copiar via Clipboard API com fallback: página pode rodar em contexto não seguro (GH Pages http) — 6 linhas de fallback valem mais que exigir https.

## Out of scope

Histórico/favoritos (`{{persistence}}`); compartilhar por URL (state na querystring — reabrir se pedido; v1 copia a query, não o estado).

## Handoff

- `git worktree add -b feat/{{ui-output.n}}-preview ../google-hacking-search-builder-{{ui-output.n}} origin/main`
- Gate: `npm run gate`. UI em PT-BR, dark-first. `Closes #{{ui-output}}`.
