import { NextRequest, NextResponse } from "next/server";
import { verifyToken, TokenPayload } from "@/lib/auth";

export function getAuthenticatedUser(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(req: NextRequest, allowedRoles?: string[]) {
  const user = getAuthenticatedUser(req);

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "No autorizado. Inicie sesión para continuar." },
        { status: 401 }
      ),
      user: null,
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Acceso denegado. Permisos insuficientes." },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { authorized: true, response: null, user };
}
