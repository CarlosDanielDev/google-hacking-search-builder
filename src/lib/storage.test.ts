import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_STATE } from "./dork";
import { addFavorite, importSnapshot, parseSnapshot, pushHistory, removeFavorite } from "./storage";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("histórico com dedupe (regra do módulo)", () => {
  it("copiar 2× a mesma query grava 1 entrada, mais recente primeiro", () => {
    pushHistory(EMPTY_STATE, "site:t.me x");
    pushHistory(EMPTY_STATE, "site:pastebin.com y");
    pushHistory(EMPTY_STATE, "site:t.me x");
    const s = pushHistory(EMPTY_STATE, "site:t.me x");
    expect(s.history).toHaveLength(2);
    expect(s.history[0]!.query).toBe("site:t.me x");
  });
});

describe("favorito sobrevive a reload", () => {
  it("favorito gravado volta no snapshot lido do localStorage", () => {
    addFavorite(EMPTY_STATE, "meu dork");
    const s = JSON.parse(localStorage.getItem("ghsb.v1")!);
    expect(s.favorites).toHaveLength(1);
    expect(s.favorites[0].name).toBe("meu dork");
  });
});

describe("import malformado", () => {
  it("importSnapshot devolve undefined para JSON inválido e mantém o estado atual", () => {
    addFavorite(EMPTY_STATE, "original");
    expect(importSnapshot("isto não é json")).toBeUndefined();
    expect(importSnapshot('{"v":2,"favorites":[],"history":[]}')).toBeUndefined();
    const names = JSON.parse(localStorage.getItem("ghsb.v1")!).favorites.map((f: { name: string }) => f.name);
    expect(names).toContain("original");
  });
  it("parseSnapshot rejeita histórico sem os campos obrigatórios", () => {
    expect(parseSnapshot('{"v":1,"favorites":[],"history":[{"query":"x"}]}')).toBeUndefined();
    const validState = { sites: [], topics: [], slot: "intitle", filetype: [], exclude: [], phrase: "", range: {}, wildcard: false, useAll: "none" };
    expect(importSnapshot(JSON.stringify({ v: 1, favorites: [{ id: "x", name: "n", state: validState }], history: [] }))).toBeDefined();
  });
  it("parseSnapshot rejeita state malformado (anti-DoS: nunca mapeia lixo)", () => {
    const bad = '{"v":1,"favorites":[{"id":"x","name":"n","state":{"topics":"não sou array"}}],"history":[]}';
    expect(parseSnapshot(bad)).toBeUndefined();
  });
});

describe("localStorage indisponível", () => {
  it("app funciona sem crash e sem persistir", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new DOMException("denied");
      },
      setItem: () => {
        throw new DOMException("denied");
      },
    });
    const s = pushHistory(EMPTY_STATE, "q");
    expect(s.history).toHaveLength(1);
    expect(removeFavorite("x").favorites).toHaveLength(0);
  });
});
