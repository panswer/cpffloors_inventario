import fs from "fs";
import path from "path";

const LOGS_DIR = path.join(process.cwd(), "logs");

// Asegurar que exista la carpeta /logs
if (!fs.existsSync(LOGS_DIR)) {
  try {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  } catch (err) {
    console.error("No se pudo crear el directorio de logs:", err);
  }
}

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: string;
  meta?: Record<string, any>;
  timestamp: string;
}

export function writeLog(level: LogLevel, message: string, meta?: Record<string, any>, context: string = "app") {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const logFile = path.join(LOGS_DIR, `app-${dateStr}.log`);

  const entry: LogPayload = {
    timestamp: now.toISOString(),
    level,
    context,
    message,
    ...(meta ? { meta } : {}),
  };

  const line = JSON.stringify(entry) + "\n";

  // Escribir en archivo .log
  fs.appendFile(logFile, line, (err) => {
    if (err) {
      console.error("Error escribiendo log en archivo:", err);
    }
  });

  // Mostrar también en consola de Docker
  if (level === "ERROR") {
    console.error(`[${entry.timestamp}] [${level}] [${context}]: ${message}`, meta || "");
  } else {
    console.log(`[${entry.timestamp}] [${level}] [${context}]: ${message}`, meta || "");
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, any>, context?: string) => writeLog("INFO", msg, meta, context),
  warn: (msg: string, meta?: Record<string, any>, context?: string) => writeLog("WARN", msg, meta, context),
  error: (msg: string, meta?: Record<string, any>, context?: string) => writeLog("ERROR", msg, meta, context),
  debug: (msg: string, meta?: Record<string, any>, context?: string) => writeLog("DEBUG", msg, meta, context),
};
