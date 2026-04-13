// src/types/guards.ts
import { UserPayload } from "./auth";

export function isUserPayload(payload: unknown): payload is UserPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  // 🔥 CORREÇÃO: Converter para unknown primeiro, depois para Record
  const p = payload as unknown as Record<string, unknown>;

  return (
    typeof p.id === "string" &&
    typeof p.email === "string" &&
    typeof p.role === "string"
  );
}

// Guard para payload com fullName (para o middleware)
export interface AuthUserPayload extends UserPayload {
  fullName: string;
}

export function isAuthUserPayload(
  payload: unknown,
): payload is AuthUserPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  // 🔥 CORREÇÃO: Converter para unknown primeiro, depois para Record
  const p = payload as unknown as Record<string, unknown>;

  return (
    typeof p.id === "string" &&
    typeof p.email === "string" &&
    typeof p.fullName === "string" &&
    typeof p.role === "string"
  );
}

// Guard para payload completo (com iat e exp)
export function isCompleteUserPayload(
  payload: unknown,
): payload is Required<UserPayload> {
  if (!isUserPayload(payload)) {
    return false;
  }

  const p = payload as unknown as Record<string, unknown>;

  return typeof p.iat === "number" && typeof p.exp === "number";
}
