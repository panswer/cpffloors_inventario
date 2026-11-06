import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AuthTemplate } from "./AuthTemplate";

describe("<AuthTemplate /> Template", () => {
  it("debe renderizar título, subtítulo e hijos", () => {
    render(
      <AuthTemplate
        title="Bienvenido al Sistema"
        subtitle="Ingresa tus credenciales para continuar"
        icon={<span data-testid="auth-icon">🔐</span>}
      >
        <div data-testid="auth-child">Formulario de Prueba</div>
      </AuthTemplate>
    );

    expect(screen.getByText("Bienvenido al Sistema")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tus credenciales para continuar")).toBeInTheDocument();
    expect(screen.getByTestId("auth-icon")).toBeInTheDocument();
    expect(screen.getByTestId("auth-child")).toBeInTheDocument();
  });
});
