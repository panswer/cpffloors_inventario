import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isApiAuth = request.nextUrl.pathname.startsWith("/api/auth");

  // Permitir todas las rutas de API de auth libremente
  if (isApiAuth) {
    return NextResponse.next();
  }

  // Si tiene token y está intentando acceder a /login, redirigir al home
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Si no tiene token y está accediendo a rutas protegidas (ej: home o cualquier otra distinta a /login)
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica el middleware a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, archivos SVG o estáticos en /public
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
