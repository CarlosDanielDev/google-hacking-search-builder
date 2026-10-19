import { Button } from "@/components/ui/button";

// Dark-first: the app ships with the shadcn dark theme enabled by default.
document.documentElement.classList.add("dark");

function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-8 text-foreground">
      <h1 className="text-2xl font-semibold tracking-tight">
        Google Hacking Search Builder
      </h1>
      <p className="max-w-prose text-center text-sm text-muted-foreground">
        Monte queries de Google Hacking sem margem para erro.
      </p>
      <Button>Começar</Button>
    </main>
  );
}

export default App;
