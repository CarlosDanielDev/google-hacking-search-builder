export type Slot = "intitle" | "intext" | "inurl" | "intitle+intext";
export type UseAll = "none" | "title" | "text" | "url";

export interface DorkState {
  sites: string[];
  topics: string[];
  slot: Slot;
  filetype: string[];
  exclude: string[];
  phrase: string;
  range: { min?: number; max?: number };
  before?: string;
  after?: string;
  related?: string;
  wildcard: boolean;
  useAll: UseAll;
}

export const EMPTY_STATE: DorkState = {
  sites: [],
  topics: [],
  slot: "intitle+intext",
  filetype: [],
  exclude: [],
  phrase: "",
  range: {},
  wildcard: false,
  useAll: "none",
};

export type DorkError =
  | { kind: "EMPTY" }
  | { kind: "ONLY_EXCLUSIONS" }
  | { kind: "BAD_DOMAIN"; value: string; reason: string }
  | { kind: "CONFLICT_SLOT_ALL"; family: "intitle" | "intext" | "inurl" }
  | { kind: "TOO_MANY_WORDS"; count: number; limit: number }
  | { kind: "BAD_DATE"; which: "before" | "after"; value: string }
  | { kind: "DATE_ORDER" }
  | { kind: "BAD_FILETYPE"; value: string }
  | { kind: "BAD_RANGE" }
  | { kind: "NEGATIVE_RANGE" }
  | { kind: "WILDCARD_BARE" };

/** rule 4 — accept only a bare hostname; fix what is fixable, reject the rest */
export function normalizeDomain(raw: string): { ok: true; domain: string } | { ok: false; reason: string } {
  let s = raw.trim().toLowerCase();
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, ""); // strip scheme
  s = s.split("/")[0]!.split("?")[0]!.trim(); // strip path/query
  if (s.endsWith(".")) s = s.slice(0, -1);
  if (!s) return { ok: false, reason: "domínio vazio" };
  if (/\s/.test(s)) return { ok: false, reason: "domínio não pode ter espaços" };
  if (!/^[a-z0-9.-]+$/.test(s)) return { ok: false, reason: "só letras, números, pontos e hífens" };
  if (!s.includes(".")) return { ok: false, reason: "falta o TLD (ex.: t.me)" };
  if (/^[.-]|[.-]$/.test(s)) return { ok: false, reason: "não pode começar nem terminar com ponto ou hífen" };
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(s))
    return { ok: false, reason: "nome de domínio inválido" };
  return { ok: true, domain: s };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const SLOTS: Slot[] = ["intitle", "intext", "inurl", "intitle+intext"];
const USE_ALL: UseAll[] = ["none", "title", "text", "url"];

/** Structural guard for states coming from outside the app (localStorage,
 *  imported JSON): a malformed state must be rejected, never mapped over. */
export function isDorkState(x: unknown): x is DorkState {
  if (typeof x !== "object" || x === null) return false;
  const s = x as Record<string, unknown>;
  const strArr = (v: unknown) => Array.isArray(v) && v.every((i) => typeof i === "string");
  const optNum = (v: unknown) => v === undefined || typeof v === "number";
  if (typeof s.range !== "object" || s.range === null) return false;
  const r = s.range as Record<string, unknown>;
  return (
    strArr(s.sites) &&
    strArr(s.topics) &&
    strArr(s.filetype) &&
    strArr(s.exclude) &&
    typeof s.slot === "string" && SLOTS.includes(s.slot as Slot) &&
    typeof s.useAll === "string" && USE_ALL.includes(s.useAll as UseAll) &&
    typeof s.wildcard === "boolean" &&
    typeof s.phrase === "string" &&
    optNum(r.min) && optNum(r.max) &&
    (s.related === undefined || typeof s.related === "string") &&
    (s.before === undefined || typeof s.before === "string") &&
    (s.after === undefined || typeof s.after === "string")
  );
}

