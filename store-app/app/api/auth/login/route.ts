import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signToken, verifyPassword, hashPassword } from "@/lib/auth";

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
    if (totalUsers === 0 && cleanUsername === "admin") {
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
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    });

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
