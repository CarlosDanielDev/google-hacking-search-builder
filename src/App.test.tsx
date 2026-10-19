import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders a Button and activates dark mode by default", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Começar" })).toBeTruthy();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
