import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { logger } from "../../shared/utils/logger";

export interface AuthSocket extends Socket {
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export const authenticateSocket = async (
  socket: AuthSocket,
  next: (err?: ExtendedError) => void,
) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      logger.warn(`Socket ${socket.id} - Token não fornecido`);
      return next(new Error("Authentication error: Token missing"));
    }

    const decoded = jwt.verify(token, env.JWT_KEY) as any;

    socket.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      fullName: decoded.fullName || decoded.name,
      role: decoded.role || "user",
    };

    logger.debug(`🔌 Socket ${socket.id} autenticado: ${socket.user.email}`);
    next();
  } catch (error) {
    logger.error(`🔌 Socket ${socket.id} - Erro de autenticação:`, error);
    next(new Error("Authentication error: Invalid token"));
  }
};
