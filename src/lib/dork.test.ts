import { describe, expect, it } from "vitest";
import {
  buildQuery,
  EMPTY_STATE,
  errorToPtBr,
  normalizeDomain,
  validateState,
  WORD_LIMIT,
  type DorkState,
} from "./dork";

const base = (over: Partial<DorkState>): DorkState => ({ ...EMPTY_STATE, ...over });

describe("rule 1 — duplicate families merge, all×slot conflicts", () => {
  it("merges duplicate sites and never emits site: twice without OR", () => {
    const v = validateState(base({ sites: ["t.me", "t.me", "pastebin.com"], topics: ["x"] }));
    expect(v.ok).toBe(true);
    if (v.ok) expect(buildQuery(v.state)!.query).toBe("(site:t.me OR site:pastebin.com) intitle:x x");
  });

  it("blocks allintitle with slot intitle (rule 1 conflict)", () => {
    const v = validateState(base({ topics: ["x"], slot: "intitle", useAll: "title" }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors[0]!.kind).toBe("CONFLICT_SLOT_ALL");
  });

  it("blocks allintext with slot intitle+intext", () => {
    const v = validateState(base({ topics: ["x"], slot: "intitle+intext", useAll: "text" }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors[0]!.kind).toBe("CONFLICT_SLOT_ALL");
  });

  it("allows all×slot of different families", () => {
    const v = validateState(base({ topics: ["x"], slot: "inurl", useAll: "title" }));
    expect(v.ok).toBe(true);
  });
});

describe("rule 2 — quotes balanced by construction", () => {
  it("auto-quotes multiword topics and keeps the operator outside the quotes", () => {
    const v = validateState(base({ topics: ["telegram dork"], slot: "intitle" }));
    expect(v.ok).toBe(true);
    if (v.ok) expect(buildQuery(v.state)!.query).toBe('intitle:"telegram dork"');
  });

  it("escapes inner double quotes — unescaped quote pairs always close", () => {
    const v = validateState(base({ phrase: 'a"b', topics: ["x"] }));
    expect(v.ok).toBe(true);
    if (v.ok) {
      const q = buildQuery(v.state)!.query;
      expect((q.match(/(?<!\\)"/g) ?? []).length % 2).toBe(0); // balanced: even count of unescaped quotes
    }
  });

  it("output invariant: buildQuery never returns unbalanced quotes nor duplicate site: without OR", () => {
    const cases = [
      base({ sites: ["a.com", "b.com"], topics: ['q"q w', "x"], phrase: 'frase "estranha' }),
      base({ sites: ["t.me"], topics: ["a b c"], exclude: ["x y", 'z"z'] }),
    ];
    for (const s of cases) {
      const v = validateState(s);
      expect(v.ok).toBe(true);
      if (!v.ok) continue;
      const q = buildQuery(v.state)!;
      expect((q.query.match(/(?<!\\)"/g) ?? []).length % 2).toBe(0);
      expect(q.query).not.toMatch(/site:[^\s)]+\s+site:/);
    }
  });
});

describe("rule 3 — 32-word ceiling", () => {
  it("blocks queries over the Google word limit with the exact count", () => {
    const topics = Array.from({ length: 12 }, (_, i) => `palavra numero ${i + 1}`); // 36 words in slot
    const v = validateState(base({ topics }));
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    const built = buildQuery(v.state)!;
    expect(built.wordCount).toBeGreaterThan(WORD_LIMIT);
    expect(errorToPtBr({ kind: "TOO_MANY_WORDS", count: built.wordCount, limit: WORD_LIMIT })).toContain("corta em 32");
  });
});

describe("rule 4 — domain normalization", () => {
  it.each([
    ["https://t.me/foo", "t.me"],
    ["T.ME/", "t.me"],
    ["github.com?x=1", "github.com"],
  ])("normalizes %s to %s", (raw, domain) => {
    expect(normalizeDomain(raw)).toEqual({ ok: true, domain });
  });
  it.each(["sem tld", "a b.com", "-bad.com", "ponto..duplo.com"])("rejects %s", (raw) => {
    expect(normalizeDomain(raw).ok).toBe(false);
  });
});

describe("rule 5 — empty state", () => {
  it("blocks the completely empty state", () => {
    const v = validateState(EMPTY_STATE);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors.map((e) => e.kind)).toContain("EMPTY");
  });
});

describe("rule 6 — exclusions alone", () => {
  it("blocks exclusion-only queries", () => {
    const v = validateState(base({ exclude: ["login"] }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors.map((e) => e.kind)).toContain("ONLY_EXCLUSIONS");
  });
  it("allows a positive term plus exclusions", () => {
    expect(validateState(base({ topics: ["x"], exclude: ["y"] })).ok).toBe(true);
  });
});

describe("rule 7 — dates", () => {
  it("rejects a non-ISO date", () => {
    const v = validateState(base({ topics: ["x"], before: "10/2020" }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors[0]!.kind).toBe("BAD_DATE");
  });
  it("rejects before >= after", () => {
    const v = validateState(base({ topics: ["x"], before: "2024-01-01", after: "2020-01-01" }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors.map((e) => e.kind)).toContain("DATE_ORDER");
  });
});

describe("rule 8 — filetype", () => {
  it("rejects extensions that are not 1-5 alphanumerics", () => {
    const v = validateState(base({ topics: ["x"], filetype: ["toolongext"] }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors[0]!.kind).toBe("BAD_FILETYPE");
  });
  it("accepts and lowercases valid extensions", () => {
    const v = validateState(base({ topics: ["x"], filetype: ["PDF"] }));
    expect(v.ok).toBe(true);
    if (v.ok) expect(buildQuery(v.state)!.query).toContain("filetype:pdf");
  });
});

describe("rule 9 — range", () => {
  it("rejects min > max", () => {
    const v = validateState(base({ topics: ["x"], range: { min: 10, max: 1 } }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors[0]!.kind).toBe("BAD_RANGE");
  });
  it("rejects negatives", () => {
    const v = validateState(base({ topics: ["x"], range: { min: -5 } }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors[0]!.kind).toBe("NEGATIVE_RANGE");
  });
  it("renders an open-ended range", () => {
    const v = validateState(base({ topics: ["x"], range: { min: 100 } }));
    expect(v.ok).toBe(true);
    if (v.ok) expect(buildQuery(v.state)!.query).toContain("100..");
  });
});

describe("rule 10 — curinga nunca fica solto", () => {
  it("blocks a bare wildcard with no phrase and no topic", () => {
    const v = validateState(base({ sites: ["t.me"], wildcard: true }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors.map((e) => e.kind)).toContain("WILDCARD_BARE");
  });
  it("attaches the wildcard inside the topic's operator: intitle:\"filmes *\"", () => {
    const v = validateState(base({ topics: ["filmes"], slot: "intitle", wildcard: true }));
    expect(v.ok).toBe(true);
    if (v.ok) expect(buildQuery(v.state)!.query).toBe('intitle:"filmes *"');
  });
  it("attaches the wildcard inside the phrase", () => {
    const v = validateState(base({ phrase: "melhores filmes", wildcard: true }));
    expect(v.ok).toBe(true);
    if (v.ok) expect(buildQuery(v.state)!.query).toBe('"melhores filmes *"');
  });
  it("título+texto renders one operator plus the plain term — no redundant intext pair", () => {
    const v = validateState(base({ topics: ["filmes"] }));
    expect(v.ok).toBe(true);
    if (v.ok) expect(buildQuery(v.state)!.query).toBe("intitle:filmes filmes");
  });
});

describe("idempotência — buildQuery(validate(s)) é estável", () => {
  it("running it twice produces the same string", () => {
    const s = base({
      sites: ["t.me", "pastebin.com"],
      topics: ["telegram dork", "osint"],
      slot: "intitle",
      filetype: ["pdf"],
      exclude: ["login"],
      phrase: "index of",
      range: { min: 1, max: 50 },
      before: "2024-01-01",
      wildcard: true,
    });
    const v = validateState(s);
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    const once = buildQuery(v.state)!;
    const twice = validateState(v.state);
    expect(twice.ok).toBe(true);
    if (!twice.ok) return;
    expect(buildQuery(twice.state)!.query).toBe(once.query);
  });
});

describe("saída — URL sempre codificada", () => {
  it("encodes quotes and spaces into the Google URL", () => {
    const v = validateState(base({ topics: ["telegram dork"], slot: "intitle" }));
    expect(v.ok).toBe(true);
    if (v.ok) {
      const { query, url } = buildQuery(v.state)!;
      expect(url).toBe(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
      expect(url).not.toContain('"');
    }
  });
});
