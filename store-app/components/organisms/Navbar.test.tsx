import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Navbar } from "./Navbar";

describe("<Navbar /> Organism", () => {
  it("debe mostrar el nombre o username y el rol del usuario autenticado", () => {
    const user = {
      name: "Carlos Gerente",
      username: "carlosg",
      role: "manager",
    };

    render(<Navbar user={user} onLogout={vi.fn()} />);

    expect(screen.getByText("Carlos Gerente")).toBeInTheDocument();
    expect(screen.getByText("manager")).toBeInTheDocument();
    expect(screen.getByText("CPF Floors")).toBeInTheDocument();
  });

  it("debe invocar onLogout al hacer clic en Cerrar Sesión", () => {
    const handleLogout = vi.fn();
    render(<Navbar user={{ username: "admin", role: "admin" }} onLogout={handleLogout} />);

    const logoutBtn = screen.getByText("Cerrar Sesión");
    fireEvent.click(logoutBtn);

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it("debe invocar onOpenProfile al hacer clic en el perfil de usuario", () => {
    const handleProfile = vi.fn();
    render(
      <Navbar
        user={{ username: "admin", name: "Administrador", role: "admin" }}
        onLogout={vi.fn()}
        onOpenProfile={handleProfile}
      />
    );

    const profileBtn = screen.getByTitle("Ver mi perfil");
    fireEvent.click(profileBtn);

    expect(handleProfile).toHaveBeenCalledTimes(1);
  });
});
