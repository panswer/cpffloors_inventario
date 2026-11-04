import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signToken, verifyPassword, hashPassword } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña requeridos" },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    let user = await User.findOne({ username: cleanUsername });

    // En desarrollo/primer uso: si la base de datos está vacía, creamos un admin inicial por defecto
    const totalUsers = await User.countDocuments();
    if (totalUsers === 0 && cleanUsername === "admin" && ["dev", "development"].includes(process.env.NODE_ENV)) {
      user = await User.create({
        username: "admin",
        passwordHash: hashPassword(password),
        name: "Administrador",
        role: "admin",
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      logger.warn(`Intento de login fallido para usuario: ${cleanUsername}`, { username: cleanUsername }, "auth");
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      logger.warn(`Intento de login con usuario inactivo: ${cleanUsername}`, { username: cleanUsername }, "auth");
      return NextResponse.json(
        { error: "Este usuario ha sido dado de baja. Contacte al administrador." },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    logger.info(`Inicio de sesión exitoso: ${user.username}`, { userId: user._id, role: user.role }, "auth");

    const response = NextResponse.json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });

    // Guardar token en cookie HttpOnly para seguridad
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error: any) {
    console.error("Error en POST /api/auth/login:", error);
    return NextResponse.json(
      { error: "Error en el servidor al autenticar" },
      { status: 500 }
    );
  }
}
