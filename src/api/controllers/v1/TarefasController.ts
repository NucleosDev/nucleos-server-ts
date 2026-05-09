import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { CreateTarefaHandler } from "../../../application/commands/tarefas/CreateTarefaHandler";
import { CreateTarefaCommand } from "../../../application/commands/tarefas/CreateTarefaCommand";
import { UpdateTarefaHandler } from "../../../application/commands/tarefas/UpdateTarefaHandler";
import { UpdateTarefaCommand } from "../../../application/commands/tarefas/UpdateTarefaCommand";
import { ConcluirTarefaHandler } from "../../../application/commands/tarefas/ConcluirTarefaHandler";
import { ConcluirTarefaCommand } from "../../../application/commands/tarefas/ConcluirTarefaCommand";
import { DeleteTarefaHandler } from "../../../application/commands/tarefas/DeleteTarefaHandler";
import { DeleteTarefaCommand } from "../../../application/commands/tarefas/DeleteTarefaCommand";
import { GetTarefasByBlocoHandler } from "../../../application/queries/tarefas/GetTarefasByBlocoHandler";
import { GetTarefasByBlocoQuery } from "../../../application/queries/tarefas/GetTarefasByBlocoQuery";
import { GetTarefasVencendoHandler } from "../../../application/queries/tarefas/GetTarefasVencendoHandler";
import { GetTarefasVencendoQuery } from "../../../application/queries/tarefas/GetTarefasVencendoQuery";
import type { PrioridadeTarefa, StatusTarefa } from "../../../domain/entities/Tarefa";

export class TarefasController {
  constructor(
    private readonly createTarefaHandler: CreateTarefaHandler,
    private readonly updateTarefaHandler: UpdateTarefaHandler,
    private readonly concluirTarefaHandler: ConcluirTarefaHandler,
    private readonly deleteTarefaHandler: DeleteTarefaHandler,
    private readonly getTarefasByBlocoHandler: GetTarefasByBlocoHandler,
    private readonly getTarefasVencendoHandler: GetTarefasVencendoHandler,
  ) {}

  async listByBloco(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { blocoId } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!blocoId || typeof blocoId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID do bloco inválido" });
      }

      const query = new GetTarefasByBlocoQuery(blocoId, userId);
      const result = await this.getTarefasByBlocoHandler.execute(query);

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  //  Método listVencendo adicionado
  async listVencendo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      const query = new GetTarefasVencendoQuery(userId);
      const result = await this.getTarefasVencendoHandler.execute(query);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { blocoId, titulo, descricao, prioridade, dataVencimento } =
        req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!blocoId || typeof blocoId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "BlocoId inválido" });
      }

      if (!titulo || typeof titulo !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "Título é obrigatório" });
      }

      const command = new CreateTarefaCommand(
        userId,
        blocoId,
        titulo,
        descricao,
        prioridade,
        dataVencimento ? new Date(dataVencimento) : undefined,
      );

      const result = await this.createTarefaHandler.execute(command);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;
      const { titulo, descricao, prioridade, status, dataVencimento } = req.body as {
        titulo?: string;
        descricao?: string | null;
        prioridade?: PrioridadeTarefa;
        status?: StatusTarefa;
        dataVencimento?: string | null;
      };

      if (!userId)
        return res.status(401).json({ success: false, message: "Não autenticado" });
      if (!id)
        return res.status(400).json({ success: false, message: "ID da tarefa inválido" });

      const command = new UpdateTarefaCommand(
        id,
        userId,
        titulo,
        descricao,
        prioridade,
        status,
        dataVencimento !== undefined
          ? dataVencimento ? new Date(dataVencimento) : null
          : undefined,
      );
      const result = await this.updateTarefaHandler.execute(command);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async concluir(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!id || typeof id !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID da tarefa inválido" });
      }

      const command = new ConcluirTarefaCommand(id, userId);
      const result = await this.concluirTarefaHandler.execute(command);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!id || typeof id !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID da tarefa inválido" });
      }

      const command = new DeleteTarefaCommand(id, userId);
      await this.deleteTarefaHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
