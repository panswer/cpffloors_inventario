import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { requireAuth } from "@/lib/authMiddleware";

// GET /api/users - Listar usuarios (con soporte de búsqueda y paginación)
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req, ["admin", "manager"]);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const isActiveParam = searchParams.get("isActive");

    // Construcción dinámica de filtros
    const filter: any = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (isActiveParam !== null && isActiveParam !== undefined) {
      filter.isActive = isActiveParam === "true";
    }

    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return NextResponse.json({ users, count: users.length });
  } catch (error: any) {
    console.error("Error en GET /api/users:", error);
    return NextResponse.json(
      { error: "Error al obtener la lista de usuarios" },
      { status: 500 }
    );
  }
}

// POST /api/users - Crear un nuevo usuario
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req, ["admin"]);
    if (!auth.authorized) return auth.response;

    await connectDB();

    const body = await req.json();
    const { username, password, name, role } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "El nombre de usuario y la contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();

    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return NextResponse.json(
        { error: "El nombre de usuario ya se encuentra registrado" },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      username: cleanUsername,
      passwordHash: hashPassword(password),
      name: name?.trim() || "",
      role: role && ["admin", "manager", "user"].includes(role) ? role : "user",
      isActive: true,
    });

    const userObj = newUser.toObject();
    delete (userObj as any).passwordHash;

    return NextResponse.json(
      { message: "Usuario creado exitosamente", user: userObj },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error en POST /api/users:", error);
    return NextResponse.json(
      { error: "Error al registrar el usuario" },
      { status: 500 }
    );
  }
}
