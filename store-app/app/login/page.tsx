"use client";

import { AuthTemplate } from "@/components/templates";
import { LoginForm } from "@/components/organisms";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();

  const handleLogin = async (data: { username: string; password: string }) => {
    try {
      await login(data);
    } catch {
      // El error se maneja automáticamente en loginError de useAuth
    }
  };

  return (
    <AuthTemplate
      title="Bienvenido a CPF Floors"
      subtitle="Ingresa tus credenciales para acceder al sistema"
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      }
    >
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoggingIn}
        errorMessage={loginError}
      />
    </AuthTemplate>
  );
}
