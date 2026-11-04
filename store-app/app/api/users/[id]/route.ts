import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { requireAuth } from "@/lib/authMiddleware";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/[id] - Buscar usuario por ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req, ["admin", "manager"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(id).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Error en GET /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Error al consultar el usuario" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Actualizar usuario
// Reglas:
// - admin: puede actualizar cualquier usuario y asignar cualquier rol
// - manager: solamente puede actualizar usuarios con rol "user" (no puede editar a otros managers ni a admins)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req, ["admin", "manager"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();
    const { name, role, password, isActive } = body;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Validación de permisos según el rol del actor:
    if (auth.user?.role === "manager") {
      // El manager solo puede actualizar a usuarios cuyo rol actual sea "user"
      if (user.role !== "user") {
        return NextResponse.json(
          { error: "Acceso denegado. Los gerentes solamente pueden actualizar usuarios con el rol 'user'." },
          { status: 403 }
        );
      }

      // El manager no puede cambiar el rol a nada que no sea "user"
      if (role !== undefined && role !== "user") {
        return NextResponse.json(
          { error: "Acceso denegado. Los gerentes no pueden elevar o cambiar roles a 'manager' o 'admin'." },
          { status: 403 }
        );
      }
    } else if (auth.user?.role === "admin") {
      // El admin puede asignar cualquier rol válido
      if (role !== undefined && ["admin", "manager", "user"].includes(role)) {
        user.role = role;
      }
    }

    // Estado activo/baja
    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
    }

    if (name !== undefined) user.name = name.trim();
    if (password && password.trim().length >= 6) {
      user.passwordHash = hashPassword(password);
    }

    await user.save();

    const updatedUser = user.toObject();
    delete (updatedUser as any).passwordHash;

    return NextResponse.json({
      message: "Usuario actualizado correctamente",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error en PUT /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Dar de baja (Soft delete)
// Reglas:
// - admin: puede dar de baja a cualquiera (excepto a sí mismo)
// - manager: puede dar de baja solamente a usuarios con rol "user"
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req, ["admin", "manager"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    // Evitar que el usuario se dé de baja a sí mismo
    if (auth.user?.userId === id) {
      return NextResponse.json(
        { error: "No puedes dar de baja tu propia cuenta" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Si es manager, solo puede dar de baja a usuarios con rol "user"
    if (auth.user?.role === "manager" && user.role !== "user") {
      return NextResponse.json(
        { error: "Acceso denegado. Los gerentes solamente pueden dar de baja a usuarios con rol 'user'." },
        { status: 403 }
      );
    }

    // Soft delete: cambiar estado a inactivo
    user.isActive = false;
    await user.save();

    return NextResponse.json({
      message: "Usuario dado de baja exitosamente",
      userId: id,
    });
  } catch (error: any) {
    console.error("Error en DELETE /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Error al dar de baja el usuario" },
      { status: 500 }
    );
  }
}
