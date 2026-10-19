# Story — Galeria de dorks prontos: templates por objetivo que preenchem o builder com um clique

Label: `story`.

Parent: #{{ghsb}}

Painel "Comece por um objetivo": ~10 templates curados de Google Hacking (conhecimento público do GHDB) que ao clicar preenchem o estado do builder — t.me (canais sobre tópico), documentos expostos (`filetype:pdf|xlsx|docx` + tópico), diretórios abertos (`intitle:"index of"`), painéis de login (`intitle:login inurl:admin`), pastebins, `drive.google.com`, listagens de bucket S3, `*.gov.br` documentos, `.env`/config expostos em forjas públicas de código, combo `site:` OR para multi-rede. Cada card mostra o objetivo em PT-BR e o dork resultante em mono; aplicar = setar `DorkState` completo (validado — um preset nunca nasce inválido, regra 5/6 de `{{core}}`).

Consome `useDork` de `{{ui-inputs}}`; catálogo em `src/lib/dorkPresets.ts` define `DORK_PRESETS`.

## Done when

- [ ] cada um dos ~10 presets passa por `validateState` sem erro (teste iterando `DORK_PRESETS` — presets inválidos não entram no catálogo) — owner: implementer
- [ ] clicar num card preenche o provider e o preview de `{{ui-output}}` mostra a query do card (teste de integração) — owner: implementer
- [ ] presets de multicheck (t.me + pastebin) geram grupo `site:a OR site:b` correto (teste) — owner: reviewer
- [ ] card mostra objetivo PT-BR + dork em mono, sem descrição longa (checagem no diff dos cards de `DORK_PRESETS`) — owner: reviewer

## ADR stub

Templates como dados (`DORK_PRESETS`) vs. arquivo por preset. Recomendação (para discordar): um array tipado num arquivo — ~150 linhas, auditorável num olhar; seção separada sofre drift do tipo `DorkState`.

## Out of scope

Espelhar o GHDB inteiro (curadoria de 10 > dump de milhares); busca/filtro na galeria (com 10 cards, filtro é peso morto — volta quando passar de ~20).

## Handoff

- `git worktree add -b feat/{{presets.n}}-galeria ../google-hacking-search-builder-{{presets.n}} origin/main`
- Gate: `npm run gate`. `Closes #{{presets}}`.
