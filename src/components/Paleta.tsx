import { OPERATORS } from "../lib/operators";
import type { UseAll } from "../lib/dork";
import { useDork } from "../state/DorkProvider";
import { Button } from "./ui/button";

const inputCls =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Chips({ values, onRemove, onAdd, placeholder, ariaLabel }: {
  values: string[];
  onRemove: (v: string) => void;
  onAdd: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className={inputCls}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = e.currentTarget.value.trim();
              if (v) onAdd(v);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm text-secondary-foreground">
              {v}
              <button onClick={() => onRemove(v)} aria-label={`Remover ${v}`} className="text-muted-foreground hover:text-foreground">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Seção Operadores: cada família do catálogo no controle do seu tipo.
 *  Bloqueados (cache:, link:, info:, +termo) renderizam desabilitados com o
 *  motivo — inselecionáveis por construção. Conflito all×slot aparece no clique. */
export function Paleta() {
  const { dork, setDork } = useDork();
  const blocked = OPERATORS.filter((o) => o.status === "blocked");
  const conflict = dork.useAll !== "none" && (dork.slot === `in${dork.useAll === "text" ? "text" : dork.useAll === "title" ? "title" : "url"}` || (dork.slot === "intitle+intext" && dork.useAll !== "url"));

  return (
    <section aria-labelledby="ops-h" className="space-y-4">
      <h2 id="ops-h" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Operadores
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="f-filetype">filetype: (Enter adiciona)</label>
          <Chips
            values={dork.filetype}
            ariaLabel="filetype"
            placeholder="pdf"
            onAdd={(v) => setDork({ ...dork, filetype: [...dork.filetype, v] })}
            onRemove={(v) => setDork({ ...dork, filetype: dork.filetype.filter((f) => f !== v) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="f-exclude">excluir −termo</label>
          <Chips
            values={dork.exclude}
            ariaLabel="excluir termos"
            placeholder="login"
            onAdd={(v) => setDork({ ...dork, exclude: [...dork.exclude, v] })}
            onRemove={(v) => setDork({ ...dork, exclude: dork.exclude.filter((f) => f !== v) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="f-phrase">"frase exata"</label>
          <input
            id="f-phrase"
            className={inputCls}
            value={dork.phrase}
            onChange={(e) => setDork({ ...dork, phrase: e.target.value })}
            placeholder="termos na ordem exata"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="f-related">related:</label>
          <input
            id="f-related"
            className={inputCls}
            value={dork.related ?? ""}
            onChange={(e) => setDork({ ...dork, related: e.target.value })}
            placeholder="exemplo.com"
          />
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className="text-sm font-medium" htmlFor="f-before">before:</label>
            <input id="f-before" type="date" className={inputCls} value={dork.before ?? ""} onChange={(e) => setDork({ ...dork, before: e.target.value || undefined })} />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="f-after">after:</label>
            <input id="f-after" type="date" className={inputCls} value={dork.after ?? ""} onChange={(e) => setDork({ ...dork, after: e.target.value || undefined })} />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className="text-sm font-medium" htmlFor="f-min">faixa min</label>
            <input id="f-min" type="number" min={0} className={inputCls} value={dork.range.min ?? ""} onChange={(e) => setDork({ ...dork, range: { ...dork.range, min: e.target.value === "" ? undefined : Number(e.target.value) } })} />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="f-max">faixa max</label>
            <input id="f-max" type="number" min={0} className={inputCls} value={dork.range.max ?? ""} onChange={(e) => setDork({ ...dork, range: { ...dork.range, max: e.target.value === "" ? undefined : Number(e.target.value) } })} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={dork.wildcard} onChange={(e) => setDork({ ...dork, wildcard: e.target.checked })} />
          curinga <code>*</code>
        </label>
        <fieldset className="flex flex-wrap items-center gap-3">
          <legend className="sr-only">Variante allintitle/allintext/allinurl</legend>
          {([["none", "nenhum"], ["title", "allintitle"], ["text", "allintext"], ["url", "allinurl"]] as [UseAll, string][]).map(([v, label]) => (
            <label key={v} className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input type="radio" name="useAll" checked={dork.useAll === v} onChange={() => setDork({ ...dork, useAll: v })} />
              {label}
            </label>
          ))}
        </fieldset>
      </div>

      {conflict && (
        <p role="alert" className="text-sm text-destructive">
          Conflito: a variante all* escolhida cobre a mesma família do slot — escolha uma das duas.
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t pt-4">
        {blocked.map((o) => (
          <Button key={o.id} type="button" variant="outline" size="sm" disabled aria-disabled title={o.blockedWhy}>
            {o.label} — indisponível
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Operadores descontinuados pelo Google ficam visíveis mas inselecionáveis.</p>
    </section>
  );
}
