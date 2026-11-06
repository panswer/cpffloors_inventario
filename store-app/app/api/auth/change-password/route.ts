import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken, verifyPassword, hashPassword } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Si se envía contraseña actual, validarla
    if (currentPassword) {
      const isValid = verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "La contraseña actual no es correcta" },
          { status: 400 }
        );
      }
    }

    user.passwordHash = hashPassword(newPassword);
    user.mustChangePassword = false;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    logger.info(
      `Contraseña cambiada exitosamente para usuario: ${user.username}`,
      { userId: user._id },
      "auth"
    );

    return NextResponse.json({
      message: "Contraseña actualizada exitosamente",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        mustChangePassword: false,
      },
    });
  } catch (error: any) {
    console.error("Error en POST /api/auth/change-password:", error);
    return NextResponse.json(
      { error: "Error en el servidor al cambiar contraseña" },
      { status: 500 }
    );
  }
}
