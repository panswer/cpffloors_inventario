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

    // Verificar si la cuenta se encuentra actualmente bloqueada por intentos fallidos
    const now = new Date();
    if (user.lockUntil && user.lockUntil > now) {
      logger.warn(
        `Intento de acceso a cuenta bloqueada: ${cleanUsername}`,
        { username: cleanUsername, lockUntil: user.lockUntil },
        "auth"
      );
      return NextResponse.json(
        {
          error: "Tu cuenta ha sido bloqueada. Contacte al administrador.",
        },
        { status: 403 }
      );
    }

    if (!user.isActive) {
      logger.warn(`Intento de login con usuario inactivo: ${cleanUsername}`, { username: cleanUsername }, "auth");
      return NextResponse.json(
        { error: "Este usuario ha sido dado de baja. Contacte al administrador." },
        { status: 403 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      // Incrementar contador de intentos fallidos
      let currentAttempts = (user.loginAttempts || 0) + 1;
      let lockUntil: Date | undefined = undefined;

      // Si alcanzó o superó los 3 intentos fallidos, bloquear la cuenta
      const MAX_ATTEMPTS = 3;
      if (currentAttempts >= MAX_ATTEMPTS) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Bloqueo de 15 minutos
        logger.warn(
          `Usuario bloqueado tras 3 intentos fallidos: ${cleanUsername}`,
          { username: cleanUsername, attempts: currentAttempts, lockUntil },
          "auth"
        );
        user.loginAttempts = currentAttempts;
        user.lockUntil = lockUntil;
        await user.save();

        return NextResponse.json(
          {
            error: "Tu cuenta ha sido bloqueada. Contacte al administrador.",
          },
          { status: 403 }
        );
      }

      user.loginAttempts = currentAttempts;
      await user.save();

      logger.warn(
        `Intento de login fallido para usuario: ${cleanUsername}. Intentos acumulados: ${currentAttempts}`,
        { username: cleanUsername, currentAttempts },
        "auth"
      );

      return NextResponse.json(
        {
          error: "Credenciales inválidas",
        },
        { status: 401 }
      );
    }

    // Login exitoso: restablecer intentos fallidos y bloqueo
    if ((user.loginAttempts && user.loginAttempts > 0) || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
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
        mustChangePassword: Boolean(user.mustChangePassword),
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
