"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { reportClientError } from "@/lib/clientLogger";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    // Captura global de promesas no controladas en el navegador
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      reportClientError({
        message:
          reason instanceof Error
            ? reason.message
            : typeof reason === "string"
            ? reason
            : "Promesa rechazada no manejada",
        stack: reason instanceof Error ? reason.stack : undefined,
        source: "unhandled-rejection",
      });
    };

    // Captura de errores no controlados en window
    const handleWindowError = (event: ErrorEvent) => {
      reportClientError({
        message: event.message || "Error global en ventana",
        stack: event.error?.stack,
        url: event.filename,
        source: "window-error",
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleWindowError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleWindowError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

