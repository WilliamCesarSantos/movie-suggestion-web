import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthCard } from "./AuthCard";

describe("AuthCard", () => {
  it("renders the Movie Suggest wordmark", () => {
    render(
      <AuthCard title="Entrar na sua conta">
        <p>content</p>
      </AuthCard>
    );
    expect(screen.getByLabelText("Movie Suggest")).toBeInTheDocument();
  });

  it("renders the title as a top-level heading", () => {
    render(
      <AuthCard title="Entrar na sua conta">
        <p>content</p>
      </AuthCard>
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Entrar na sua conta" })
    ).toBeInTheDocument();
  });

  it("renders its children inside the card", () => {
    render(
      <AuthCard title="Entrar na sua conta">
        <p data-testid="auth-card-child">hello</p>
      </AuthCard>
    );
    expect(screen.getByTestId("auth-card-child")).toBeInTheDocument();
  });

  it("renders the subtitle when provided", () => {
    render(
      <AuthCard title="Entrar na sua conta" subtitle="Bem vindo de volta">
        <p>content</p>
      </AuthCard>
    );
    expect(screen.getByText("Bem vindo de volta")).toBeInTheDocument();
  });

  it("omits the subtitle when it is not provided", () => {
    render(
      <AuthCard title="Entrar na sua conta">
        <p>content</p>
      </AuthCard>
    );
    expect(screen.queryByText("Bem vindo de volta")).not.toBeInTheDocument();
  });
});
