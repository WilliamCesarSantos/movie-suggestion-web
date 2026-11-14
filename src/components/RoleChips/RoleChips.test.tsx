import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleChips } from "./RoleChips";

describe("RoleChips", () => {
  it("renders nothing visible for an empty list", () => {
    const { container } = render(<RoleChips roles={[]} />);
    expect(container.querySelectorAll("span")).toHaveLength(0);
  });

  it("renders every role when there are two or fewer", () => {
    render(<RoleChips roles={["users:read", "movies:read"]} />);
    expect(screen.getByText("users:read")).toBeInTheDocument();
    expect(screen.getByText("movies:read")).toBeInTheDocument();
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it("collapses extra roles into a +N chip whose title lists all roles", () => {
    const roles = ["users:read", "users:write", "movies:read", "movies:write"];
    render(<RoleChips roles={roles} />);
    expect(screen.getByText("users:read")).toBeInTheDocument();
    expect(screen.getByText("users:write")).toBeInTheDocument();
    expect(screen.queryByText("movies:read")).not.toBeInTheDocument();
    const extra = screen.getByText("+2");
    expect(extra).toHaveAttribute("title", roles.join(", "));
  });
});
