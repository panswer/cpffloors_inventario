import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LoginForm } from "./LoginForm";

describe("<LoginForm /> Organism", () => {
  it("debe renderizar los campos de usuario y contraseña", () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/^Nombre de Usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña/i, { selector: "input" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  it("debe mostrar el mensaje de error cuando errorMessage está presente", () => {
    render(
      <LoginForm
        onSubmit={vi.fn()}
        errorMessage="Credenciales incorrectas"
      />
    );

    expect(screen.getByText("Credenciales incorrectas")).toBeInTheDocument();
  });

  it("debe enviar los valores ingresados al hacer submit", () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    const userInput = screen.getByLabelText(/^Nombre de Usuario/i);
    const passInput = screen.getByLabelText(/^Contraseña/i, { selector: "input" });
    const submitBtn = screen.getByRole("button", { name: /Iniciar Sesión/i });

    fireEvent.change(userInput, { target: { value: "admin" } });
    fireEvent.change(passInput, { target: { value: "secret123" } });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      username: "admin",
      password: "secret123",
    });
  });

  it("debe alternar la visibilidad de la contraseña", () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    const passInput = screen.getByLabelText(/^Contraseña/i, { selector: "input" }) as HTMLInputElement;
    expect(passInput.type).toBe("password");

    const toggleBtn = screen.getByRole("button", { name: /mostrar contraseña/i });
    fireEvent.click(toggleBtn);
    expect(passInput.type).toBe("text");

    fireEvent.click(toggleBtn);
    expect(passInput.type).toBe("password");
  });
});
