import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "@/App";
import { renderApp, seedSession } from "@/test/renderApp";

describe("Users list router-state toast", () => {
  it("shows a string toast as a status banner and clears the router state (replace)", async () => {
    seedSession(["*"]);
    const seen: { state: unknown } = { state: undefined };
    function Probe() {
      const loc = useLocation();
      seen.state = loc.state;
      return null;
    }
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[{ pathname: "/users", state: { toast: "Salvo com sucesso." } }]}>
          <Probe />
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const banner = await screen.findByText("Salvo com sucesso.");
    expect(banner.closest('[role="status"]')).not.toBeNull();
    await waitFor(() => expect(seen.state).toBeNull());

    // After the list settles the state is still empty, so a reload would not show the toast again.
    await screen.findAllByText("User 01");
    expect(seen.state).toBeNull();
  });

  it("dismisses the banner with the close button", async () => {
    seedSession(["*"]);
    const user = userEvent.setup();
    renderApp({ pathname: "/users", state: { toast: "Aviso." } });
    expect(await screen.findByText("Aviso.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Dispensar aviso" }));
    expect(screen.queryByText("Aviso.")).not.toBeInTheDocument();
  });

  it.each([
    ["number", { toast: 42 }],
    ["object", { toast: { message: "x" } }],
    ["null", { toast: null }],
    ["missing key", { other: "Oi" }],
    ["null state", null],
  ])("ignores a non-string toast (%s)", async (_label, state) => {
    seedSession(["*"]);
    renderApp({ pathname: "/users", state });
    await screen.findAllByText("User 01");
    expect(screen.queryByRole("button", { name: "Dispensar aviso" })).not.toBeInTheDocument();
    expect(screen.queryByText("42")).not.toBeInTheDocument();
  });
});
