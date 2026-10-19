import { useState } from "react";
import { exportSnapshot, importSnapshot } from "../lib/storage";
import { useDork } from "../state/DorkProvider";
import { Button } from "./ui/button";

/** Drawer "Salvos": favoritos e histórico. Import com validação — arquivo
 *  malformado mostra erro e não toca no estado atual (poka-yoke do módulo). */
export function Salvos() {
  const { snapshot, applyPreset, unfavorite, dropHistory, favorite } = useDork();
  const [open, setOpen] = useState(false);
  const [favName, setFavName] = useState("");
  const [importError, setImportError] = useState<string | undefined>();

  const doImport = async (file: File) => {
    const parsed = importSnapshot(await file.text());
    if (!parsed) {
      setImportError("Arquivo inválido: esperado o JSON exportado por este app (schema v1). Nada foi alterado.");
      return;
    }
    setImportError(undefined);
    window.location.reload(); // provider relê o snapshot na montagem
  };

  return (
    <>
      <Button type="button" variant="ghost" onClick={() => setOpen(true)}>
        Salvos ({snapshot.favorites.length + snapshot.history.length})
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setOpen(false)}>
          <aside
            className="flex w-full max-w-md flex-col gap-4 overflow-y-auto border-l bg-background p-6"
            onClick={(e) => e.stopPropagation()}
            aria-label="Salvos"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Salvos</h2>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>×</Button>
            </div>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Favoritos</h3>
              <div className="flex gap-2">
                <input
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  placeholder="nome do favorito (estado atual)"
                  aria-label="Nome do favorito"
                  value={favName}
                  onChange={(e) => setFavName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && favName.trim() && (favorite(favName.trim()), setFavName(""))}
                />
                <Button type="button" variant="secondary" disabled={!favName.trim()} onClick={() => { favorite(favName.trim()); setFavName(""); }}>
                  ★
                </Button>
              </div>
              {snapshot.favorites.map((f) => (
                <div key={f.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <button className="flex-1 text-left hover:underline" onClick={() => { applyPreset(f.state); setOpen(false); }}>
                    ★ {f.name}
                  </button>
                  <button aria-label={`Remover ${f.name}`} onClick={() => unfavorite(f.id)} className="text-muted-foreground hover:text-destructive">🗑</button>
                </div>
              ))}
              {snapshot.favorites.length === 0 && <p className="text-sm text-muted-foreground">Nenhum favorito ainda.</p>}
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Histórico</h3>
              {snapshot.history.map((h) => (
                <div key={h.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <button className="flex-1 truncate text-left font-mono hover:underline" title={h.query} onClick={() => { applyPreset(h.state); setOpen(false); }}>
                    {h.query}
                  </button>
                  <button aria-label="Remover do histórico" onClick={() => dropHistory(h.id)} className="text-muted-foreground hover:text-destructive">🗑</button>
                </div>
              ))}
              {snapshot.history.length === 0 && <p className="text-sm text-muted-foreground">Copie ou abra uma query para registrá-la aqui.</p>}
            </section>

            <section className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Backup</h3>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  const blob = new Blob([exportSnapshot()], { type: "application/json" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "ghsb-backup.json";
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}>
                  Exportar JSON
                </Button>
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="application/json"
                    className="sr-only"
                    onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])}
                  />
                  <span className="inline-flex h-8 cursor-pointer items-center rounded-md border px-3 text-sm font-medium hover:bg-accent">
                    Importar JSON
                  </span>
                </label>
              </div>
              {importError && <p role="alert" className="text-sm text-destructive">{importError}</p>}
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
