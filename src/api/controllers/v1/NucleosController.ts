// src/api/controllers/NucleosController.ts
import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { CreateNucleoHandler } from "../../../application/commands/nucleos/CreateNucleoHandler";
import { CreateNucleoCommand } from "../../../application/commands/nucleos/CreateNucleoCommand";
import { UpdateNucleoHandler } from "../../../application/commands/nucleos/UpdateNucleoHandler";
import { UpdateNucleoCommand } from "../../../application/commands/nucleos/UpdateNucleoCommand";
import { DeleteNucleoHandler } from "../../../application/commands/nucleos/DeleteNucleoHandler";
import { DeleteNucleoCommand } from "../../../application/commands/nucleos/DeleteNucleoCommand";
import { GetNucleosHandler } from "../../../application/queries/nucleos/GetNucleosHandler";
import { GetNucleosQuery } from "../../../application/queries/nucleos/GetNucleosQuery";
import { GetNucleoByIdHandler } from "../../../application/queries/nucleos/GetNucleoByIdHandler";
import { GetNucleoByIdQuery } from "../../../application/queries/nucleos/GetNucleoByIdQuery";
import { logger } from "../../../shared/utils/logger";
import { isValidUuid } from "../../../shared/utils/uuid";

export class NucleosController {
  constructor(
    private readonly createNucleoHandler: CreateNucleoHandler,
    private readonly updateNucleoHandler: UpdateNucleoHandler,
    private readonly deleteNucleoHandler: DeleteNucleoHandler,
    private readonly getNucleosHandler: GetNucleosHandler,
    private readonly getNucleoByIdHandler: GetNucleoByIdHandler,
  ) {}

  async list(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
      }

      const query = new GetNucleosQuery(userId);
      const result = await this.getNucleosHandler.execute(query);
      return res.json(result); // Retorna array diretamente
    } catch (error: any) {
      logger.error("❌ Erro ao listar núcleos:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID inválido ou não fornecido",
        });
      }

      const query = new GetNucleoByIdQuery(id, userId);
      const result = await this.getNucleoByIdHandler.execute(query);
      return res.json(result);
    } catch (error: any) {
      logger.error("❌ Erro ao buscar núcleo:", error);
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;

      console.log("👤 userId:", userId);
      console.log("📦 BODY RECEBIDO:", JSON.stringify(req.body, null, 2));

      const { nome, descricao, tipo, corDestaque, imagemCapa, iconId } =
        req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
      }

      if (!nome || typeof nome !== "string") {
        return res.status(400).json({
          success: false,
          message: "Nome é obrigatório",
        });
      }

      // PASSANDO O userId COMO PRIMEIRO PARÂMETRO
      const command = new CreateNucleoCommand(
        userId, // 1º - userId
        nome, // 2º - nome
        descricao, // 3º - descricao
        tipo, // 4º - tipo
        corDestaque, // 5º - corDestaque
        imagemCapa, // 6º - imagemCapa
        iconId, // 7º - iconId
      );

      const result = await this.createNucleoHandler.execute(command);
      console.log(" Núcleo criado:", result.id);

      return res.status(201).json(result);
    } catch (error: any) {
      logger.error("❌ Erro ao criar núcleo:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { nome, descricao, tipo, corDestaque, imagemCapa, iconId } =
        req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID inválido ou não fornecido",
        });
      }

      // PASSANDO O userId COMO SEGUNDO PARÂMETRO
      const command = new UpdateNucleoCommand(
        id, // 1º - id
        userId, // 2º - userId
        nome, // 3º - nome
        descricao, // 4º - descricao
        tipo, // 5º - tipo
        corDestaque, // 6º - corDestaque
        imagemCapa, // 7º - imagemCapa
        iconId, // 8º - iconId
      );

      const result = await this.updateNucleoHandler.execute(command);
      return res.json(result);
    } catch (error: any) {
      logger.error("❌ Erro ao atualizar núcleo:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID inválido ou não fornecido",
        });
      }

      //  PASSANDO O userId COMO SEGUNDO PARÂMETRO
      const command = new DeleteNucleoCommand(id, userId);
      await this.deleteNucleoHandler.execute(command);

      return res.status(204).send();
    } catch (error: any) {
      logger.error("❌ Erro ao deletar núcleo:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
