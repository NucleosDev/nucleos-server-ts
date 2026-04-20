// src/api/controllers/v1/TimersController.ts
import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { logger } from "../../../shared/utils/logger";

// Handlers
import { StartTimerHandler } from "../../../application/commands/timers/start-timer.handler";
import { StopTimerHandler } from "../../../application/commands/timers/stop-timer.handler";
import { DeleteTimerHandler } from "../../../application/commands/timers/delete-timer.handler";
import { GetTimersByNucleoHandler } from "../../../application/queries/timers/get-timers-by-nucleo.handler";

// Commands & Queries
import { StartTimerCommand } from "../../../application/commands/timers/start-timer.command";
import { StopTimerCommand } from "../../../application/commands/timers/stop-timer.command";
import { DeleteTimerCommand } from "../../../application/commands/timers/delete-timer.command";
import { GetTimersByNucleoQuery } from "../../../application/queries/timers/get-timers-by-nucleo.query";
import { UpdateTimerHandler } from "../../../application/commands/timers/update-timer.handler";
import { UpdateTimerCommand } from "../../../application/commands/timers/update-timer.command";
export class TimersController {
  private static startHandler = new StartTimerHandler();
  private static stopHandler = new StopTimerHandler();
  private static deleteHandler = new DeleteTimerHandler();
  private static listHandler = new GetTimersByNucleoHandler();
  private static updateHandler = new UpdateTimerHandler();

  static async listByNucleo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const nucleoId =
        typeof req.params.nucleoId === "string"
          ? req.params.nucleoId
          : undefined;

      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      if (!nucleoId) {
        res
          .status(400)
          .json({ success: false, message: "nucleoId é obrigatório" });
        return;
      }

      const query = new GetTimersByNucleoQuery(nucleoId, userId);
      const result = await this.listHandler.handle(query);

      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error("Erro ao listar timers:", error);
      const status = error.message?.includes("permissão")
        ? 403
        : error.message?.includes("não encontrado")
          ? 404
          : 500;
      res
        .status(status)
        .json({ success: false, message: error.message || "Erro interno" });
    }
  }

  static async start(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { nucleoId, titulo, duracaoSegundos, modo } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      if (!nucleoId) {
        res
          .status(400)
          .json({ success: false, message: "nucleoId é obrigatório" });
        return;
      }

      const command = new StartTimerCommand(
        nucleoId,
        userId,
        titulo,
        duracaoSegundos,
        modo,
      );
      const result = await this.startHandler.execute(command);

      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      logger.error("Erro ao iniciar timer:", error);
      const status = error.message?.includes("permissão")
        ? 403
        : error.message?.includes("já existe")
          ? 400
          : 500;
      res
        .status(status)
        .json({ success: false, message: error.message || "Erro interno" });
    }
  }

  static async stop(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const id = typeof req.params.id === "string" ? req.params.id : undefined;

      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      if (!id) {
        res
          .status(400)
          .json({ success: false, message: "ID do timer é obrigatório" });
        return;
      }

      const command = new StopTimerCommand(id, userId);
      const result = await this.stopHandler.execute(command);

      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error("Erro ao parar timer:", error);
      const status = error.message?.includes("não encontrado")
        ? 404
        : error.message?.includes("permissão")
          ? 403
          : error.message?.includes("já está parado")
            ? 400
            : 500;
      res
        .status(status)
        .json({ success: false, message: error.message || "Erro interno" });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const id = typeof req.params.id === "string" ? req.params.id : undefined;
      const { titulo } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      if (!id) {
        res
          .status(400)
          .json({ success: false, message: "ID do timer é obrigatório" });
        return;
      }

      if (!titulo || typeof titulo !== "string" || !titulo.trim()) {
        res
          .status(400)
          .json({ success: false, message: "Título é obrigatório" });
        return;
      }

      const command = new UpdateTimerCommand(id, userId, titulo.trim());
      const result = await this.updateHandler.execute(command);

      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error("Erro ao atualizar timer:", error);
      const status = error.message?.includes("não encontrado")
        ? 404
        : error.message?.includes("permissão")
          ? 403
          : 500;
      res
        .status(status)
        .json({ success: false, message: error.message || "Erro interno" });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const id = typeof req.params.id === "string" ? req.params.id : undefined;

      if (!userId) {
        res.status(401).json({ success: false, message: "Não autenticado" });
        return;
      }

      if (!id) {
        res
          .status(400)
          .json({ success: false, message: "ID do timer é obrigatório" });
        return;
      }

      const command = new DeleteTimerCommand(id, userId);
      await this.deleteHandler.execute(command);

      res.status(204).send();
    } catch (error: any) {
      logger.error("Erro ao deletar timer:", error);
      const status = error.message?.includes("não encontrado")
        ? 404
        : error.message?.includes("permissão")
          ? 403
          : 500;
      res
        .status(status)
        .json({ success: false, message: error.message || "Erro interno" });
    }
  }
}