/** rule 1 (dupes/conflicts) + 4 + 7 + 8 + 9 — everything checkable without assembly.
 *  Returns the cleaned state or the first hard error. */
export function validateState(s: DorkState): { ok: true; state: DorkState } | { ok: false; errors: DorkError[] } {
  const errors: DorkError[] = [];

  // rule 4 + 1 — normalize domains, dedupe, reject invalid
  const sites: string[] = [];
  for (const raw of s.sites) {
    const n = normalizeDomain(raw);
    if (!n.ok) {
      errors.push({ kind: "BAD_DOMAIN", value: raw, reason: n.reason });
      continue;
    }
    if (!sites.includes(n.domain)) sites.push(n.domain);
  }

  // rule 1 — allintitle/allintext/allinurl cannot coexist with the single-slot operator
  if (s.useAll !== "none") {
    const family = s.useAll === "title" ? "intitle" : s.useAll === "text" ? "intext" : "inurl";
    if (s.slot === family || s.slot === "intitle+intext" && family !== "inurl")
      errors.push({ kind: "CONFLICT_SLOT_ALL", family });
  }

  // rule 8 — filetype values
  const filetype = s.filetype.map((f) => f.trim().toLowerCase().replace(/^\./, ""));
  for (const f of filetype)
    if (!/^[a-z0-9]{1,5}$/.test(f)) errors.push({ kind: "BAD_FILETYPE", value: f });

  // rule 7 — dates
  for (const which of ["before", "after"] as const) {
    const v = s[which];
    if (v && !DATE_RE.test(v)) errors.push({ kind: "BAD_DATE", which, value: v });
  }
  if (s.before && s.after && DATE_RE.test(s.before) && DATE_RE.test(s.after) && s.before >= s.after)
    errors.push({ kind: "DATE_ORDER" });

  // rule 9 — range
  const { min, max } = s.range;
  if ((min !== undefined && min < 0) || (max !== undefined && max < 0))
    errors.push({ kind: "NEGATIVE_RANGE" });
  if (min !== undefined && max !== undefined && min > max) errors.push({ kind: "BAD_RANGE" });

  const topics = s.topics.map((t) => t.trim()).filter(Boolean);
  const exclude = s.exclude.map((t) => t.trim()).filter(Boolean);

  // rule 5 — empty state produces nothing
  const hasOperator =
    sites.length > 0 ||
    topics.length > 0 ||
    filetype.length > 0 ||
    s.phrase.trim() !== "" ||
    !!s.related?.trim() ||
    min !== undefined ||
    max !== undefined ||
    !!s.before ||
    !!s.after;
  if (!hasOperator && !s.wildcard) errors.push({ kind: "EMPTY" });

  // rule 6 — Google needs at least one positive term
  const hasPositive =
    sites.length > 0 || topics.length > 0 || filetype.length > 0 || s.phrase.trim() !== "" || !!s.related?.trim();

  // rule 10 — a bare `*` matches "any word" nowhere useful: the wildcard must
  // attach to a phrase or a topic, never float alone at the end of the query
  if (s.wildcard && !s.phrase.trim() && topics.length === 0) errors.push({ kind: "WILDCARD_BARE" });
  if (!hasPositive && exclude.length > 0) errors.push({ kind: "ONLY_EXCLUSIONS" });

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    state: { ...s, sites, topics, filetype, exclude, phrase: s.phrase.trim(), related: s.related?.trim() || undefined },
  };
}

export const WORD_LIMIT = 32;

