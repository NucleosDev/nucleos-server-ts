import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { CreateTarefaHandler } from "../../../application/commands/tarefas/CreateTarefaHandler";
import { CreateTarefaCommand } from "../../../application/commands/tarefas/CreateTarefaCommand";
import { ConcluirTarefaHandler } from "../../../application/commands/tarefas/ConcluirTarefaHandler";
import { ConcluirTarefaCommand } from "../../../application/commands/tarefas/ConcluirTarefaCommand";
import { DeleteTarefaHandler } from "../../../application/commands/tarefas/DeleteTarefaHandler";
import { DeleteTarefaCommand } from "../../../application/commands/tarefas/DeleteTarefaCommand";
import { GetTarefasByBlocoHandler } from "../../../application/queries/tarefas/GetTarefasByBlocoHandler";
import { GetTarefasByBlocoQuery } from "../../../application/queries/tarefas/GetTarefasByBlocoQuery";
import { GetTarefasVencendoHandler } from "../../../application/queries/tarefas/GetTarefasVencendoHandler";
import { GetTarefasVencendoQuery } from "../../../application/queries/tarefas/GetTarefasVencendoQuery";

export class TarefasController {
  constructor(
    private readonly createTarefaHandler: CreateTarefaHandler,
    private readonly concluirTarefaHandler: ConcluirTarefaHandler,
    private readonly deleteTarefaHandler: DeleteTarefaHandler,
    private readonly getTarefasByBlocoHandler: GetTarefasByBlocoHandler,
    private readonly getTarefasVencendoHandler: GetTarefasVencendoHandler,
  ) {}

  async listByBloco(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { blocoId } = req.params;
      
      // 🔥 CORREÇÃO: Validar se blocoId existe e é string
      if (!blocoId || typeof blocoId !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do bloco inválido' 
        });
      }
      
      const query = new GetTarefasByBlocoQuery(blocoId);
      const result = await this.getTarefasByBlocoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async listVencendo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const query = new GetTarefasVencendoQuery();
      const result = await this.getTarefasVencendoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { blocoId, titulo, descricao, prioridade, dataVencimento } = req.body;

      // 🔥 CORREÇÃO: Validações de tipo
      if (!blocoId || typeof blocoId !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: "BlocoId inválido" 
        });
      }

      if (!titulo || typeof titulo !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: "Título é obrigatório" 
        });
      }

      const command = new CreateTarefaCommand(
        blocoId,
        titulo,
        descricao,
        prioridade,
        dataVencimento,
      );
      const result = await this.createTarefaHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async concluir(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      // 🔥 CORREÇÃO: Validar se id existe e é string
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'ID da tarefa inválido' 
        });
      }
      
      const command = new ConcluirTarefaCommand(id);
      const result = await this.concluirTarefaHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      // 🔥 CORREÇÃO: Validar se id existe e é string
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'ID da tarefa inválido' 
        });
      }
      
      const command = new DeleteTarefaCommand(id);
      await this.deleteTarefaHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}