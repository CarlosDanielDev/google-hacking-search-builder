import { buildQuery, validateState } from "../lib/dork";
import { DORK_PRESETS } from "../lib/dorkPresets";
import { useDork } from "../state/DorkProvider";
import { Button } from "./ui/button";

/** Galeria "Comece por um objetivo": só presets que validam entram na tela
 *  (defensivo em profundidade — o teste já garante o catálogo, a UI re-checa). */
export function Presets() {
  const { applyPreset } = useDork();
  return (
    <section aria-labelledby="presets-h" className="space-y-3">
      <h2 id="presets-h" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Comece por um objetivo
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {DORK_PRESETS.map((p) => {
          const v = validateState(p.state);
          if (!v.ok) return null;
          const built = buildQuery(v.state)!;
          return (
            <Button
              key={p.id}
              type="button"
              variant="outline"
              className="h-auto flex-col items-start gap-1 p-3 text-left"
              onClick={() => applyPreset(p.state)}
            >
              <span className="text-sm font-medium">{p.goal}</span>
              <span className="w-full truncate font-mono text-xs text-muted-foreground">{built.query}</span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
