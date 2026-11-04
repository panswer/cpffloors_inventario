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
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req, ["admin"]);
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

    if (name !== undefined) user.name = name.trim();
    if (role !== undefined && ["admin", "manager", "user"].includes(role)) {
      user.role = role;
    }
    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
    }
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

// DELETE /api/users/[id] - Dar de baja (Soft delete o reactivación opcional)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = requireAuth(req, ["admin"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
    }

    // Evitar que el administrador se dé de baja a sí mismo
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
