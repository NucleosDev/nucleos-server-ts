// src/api/controllers/v1/BlocosController.ts
import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { CreateBlocoHandler } from "../../../application/commands/blocos/CreateBlocoHandler";
import { CreateBlocoCommand } from "../../../application/commands/blocos/CreateBlocoCommand";
import { UpdateBlocoHandler } from "../../../application/commands/blocos/UpdateBlocoHandler";
import { UpdateBlocoCommand } from "../../../application/commands/blocos/UpdateBlocoCommand";
import { DeleteBlocoHandler } from "../../../application/commands/blocos/DeleteBlocoHandler";
import { DeleteBlocoCommand } from "../../../application/commands/blocos/DeleteBlocoCommand";
import { ReorderBlocosHandler } from "../../../application/commands/blocos/ReorderBlocosHandler";
import { ReorderBlocosCommand } from "../../../application/commands/blocos/ReorderBlocosCommand";
import { GetBlocosByNucleoHandler } from "../../../application/queries/blocos/GetBlocosByNucleoHandler";
import { GetBlocosByNucleoQuery } from "../../../application/queries/blocos/GetBlocosByNucleoQuery";
import { GetBlocoByIdHandler } from "../../../application/queries/blocos/GetBlocoByIdHandler";
import { GetBlocoByIdQuery } from "../../../application/queries/blocos/GetBlocoByIdQuery";
import {
  TipoBloco,
  isTipoBloco,
} from "../../../domain/value-objects/TipoBloco";
import { logger } from "../../../shared/utils/logger";
console.log("✅ BlocosController CARREGADO");
export class BlocosController {
  constructor(
    private readonly createBlocoHandler: CreateBlocoHandler,
    private readonly updateBlocoHandler: UpdateBlocoHandler,
    private readonly deleteBlocoHandler: DeleteBlocoHandler,
    private readonly reorderBlocosHandler: ReorderBlocosHandler,
    private readonly getBlocosByNucleoHandler: GetBlocosByNucleoHandler,
    private readonly getBlocoByIdHandler: GetBlocoByIdHandler,
  ) {}

  // =====
  // 📋 LISTAR BLOCOS POR NÚCLEO (GET /blocos/nucleo/:nucleoId)
  // =====
  async getByNucleo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { nucleoId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
      }

      if (!nucleoId || typeof nucleoId !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID do núcleo é obrigatório",
        });
      }

      const query = new GetBlocosByNucleoQuery(nucleoId, userId);
      const result = await this.getBlocosByNucleoHandler.execute(query);

      return res.json(result); // Retorna array diretamente
    } catch (error: any) {
      logger.error("❌ Erro ao listar blocos:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =====
  // 🔍 BUSCAR BLOCO POR ID (GET /blocos/:id)
  // =====
  async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const nucleoId = req.query.nucleoId as string;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID do bloco inválido",
        });
      }

      const query = new GetBlocoByIdQuery(id, userId, nucleoId); // Passa nucleoId
      const result = await this.getBlocoByIdHandler.execute(query);

      return res.json(result);
    } catch (error: any) {
      logger.error("❌ Erro ao buscar bloco:", error);
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =====
  // ✨ CRIAR BLOCO (POST /blocos)
  // =====
  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { nucleoId, tipo, titulo, posicao, configuracoes } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
      }

      if (!nucleoId || typeof nucleoId !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID do núcleo é obrigatório",
        });
      }

      if (!tipo || typeof tipo !== "string") {
        return res.status(400).json({
          success: false,
          message: "Tipo do bloco é obrigatório",
        });
      }

      // Validar se o tipo é válido
      if (!isTipoBloco(tipo)) {
        return res.status(400).json({
          success: false,
          message: `Tipo de bloco inválido. Tipos válidos: tarefas, habitos, notas, lista, calendario, calculo, colecoes`,
        });
      }

      const command = new CreateBlocoCommand(
        userId,
        nucleoId,
        tipo as TipoBloco,
        titulo,
        posicao,
        configuracoes,
      );

      const result = await this.createBlocoHandler.execute(command);

      logger.info(`✅ Bloco criado: ${tipo} no núcleo ${nucleoId}`);

      return res.status(201).json(result);
    } catch (error: any) {
      logger.error("❌ Erro ao criar bloco:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =====
  // ✏️ ATUALIZAR BLOCO (PUT /blocos/:id)
  // =====
  async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { nucleoId, titulo, tipo, posicao, configuracoes } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID do bloco inválido",
        });
      }

      if (!nucleoId || typeof nucleoId !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID do núcleo é obrigatório",
        });
      }

      const command = new UpdateBlocoCommand(
        id,
        userId,
        nucleoId,
        titulo,
        tipo,
        posicao,
        configuracoes,
      );

      const result = await this.updateBlocoHandler.execute(command);

      logger.info(`✅ Bloco atualizado: ${id}`);

      return res.json(result);
    } catch (error: any) {
      logger.error("❌ Erro ao atualizar bloco:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =====
  // 🗑️ DELETAR BLOCO (DELETE /blocos/:id)
  // =====
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
          message: "ID do bloco inválido",
        });
      }

      const command = new DeleteBlocoCommand(id, userId);
      await this.deleteBlocoHandler.execute(command);

      logger.info(`✅ Bloco deletado: ${id}`);

      return res.status(204).send();
    } catch (error: any) {
      logger.error("❌ Erro ao deletar bloco:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // =====
  // 🔄 REORDENAR BLOCOS (POST /blocos/reorder)
  // =====
  async reorder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { nucleoId, orders } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
      }

      if (!nucleoId || typeof nucleoId !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID do núcleo é obrigatório",
        });
      }

      if (!orders || !Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Ordem inválida",
        });
      }

      const command = new ReorderBlocosCommand(nucleoId, userId, orders);
      await this.reorderBlocosHandler.execute(command);

      logger.info(`✅ Blocos reordenados no núcleo: ${nucleoId}`);

      return res.json({
        success: true,
        message: "Blocos reordenados com sucesso",
      });
    } catch (error: any) {
      logger.error("❌ Erro ao reordenar blocos:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
