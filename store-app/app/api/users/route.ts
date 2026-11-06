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

    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 50) : 50;

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      users,
      count: totalCount,
      limit,
    });
  } catch (error: any) {
    console.error("Error en GET /api/users:", error);
    return NextResponse.json(
      { error: "Error al obtener la lista de usuarios" },
      { status: 500 }
    );
  }
}

// POST /api/users - Crear un nuevo usuario
// Reglas:
// - admin: puede crear usuarios con cualquier rol ("admin", "manager", "user")
// - manager: solamente puede crear usuarios con el rol "user"
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req, ["admin", "manager"]);
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

    // Determinación y validación del rol según quién crea el usuario
    let assignedRole: "admin" | "manager" | "user" = "user";

    if (auth.user?.role === "admin") {
      // El admin puede asignar cualquier rol válido
      if (role && ["admin", "manager", "user"].includes(role)) {
        assignedRole = role;
      }
    } else if (auth.user?.role === "manager") {
      // El manager solo puede crear usuarios con rol "user"
      if (role && role !== "user") {
        return NextResponse.json(
          { error: "Los gerentes solamente pueden crear usuarios con el rol 'user'." },
          { status: 403 }
        );
      }
      assignedRole = "user";
    }

    const newUser = await User.create({
      username: cleanUsername,
      passwordHash: hashPassword(password),
      name: name?.trim() || "",
      role: assignedRole,
      isActive: true,
      mustChangePassword: true, // Forzar cambio de contraseña en el primer inicio de sesión
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
