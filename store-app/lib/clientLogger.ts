"use client";

export interface ClientErrorLogData {
  message: string;
  stack?: string;
  url?: string;
  componentStack?: string;
  source?: "error-boundary" | "unhandled-rejection" | "window-error" | "custom";
  metadata?: Record<string, any>;
}

// Envía un error del frontend al endpoint /api/logs/client
export function reportClientError(data: ClientErrorLogData) {
  try {
    const payload = {
      ...data,
      url: data.url || (typeof window !== "undefined" ? window.location.href : ""),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });

    // Intentar sendBeacon primero (óptimo si la página se está cerrando o descargando)
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const sent = navigator.sendBeacon("/api/logs/client", blob);
      if (sent) return;
    }

    // Fallback a fetch sin bloquear UI
    fetch("/api/logs/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silenciar errores del propio reporter para evitar bucles infinitos
    });
  } catch {
    // Evitar que falle la aplicación si el reporter tiene un error
  }
}
