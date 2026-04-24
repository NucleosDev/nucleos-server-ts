// src/api/socket/middleware.ts
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { logger } from "../../shared/utils/logger";

// ✅ Extensão correta do tipo Socket
export interface AuthSocket extends Socket {
  userId?: string;
}

export const authenticateSocket = (
  socket: AuthSocket,
  next: (err?: Error) => void,
) => {
  // ✅ Agora o TypeScript reconhece socket.handshake
  const token =
    socket.handshake?.auth?.token ||
    socket.handshake?.headers?.authorization?.replace("Bearer ", "");

  if (!token) {
    logger.warn("Socket tentou conectar sem token");
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_KEY) as {
      id: string;
      email: string;
    };
    socket.userId = decoded.id;
    logger.info(`Socket autenticado como ${decoded.email}`);
    next();
  } catch (error) {
    logger.error("Socket falhou autenticação:", error);
    next(new Error("Authentication error"));
  }
};
