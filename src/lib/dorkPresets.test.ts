import { describe, expect, it } from "vitest";
import { buildQuery, validateState } from "./dork";
import { DORK_PRESETS } from "./dorkPresets";

describe("catálogo de presets", () => {
  it("todo preset nasce válido — inválido não entra no catálogo", () => {
    expect(DORK_PRESETS.length).toBeGreaterThanOrEqual(10);
    for (const p of DORK_PRESETS) {
      const v = validateState(p.state);
      expect(v.ok, `preset ${p.id} inválido`).toBe(true);
      if (v.ok) expect(buildQuery(v.state)).toBeDefined();
    }
  });
});
