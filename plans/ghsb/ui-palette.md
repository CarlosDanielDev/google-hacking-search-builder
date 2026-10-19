# Story — Paleta de operadores: todos os operadores vivos visíveis, mortos inselecionáveis, conflitos anunciados antes de acontecer

Label: `story`.

Parent: #{{ghsb}}

Segunda seção da página: um painel com cada família do catálogo `OPERATORS` (de `{{core}}`) como controle nativo do seu tipo — `filetype` e exclusões como chips multi, frase e `related` como input, range como dois números, datas como `<input type="date">` nativo, wildcard como switch, `useAll` como radio (nenhum/título/texto/url). Poka-yoke visível: operadores `blocked` (`cache:`, `link:`, `info:`, `+termo`) aparecem desabilitados com tooltip "operador descontinuado pelo Google" — impossíveis de ativar; escolher `allintitle` com slot `intitle` ativo (regra 1 de `{{core}}`) mostra o conflito inline no momento do clique, não depois de gerar.

Consome o provider `useDork` de `{{ui-inputs}}`; catálogo: `src/lib/operators.ts` define `OPERATORS`. Componentes em `src/components/operators/` (diretório próprio — sem tocar nos arquivos de `{{ui-inputs}}` para o PR não conflitar).

## Done when

- [ ] cada família `live` do catálogo renderiza seu controle e grava no estado via `useDork` (teste com testing-library: ativar `filetype:pdf` reflete no provider) — owner: implementer
- [ ] os 4 operadores `blocked` renderizam desabilitados e clique não muda o estado (teste) — owner: implementer
- [ ] conflito `useAll` × slot da mesma família exibe mensagem PT-BR inline e o estado não aceita o par inválido (teste) — owner: implementer
- [ ] datas usam input nativo; `before > after` herdado da regra 7 impossibilita salvar o par invertido (teste) — owner: reviewer

## ADR stub

Controle por família vs. grade uniforme de toggles. Recomendação (para discordar): controle por tipo (date nativo, chips, switch) — plataforma faz a validação de graça, poka-yoke rung 3. `Accordion` shadcn por grupo (Alvos de conteúdo / Refino / Bloqueados) para não virar parede de controles.

## Out of scope

Preview/cópia (`{{ui-output}}`); presets (`{{presets}}`); novos operadores além do catálogo de `{{core}}` (catálogo é contrato fechado — mudar = reabrir `{{core}}`).

## Handoff

- `git worktree add -b feat/{{ui-palette.n}}-paleta ../google-hacking-search-builder-{{ui-palette.n}} origin/main`
- Gate: `npm run gate`. UI em PT-BR, dark-first. `Closes #{{ui-palette}}`.
