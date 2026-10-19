import { Alvos } from "@/components/Alvos";
import { Paleta } from "@/components/Paleta";
import { Presets } from "@/components/Presets";
import { Preview } from "@/components/Preview";
import { Salvos } from "@/components/Salvos";
import { DorkProvider } from "@/state/DorkProvider";

// Dark-first: the app ships with the shadcn dark theme enabled by default.
document.documentElement.classList.add("dark");

function App() {
  return (
    <DorkProvider>
      <div className="min-h-svh bg-background text-foreground">
        <header className="flex items-center justify-between border-b p-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Google Hacking Search Builder</h1>
            <p className="text-xs text-muted-foreground">Monte queries de Google Hacking sem margem para erro.</p>
          </div>
          <Salvos />
        </header>
        <main className="mx-auto w-full max-w-3xl space-y-8 p-4 pb-0 sm:p-6 sm:pb-0">
          <Presets />
          <Alvos />
          <Paleta />
        </main>
        <div className="mx-auto w-full max-w-3xl sm:p-6">
          <Preview />
        </div>
      </div>
    </DorkProvider>
  );
}

export default App;
