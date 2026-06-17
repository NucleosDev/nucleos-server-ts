import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { CreateTreinoTemplateHandler } from "../../../application/commands/exercicios/CreateTreinoTemplateHandler";
import { CreateTreinoTemplateCommand } from "../../../application/commands/exercicios/CreateTreinoTemplateCommand";
import { UpdateTreinoTemplateHandler } from "../../../application/commands/exercicios/UpdateTreinoTemplateHandler";
import { UpdateTreinoTemplateCommand } from "../../../application/commands/exercicios/UpdateTreinoTemplateCommand";
import { DeleteTreinoTemplateHandler } from "../../../application/commands/exercicios/DeleteTreinoTemplateHandler";
import { DeleteTreinoTemplateCommand } from "../../../application/commands/exercicios/DeleteTreinoTemplateCommand";
import { AddExercicioHandler } from "../../../application/commands/exercicios/AddExercicioHandler";
import { AddExercicioCommand } from "../../../application/commands/exercicios/AddExercicioCommand";
import { RemoveExercicioHandler } from "../../../application/commands/exercicios/RemoveExercicioHandler";
import { RemoveExercicioCommand } from "../../../application/commands/exercicios/RemoveExercicioCommand";
import { GetTreinosByBlocoHandler } from "../../../application/queries/exercicios/GetTreinosByBlocoHandler";
import { GetTreinosByBlocoQuery } from "../../../application/queries/exercicios/GetTreinosByBlocoQuery";

export class ExerciciosController {
  constructor(
    private readonly createTemplateHandler: CreateTreinoTemplateHandler,
    private readonly updateTemplateHandler: UpdateTreinoTemplateHandler,
    private readonly deleteTemplateHandler: DeleteTreinoTemplateHandler,
    private readonly addExercicioHandler: AddExercicioHandler,
    private readonly removeExercicioHandler: RemoveExercicioHandler,
    private readonly getTreinosByBlocoHandler: GetTreinosByBlocoHandler,
  ) {}

  async listByBloco(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const blocoId = req.params.blocoId as string;
      if (!userId) return res.status(401).json({ success: false, message: "Não autenticado" });
      if (!blocoId) return res.status(400).json({ success: false, message: "ID do bloco inválido" });

      const query = new GetTreinosByBlocoQuery(blocoId, userId);
      const result = await this.getTreinosByBlocoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("❌ [ExerciciosController.listByBloco]", error.message);
      return res.json({ success: true, data: [] });
    }
  }

  async createTemplate(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { blocoId, nome, descricao } = req.body;
      if (!userId) return res.status(401).json({ success: false, message: "Não autenticado" });
      if (!blocoId) return res.status(400).json({ success: false, message: "BlocoId é obrigatório" });
      if (!nome) return res.status(400).json({ success: false, message: "Nome é obrigatório" });

      const command = new CreateTreinoTemplateCommand(userId, blocoId, nome, descricao);
      const result = await this.createTemplateHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error("❌ [ExerciciosController.createTemplate]", error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateTemplate(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;
      const { nome, descricao } = req.body;
      if (!userId) return res.status(401).json({ success: false, message: "Não autenticado" });
      if (!id) return res.status(400).json({ success: false, message: "ID inválido" });

      const command = new UpdateTreinoTemplateCommand(id, userId, nome, descricao);
      const result = await this.updateTemplateHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("❌ [ExerciciosController.updateTemplate]", error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteTemplate(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;
      if (!userId) return res.status(401).json({ success: false, message: "Não autenticado" });
      if (!id) return res.status(400).json({ success: false, message: "ID inválido" });

      const command = new DeleteTreinoTemplateCommand(id, userId);
      await this.deleteTemplateHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      console.error("❌ [ExerciciosController.deleteTemplate]", error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async addExercicio(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const templateId = req.params.templateId as string;
      const { nome, series, repeticoes, pesoKg, ordem } = req.body;
      if (!userId) return res.status(401).json({ success: false, message: "Não autenticado" });
      if (!templateId) return res.status(400).json({ success: false, message: "templateId é obrigatório" });
      if (!nome) return res.status(400).json({ success: false, message: "Nome é obrigatório" });

      const command = new AddExercicioCommand(
        userId, templateId, nome,
        series ? Number(series) : undefined,
        repeticoes ? Number(repeticoes) : undefined,
        pesoKg != null ? Number(pesoKg) : null,
        ordem != null ? Number(ordem) : undefined,
      );
      const result = await this.addExercicioHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error("❌ [ExerciciosController.addExercicio]", error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeExercicio(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const exercicioId = req.params.exercicioId as string;
      if (!userId) return res.status(401).json({ success: false, message: "Não autenticado" });
      if (!exercicioId) return res.status(400).json({ success: false, message: "exercicioId inválido" });

      const command = new RemoveExercicioCommand(exercicioId, userId);
      await this.removeExercicioHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      console.error("❌ [ExerciciosController.removeExercicio]", error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
