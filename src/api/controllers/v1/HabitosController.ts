// api/controllers/v1/HabitosController.ts
import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { CreateHabitoHandler } from "../../../application/commands/habitos/CreateHabitoHandler";
import { CreateHabitoCommand } from "../../../application/commands/habitos/CreateHabitoCommand";
import { UpdateHabitoHandler } from "../../../application/commands/habitos/UpdateHabitoHandler";
import { UpdateHabitoCommand } from "../../../application/commands/habitos/UpdateHabitoCommand";
import { RegistrarHabitoHandler } from "../../../application/commands/habitos/RegistrarHabitoHandler";
import { RegistrarHabitoCommand } from "../../../application/commands/habitos/RegistrarHabitoCommand";
import { DeleteHabitoHandler } from "../../../application/commands/habitos/DeleteHabitoHandler";
import { DeleteHabitoCommand } from "../../../application/commands/habitos/DeleteHabitoCommand";
import { GetHabitosByBlocoHandler } from "../../../application/queries/habitos/GetHabitosByBlocoHandler";
import { GetHabitosByBlocoQuery } from "../../../application/queries/habitos/GetHabitosByBlocoQuery";

export class HabitosController {
  constructor(
    private readonly createHabitoHandler: CreateHabitoHandler,
    private readonly updateHabitoHandler: UpdateHabitoHandler,
    private readonly registrarHabitoHandler: RegistrarHabitoHandler,
    private readonly deleteHabitoHandler: DeleteHabitoHandler,
    private readonly getHabitosByBlocoHandler: GetHabitosByBlocoHandler,
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

      const query = new GetHabitosByBlocoQuery(blocoId, userId);
      const result = await this.getHabitosByBlocoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { blocoId, nome, frequencia, diasSemana, metaVezes } = req.body;

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

      if (!nome || typeof nome !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "Nome é obrigatório" });
      }

      const command = new CreateHabitoCommand(
        userId,
        blocoId,
        nome,
        frequencia,
        diasSemana,
        metaVezes,
      );
      const result = await this.createHabitoHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { nome, frequencia, diasSemana, metaVezes } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!id || typeof id !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID do hábito inválido" });
      }

      const command = new UpdateHabitoCommand(
        id,
        userId,
        nome,
        frequencia,
        diasSemana,
        metaVezes,
      );
      const result = await this.updateHabitoHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async registrar(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { data, vezesCompletadas } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!id || typeof id !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID do hábito inválido" });
      }

      const dataRegistro = data ? new Date(data) : new Date();
      const command = new RegistrarHabitoCommand(
        id,
        userId,
        dataRegistro,
        vezesCompletadas,
      );
      const result = await this.registrarHabitoHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
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
          .json({ success: false, message: "ID do hábito inválido" });
      }

      const command = new DeleteHabitoCommand(id, userId);
      await this.deleteHabitoHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
