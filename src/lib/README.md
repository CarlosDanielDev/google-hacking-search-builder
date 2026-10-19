# Motor de dorks — as 9 regras poka-yoke

`dork.ts` é puro (zero React): recebe um `DorkState`, devolve ou os erros exatos
que bloqueiam a query, ou a query montada + URL codificada. Cada regra tem teste
com o nome da regra em `dork.test.ts`.

1. **Família duplicada mescla; `all` × slot conflita** — sites repetidos colapsam
   (nunca `site:a site:b` sem `OR`); `allintitle/allintext/allinurl` não coexiste
   com o mesmo operador do slot (`CONFLICT_SLOT_ALL`).
2. **Aspas balanceadas por construção** — termo multi-palavra sempre entre aspas;
   aspas internas são escapadas; a saída nunca tem número ímpar de `"` (testado).
3. **Teto de 32 palavras do Google** — medido na string montada (`wordCount`);
   acima disso a query não sai (`TOO_MANY_WORDS` com a contagem exata).
4. **Só FQDN em sites** — esquema e caminho são cortados (`https://t.me/foo` →
   `t.me`), espaços/TLD ausente/caracteres inválidos viram erro (`BAD_DOMAIN`).
5. **Estado vazio não gera query** — sem alvo, tópico ou operador, `EMPTY`
   bloqueia; nada parcial é montado.
6. **Só exclusões não bastam** — o Google exige termo positivo (`ONLY_EXCLUSIONS`).
7. **Datas ISO e ordenadas** — `before`/`after` em `YYYY-MM-DD`;
   `before >= after` é erro (`BAD_DATE`, `DATE_ORDER`).
8. **filetype validado** — 1–5 caracteres alfanuméricos, caixa normalizada
   (`BAD_FILETYPE`).
9. **Faixa numérica sã** — sem negativos, `min ≤ max` (`BAD_RANGE`,
   `NEGATIVE_RANGE`).

Extras que não são regras, são consequências: a URL final é sempre
`encodeURIComponent(query)`; `buildQuery(validate(s))` é idempotente (testado);
operadores mortos (`cache:`, `link:`, `info:`, `+termo`) nem entram no estado —
ficam no catálogo `operators.ts` como `blocked`, inselecionáveis na UI.
