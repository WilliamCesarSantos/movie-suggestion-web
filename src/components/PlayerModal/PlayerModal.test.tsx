import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerModal } from "./PlayerModal";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("PlayerModal", () => {
  it("renders a labelled dialog with a progressbar and no <video>", () => {
    const { container } = render(<PlayerModal title="Matrix" onClose={() => {}} onFinish={() => {}} />);
    expect(screen.getByRole("dialog", { name: "Reproduzindo Matrix" })).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(container.querySelector("video")).toBeNull();
    expect(screen.getByText("Reproduzindo (simulação)")).toBeInTheDocument();
  });

  it("moves focus into the dialog on mount", () => {
    render(<PlayerModal title="Matrix" onClose={() => {}} onFinish={() => {}} />);
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("calls onClose on Escape and on the Fechar button", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<PlayerModal title="Matrix" onClose={onClose} onFinish={() => {}} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("calls onFinish when skipping", async () => {
    const onFinish = vi.fn();
    render(<PlayerModal title="Matrix" onClose={() => {}} onFinish={onFinish} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Pular para avaliar" }));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("traps focus with Tab and Shift+Tab", async () => {
    const user = userEvent.setup();
    render(<PlayerModal title="Matrix" onClose={() => {}} onFinish={() => {}} />);
    const close = screen.getByRole("button", { name: "Fechar" });
    const skip = screen.getByRole("button", { name: "Pular para avaliar" });
    skip.focus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(skip).toHaveFocus();
  });

  it("returns focus to the previously focused element on unmount", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    const { unmount } = render(<PlayerModal title="Matrix" onClose={() => {}} onFinish={() => {}} />);
    expect(trigger).not.toHaveFocus();
    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("finishes automatically after the simulated duration", () => {
    let now = 0;
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(performance, "now").mockImplementation(() => now);
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      callbacks.push(cb);
      return callbacks.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    const onFinish = vi.fn();
    render(<PlayerModal title="Matrix" onClose={() => {}} onFinish={onFinish} />);

    now = 1500;
    act(() => callbacks.shift()?.(now));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    expect(onFinish).not.toHaveBeenCalled();

    now = 3000;
    act(() => callbacks.shift()?.(now));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