/** rule 2 — always-quoted terms with balanced quotes by construction */
function q(term: string): string {
  const escaped = term.replace(/"/g, '\\"');
  return /\s/.test(escaped) || /"/.test(escaped) ? `"${escaped}"` : escaped;
}

export interface BuiltQuery {
  query: string;
  url: string;
  wordCount: number;
}

/** Assembly in fixed order. Receives a VALIDATED state: it never re-litigates
 *  rules, it only renders. Returns undefined on the hard blockers that survive
 *  validation errors the caller chose to ignore. */
export function buildQuery(v: DorkState): BuiltQuery | undefined {
  const parts: string[] = [];

  if (v.sites.length === 1) parts.push(`site:${v.sites[0]}`);
  else if (v.sites.length > 1) parts.push(`(${v.sites.map((d) => `site:${d}`).join(" OR ")})`);

  const slotOps: Record<Exclude<Slot, "intitle+intext">, string> = {
    intitle: "intitle",
    intext: "intext",
    inurl: "inurl",
  };
  // the wildcard always rides INSIDE a term ("filmes *") — validation (rule 10)
  // guarantees it never renders bare at the end of the query
  const wt = v.wildcard ? (t: string) => `${t} *` : (t: string) => t;
  if (v.slot === "intitle+intext") {
    // title operator + the plain term: `intitle:x x` reads as "pages about x
    // with x in the title" — one operator, no redundant intext:x pair
    for (const t of v.topics) parts.push(`intitle:${q(wt(t))} ${q(t)}`);
  } else {
    for (const t of v.topics) parts.push(`${slotOps[v.slot]}:${q(wt(t))}`);
  }

  if (v.useAll === "title" && v.topics.length) parts.push(`allintitle:${v.topics.map(wt).join(" ")}`);
  if (v.useAll === "text" && v.topics.length) parts.push(`allintext:${v.topics.map(wt).join(" ")}`);
  if (v.useAll === "url" && v.topics.length) parts.push(`allinurl:${v.topics.map(wt).join(" ")}`);

  if (v.phrase.trim()) parts.push(q(wt(v.phrase.trim())));
  for (const f of v.filetype) parts.push(`filetype:${f}`);
  if (v.before) parts.push(`before:${v.before}`);
  if (v.after) parts.push(`after:${v.after}`);
  if (v.range.min !== undefined || v.range.max !== undefined)
    parts.push(`${v.range.min ?? ""}..${v.range.max ?? ""}`);
  if (v.related) parts.push(`related:${v.related}`);
  for (const t of v.exclude) parts.push(`-${q(t)}`);

  const query = parts.join(" ").trim();
  if (!query) return undefined;
  const wordCount = query.split(/\s+/).filter(Boolean).length;
  return { query, url: `https://www.google.com/search?q=${encodeURIComponent(query)}`, wordCount };
}

/** rule 3 — the word ceiling, checked on the assembled string */
export function wordLimitError(wordCount: number): DorkError | undefined {
  return wordCount > WORD_LIMIT ? { kind: "TOO_MANY_WORDS", count: wordCount, limit: WORD_LIMIT } : undefined;
}

export function errorToPtBr(e: DorkError): string {
  switch (e.kind) {
    case "EMPTY":
      return "Query vazia: escolha um alvo, um tópico ou um operador.";
    case "ONLY_EXCLUSIONS":
      return "Só exclusões não bastam: o Google exige ao menos um termo positivo.";
    case "BAD_DOMAIN":
      return `Domínio inválido "${e.value}": ${e.reason}.`;
    case "CONFLICT_SLOT_ALL":
      return `Conflito: allin${e.family.slice(2)} não pode coexistir com o operador ${e.family}: do slot.`;
    case "TOO_MANY_WORDS":
      return `Query com ${e.count} palavras: o Google corta em ${e.limit}.`;
    case "BAD_DATE":
      return `Data inválida em ${e.which}: use YYYY-MM-DD (recebido "${e.value}").`;
    case "DATE_ORDER":
      return "Intervalo de datas invertido: before deve ser antes de after.";
    case "BAD_FILETYPE":
      return `Extensão inválida "${e.value}": use 1–5 caracteres alfanuméricos (ex.: pdf).`;
    case "BAD_RANGE":
      return "Faixa numérica invertida: o mínimo passa do máximo.";
    case "NEGATIVE_RANGE":
      return "Faixa numérica não aceita negativos.";
    case "WILDCARD_BARE":
      return "Curinga * solto não restringe nada: use com uma frase ou um tópico.";
  }
}
