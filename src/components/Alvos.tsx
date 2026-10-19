import { useState, type KeyboardEvent } from "react";
import { normalizeDomain, type Slot } from "../lib/dork";
import { useDork } from "../state/DorkProvider";
import { Button } from "./ui/button";

const SITE_PRESETS = ["t.me", "github.com", "pastebin.com", "drive.google.com", "dropbox.com", "s3.amazonaws.com", "gov.br", "edu.br"];

const SLOTS: { id: Slot; label: string }[] = [
  { id: "intitle", label: "no título" },
  { id: "intext", label: "no texto" },
  { id: "inurl", label: "na URL" },
  { id: "intitle+intext", label: "título + texto" },
];

const inputCls =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Chip({ text, onRemove }: { text: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm text-secondary-foreground">
      {text}
      <button onClick={onRemove} aria-label={`Remover ${text}`} className="text-muted-foreground hover:text-foreground">
        ×
      </button>
    </span>
  );
}

/** Seção Alvos: presets de site (multi), domínio custom (poka-yoke: valor
 *  inválido nunca entra no estado), tópicos em chips e o slot dos operadores. */
export function Alvos() {
  const { dork, setDork } = useDork();
  const [domain, setDomain] = useState("");
  const [domainError, setDomainError] = useState<string | undefined>();
  const [topic, setTopic] = useState("");

  const toggleSite = (site: string) =>
    setDork({
      ...dork,
      sites: dork.sites.includes(site) ? dork.sites.filter((s) => s !== site) : [...dork.sites, site],
    });

  const commitDomain = () => {
    const n = normalizeDomain(domain);
    if (!n.ok) {
      setDomainError(n.reason);
      return;
    }
    setDomainError(undefined);
    if (!dork.sites.includes(n.domain)) setDork({ ...dork, sites: [...dork.sites, n.domain] });
    setDomain("");
  };

  const commitTopic = () => {
    const t = topic.trim();
    if (t && !dork.topics.includes(t)) setDork({ ...dork, topics: [...dork.topics, t] });
    setTopic("");
  };

  const topicKeys = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitTopic();
    } else if (e.key === "Backspace" && topic === "" && dork.topics.length) {
      setDork({ ...dork, topics: dork.topics.slice(0, -1) });
    }
  };

  return (
    <section aria-labelledby="alvos-h" className="space-y-4">
      <h2 id="alvos-h" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Alvo
      </h2>

      <div className="flex flex-wrap gap-2">
        {SITE_PRESETS.map((site) => (
          <Button
            key={site}
            type="button"
            variant={dork.sites.includes(site) ? "default" : "outline"}
            size="sm"
            aria-pressed={dork.sites.includes(site)}
            onClick={() => toggleSite(site)}
          >
            {site}
          </Button>
        ))}
      </div>

      {dork.sites.filter((s) => !SITE_PRESETS.includes(s)).map((s) => (
        <Chip key={s} text={s} onRemove={() => toggleSite(s)} />
      ))}

      <div>
        <div className="flex gap-2">
          <input
            className={inputCls}
            placeholder="domínio custom (ex.: exemplo.com.br)"
            value={domain}
            aria-label="Domínio custom"
            aria-invalid={!!domainError}
            onChange={(e) => {
              setDomain(e.target.value);
              setDomainError(undefined);
            }}
            onKeyDown={(e) => e.key === "Enter" && commitDomain()}
          />
          <Button type="button" variant="secondary" onClick={commitDomain}>
            Add
          </Button>
        </div>
        {domainError && <p className="mt-1 text-sm text-destructive">{domainError}</p>}
      </div>

      <div>
        <input
          className={inputCls}
          placeholder="tópicos — Enter adiciona, Backspace remove"
          value={topic}
          aria-label="Tópicos"
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={topicKeys}
        />
        {dork.topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {dork.topics.map((t, i) => (
              <Chip key={t} text={t} onRemove={() => setDork({ ...dork, topics: dork.topics.filter((_, j) => j !== i) })} />
            ))}
          </div>
        )}
      </div>

      <fieldset className="flex flex-wrap items-center gap-3">
        <legend className="sr-only">Onde os tópicos devem aparecer</legend>
        {SLOTS.map((s) => (
          <label key={s.id} className="flex cursor-pointer items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="slot"
              checked={dork.slot === s.id}
              onChange={() => setDork({ ...dork, slot: s.id })}
            />
            {s.label}
          </label>
        ))}
      </fieldset>
    </section>
  );
}
