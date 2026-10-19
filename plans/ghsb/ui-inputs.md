# Story — UI de alvos e tópicos: presets de site, domínio custom e tópicos ligados ao motor

Label: `story`.

Parent: #{{ghsb}}

Primeira seção da página única: o usuário escolhe onde procurar e sobre o quê. Presets de alvo (t.me, github.com, pastebin.com, drive.google.com, dropbox.com, s3.amazonaws.com, *.gov.br, *.edu) como cards/badges selecionáveis (multi), campo de domínio custom com a validação do motor (regra 4 — FQDN; erro inline PT-BR, input nunca aceita o valor inválido no estado), e campo de tópicos (chips: Enter adiciona, Backspace no vazio remove) com escolha do slot `intitle/intext/inurl/intitle+intext`.

Consome `src/lib/dork.ts` (`validateState`, regra 4) de `{{core}}`; estado sobe via Context definido aqui (`src/state/DorkProvider.tsx` define `useDork` — Provider criado nesta fatia, as outras fatias de UI só consomem).

## Done when

- [ ] selecionar preset t.me + tópico "telegram dork" e rodar `validateState` no provider produz sites `["t.me"]` e topic `"telegram dork"` (teste de integração do provider com vitest + testing-library) — owner: implementer
- [ ] colar `https://t.me/foo` no domínio custom mostra erro PT-BR inline e o estado permanece sem o valor inválido (teste) — owner: implementer
- [ ] slot intitle/intext/inurl selecionável; default `intitle+intext` (teste) — owner: reviewer
- [ ] teclado completo: chips de tópico adicionáveis/removíveis sem mouse, foco visível (teste de teclado com testing-library sobre `Input`/`Badge` do shadcn) — owner: reviewer

## ADR stub

Chips manuais com Input shadcn vs. lib de tag-input. Recomendação (para discordar): manual — ~40 linhas, zero dependência nova (regra poka-yoke da casa: nenhum pacote para o que poucas linhas fazem). Presets em constante `SITE_PRESETS` (`src/lib/presets.ts` — constantes de UI aqui; galeria de dorks completos é `{{presets}}`).

## Out of scope

Paleta de operadores (fatia `{{ui-palette}}` não começa antes desta integrar); preview/URL (`{{ui-output}}`); chamadas de rede (não existem).

## Handoff

- `git worktree add -b feat/{{ui-inputs.n}}-ui-alvos ../google-hacking-search-builder-{{ui-inputs.n}} origin/main`
- Gate: `npm run gate`. UI em PT-BR, dark-first. `Closes #{{ui-inputs}}`.
