import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET: string = process.env.JWT_SECRET || "default_jwt_secret_change_in_production";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

// Generación de JWT
export function signToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

// Verificación de JWT
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Hashing seguro de contraseña con PBKDF2 nativo de Node.js crypto
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// Verificación de contraseña
export function verifyPassword(password: string, combinedHash: string): boolean {
  const [salt, originalHash] = combinedHash.split(":");
  if (!salt || !originalHash) return false;

  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}
