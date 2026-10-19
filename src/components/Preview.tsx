import { useMemo, useState } from "react";
import { buildQuery, errorToPtBr, validateState, WORD_LIMIT } from "../lib/dork";
import { useDork } from "../state/DorkProvider";
import { Button } from "./ui/button";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      // ponytail: execCommand fallback for insecure contexts; drop when https-only
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Painel de saída: query viva + URL + medidor 32 palavras + copiar/abrir.
 *  Poka-yoke: com qualquer erro ativo os botões desabilitam e TODOS os erros
 *  aparecem; estado vazio mostra instrução, nunca query parcial. */
export function Preview() {
  const { dork, reset, recordHistory } = useDork();
  const [copied, setCopied] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const result = useMemo(() => {
    const v = validateState(dork);
    if (!v.ok) return { ok: false as const, errors: v.errors };
    const built = buildQuery(v.state);
    if (!built) return { ok: false as const, errors: [{ kind: "EMPTY" as const }] };
    return { ok: true as const, state: v.state, ...built };
  }, [dork]);

  const overLimit = result.ok && result.wordCount > WORD_LIMIT;
  const blocked = !result.ok || overLimit;
  const errors = result.ok
    ? overLimit
      ? [errorToPtBr({ kind: "TOO_MANY_WORDS", count: result.wordCount, limit: WORD_LIMIT })!]
      : []
    : result.errors.map(errorToPtBr);

  const doCopy = async () => {
    if (blocked || !result.ok) return;
    if (await copyText(result.query)) {
      recordHistory(result.query);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const doOpen = () => {
    if (blocked || !result.ok) return;
    recordHistory(result.query);
    window.open(result.url, "_blank", "noopener");
  };

  return (
    <section aria-labelledby="out-h" className="sticky bottom-0 space-y-3 border-t bg-background/95 p-4 backdrop-blur">
      <h2 id="out-h" className="sr-only">Preview da query</h2>

      {result.ok ? (
        <>
          <p className="break-all font-mono text-sm">{result.query}</p>
          <p className="break-all font-mono text-xs text-muted-foreground">{result.url}</p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Escolha um alvo, digite tópicos ou ative operadores — a query aparece aqui, validada.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className={`font-mono text-sm ${overLimit ? "text-destructive" : result.ok && result.wordCount >= WORD_LIMIT - 4 ? "text-yellow-500" : "text-muted-foreground"}`}>
          {result.ok ? result.wordCount : 0}/{WORD_LIMIT} palavras
        </span>
        <Button type="button" onClick={doCopy} disabled={blocked} variant="secondary">
          {copied ? "Copiado ✓" : "Copiar"}
        </Button>
        <Button type="button" onClick={doOpen} disabled={blocked}>
          Abrir no Google
        </Button>
        <Button type="button" variant="ghost" onClick={() => setConfirmingReset(true)} className="ml-auto">
          Resetar
        </Button>
      </div>

      {confirmingReset && (
        <div className="flex items-center gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
          <span>Limpar alvos, tópicos e operadores?</span>
          <Button type="button" variant="destructive" size="sm" onClick={() => { reset(); setConfirmingReset(false); }}>
            Limpar tudo
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmingReset(false)}>
            Cancelar
          </Button>
        </div>
      )}

      {errors.length > 0 && (
        <ul role="alert" className="space-y-1">
          {errors.map((e) => (
            <li key={e} className="text-sm text-destructive">{e}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
