import { Server, Socket } from "socket.io";
import { AuthSocket } from "./middleware";
import { logger } from "../../shared/utils/logger";

// Salas ativas por usuário (para saber onde cada usuário está)
const userRooms = new Map<string, Set<string>>();

export const setupSocketHandlers = (io: Server, socket: AuthSocket) => {
  const userId = socket.user?.id;

  if (!userId) {
    logger.warn(`Socket ${socket.id} sem usuário associado`);
    return;
  }

  logger.info(
    `🔌 Socket ${socket.id} conectado - Usuário: ${socket.user?.email}`,
  );

  // EVENTOS DE SALA (NÚCLEO)

  // Entrar em um núcleo (para receber atualizações)
  socket.on("nucleo:join", (nucleoId: string) => {
    const roomName = `nucleo:${nucleoId}`;
    socket.join(roomName);

    // Registrar sala para este usuário
    if (!userRooms.has(userId)) {
      userRooms.set(userId, new Set());
    }
    userRooms.get(userId)!.add(roomName);

    logger.debug(`Usuário ${userId} entrou na sala ${roomName}`);

    // Notificar outros usuários na sala
    socket.to(roomName).emit("user:joined", {
      userId,
      email: socket.user?.email,
      timestamp: new Date(),
    });
  });

  // Sair de um núcleo
  socket.on("nucleo:leave", (nucleoId: string) => {
    const roomName = `nucleo:${nucleoId}`;
    socket.leave(roomName);

    if (userRooms.has(userId)) {
      userRooms.get(userId)!.delete(roomName);
    }

    logger.debug(`📡 Usuário ${userId} saiu da sala ${roomName}`);

    socket.to(roomName).emit("user:left", {
      userId,
      email: socket.user?.email,
      timestamp: new Date(),
    });
  });

  // EVENTOS DE TAREFAS

  socket.on(
    "tarefa:completed",
    (data: { tarefaId: string; nucleoId: string; xpGained: number }) => {
      const roomName = `nucleo:${data.nucleoId}`;
      logger.info(` Tarefa ${data.tarefaId} concluída por ${userId}`);

      io.to(roomName).emit("tarefa:completed", {
        tarefaId: data.tarefaId,
        userId,
        xpGained: data.xpGained,
        completedBy: socket.user?.email,
        timestamp: new Date(),
      });
    },
  );

  // EVENTOS DE BLOCOS

  socket.on(
    "bloco:updated",
    (data: { blocoId: string; nucleoId: string; changes: any }) => {
      const roomName = `nucleo:${data.nucleoId}`;
      logger.info(`📝 Bloco ${data.blocoId} atualizado por ${userId}`);

      socket.to(roomName).emit("bloco:updated", {
        blocoId: data.blocoId,
        userId,
        changes: data.changes,
        updatedBy: socket.user?.email,
        timestamp: new Date(),
      });
    },
  );

  // EVENTOS DE TIMER

  socket.on(
    "timer:start",
    (data: { timerId: string; nucleoId: string; duration: number }) => {
      const roomName = `nucleo:${data.nucleoId}`;
      const endTime = new Date(Date.now() + data.duration * 1000);

      io.to(roomName).emit("timer:started", {
        timerId: data.timerId,
        duration: data.duration,
        endTime,
        startedBy: socket.user?.email,
        startedAt: new Date(),
      });
    },
  );

  socket.on(
    "timer:tick",
    (data: { timerId: string; nucleoId: string; remaining: number }) => {
      const roomName = `nucleo:${data.nucleoId}`;
      socket.to(roomName).emit("timer:tick", {
        timerId: data.timerId,
        remaining: data.remaining,
        timestamp: new Date(),
      });
    },
  );

  socket.on("timer:complete", (data: { timerId: string; nucleoId: string }) => {
    const roomName = `nucleo:${data.nucleoId}`;
    io.to(roomName).emit("timer:completed", {
      timerId: data.timerId,
      userId,
      completedBy: socket.user?.email,
      timestamp: new Date(),
    });
  });

  // EVENTOS DE COLABORAÇÃO

  socket.on("user:typing", (data: { nucleoId: string; isTyping: boolean }) => {
    const roomName = `nucleo:${data.nucleoId}`;
    socket.to(roomName).emit("user:typing", {
      userId,
      email: socket.user?.email,
      isTyping: data.isTyping,
      timestamp: new Date(),
    });
  });

  // DESCONEXÃO

  socket.on("disconnect", () => {
    logger.info(
      `🔌 Socket ${socket.id} desconectado - Usuário: ${socket.user?.email}`,
    );

    // Limpar salas do usuário
    if (userRooms.has(userId)) {
      const rooms = userRooms.get(userId)!;
      rooms.forEach((room) => {
        io.to(room).emit("user:left", {
          userId,
          email: socket.user?.email,
          timestamp: new Date(),
        });
      });
      userRooms.delete(userId);
    }
  });
};
