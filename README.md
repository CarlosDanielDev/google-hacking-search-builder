# Google Hacking Search Builder

App web (React + Vite + TS + shadcn) que monta queries de Google Hacking (dorks)
sem margem para erro: escolha o alvo (t.me, github.com, pastebin.com, domínio
custom…), digite os tópicos, ative operadores — e receba a query final e a URL
do Google prontas, com validação poka-yoke (duplicatas mescladas, conflitos
bloqueados, aspas balanceadas por construção, teto de 32 palavras medido,
operadores mortos inselecionáveis).

100% client-side, sem backend. Desenvolvimento orquestrado por `/setwave`.

## Gate

```bash
npm run gate   # tsc + eslint + vitest + vite build
```
