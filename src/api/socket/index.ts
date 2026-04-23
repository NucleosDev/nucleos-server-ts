// src/api/socket/index.ts
import { Server as SocketServer } from "socket.io";
import { Server } from "http";
import type { ServerOptions as EngineOptions } from "engine.io";

let io: SocketServer | null = null;

export function initSocket(httpServer: Server) {
  // SOLUÇÃO: Usar EngineOptions para tipagem correta do CORS [citation:6]
  const options: EngineOptions = {
    cors: {
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow: boolean) => void,
      ) => {
        if (
          !origin ||
          origin.includes("localhost") ||
          origin.includes("3000")
        ) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
    },
    allowEIO3: true,
    transports: ["websocket", "polling"],
  };

  io = new SocketServer(httpServer, options);

  return io;
}

export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function getIo() {
  return io;
}
