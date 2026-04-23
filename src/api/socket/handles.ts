// src/api/socket/handles.ts
import { Server, Socket } from "socket.io";
import { AuthSocket } from "./middleware";
import { logger } from "../../shared/utils/logger";

export const setupSocketHandlers = (io: Server, socket: AuthSocket) => {
  logger.info(`Configurando handlers para socket: ${socket.id}`);

  // Eventos personalizados
  socket.on("join-nucleo", (nucleoId: string) => {
    socket.join(`nucleo:${nucleoId}`);
    logger.info(`Socket ${socket.id} entrou no núcleo ${nucleoId}`);
  });

  socket.on("leave-nucleo", (nucleoId: string) => {
    socket.leave(`nucleo:${nucleoId}`);
    logger.info(`Socket ${socket.id} saiu do núcleo ${nucleoId}`);
  });

  socket.on("typing", (data: { nucleoId: string; isTyping: boolean }) => {
    socket.to(`nucleo:${data.nucleoId}`).emit("user-typing", {
      userId: socket.userId,
      isTyping: data.isTyping,
    });
  });

  // Notificações
  socket.on("notification-read", (notificationId: string) => {
    // Marcar notificação como lida
    logger.info(`Notificação ${notificationId} lida por ${socket.userId}`);
  });
};
