import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

// Dark-first: the app ships with the shadcn dark theme enabled by default.
document.documentElement.classList.add("dark");

afterEach(cleanup);

describe("App", () => {
  it("renders the builder shell with dark mode active", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /google hacking search builder/i })).toBeTruthy();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("blocks both output actions on the empty state and shows the empty instruction", () => {
    render(<App />);
    const copy = screen.getByRole("button", { name: "Copiar" }) as HTMLButtonElement;
    const open = screen.getByRole("button", { name: "Abrir no Google" }) as HTMLButtonElement;
    expect(copy.disabled).toBe(true);
    expect(open.disabled).toBe(true);
    expect(screen.getByText(/a query aparece aqui/i)).toBeTruthy();
  });
});
