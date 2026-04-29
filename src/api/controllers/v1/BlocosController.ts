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
  isTipoBloco,
  TipoBloco,
} from "../../../domain/value-objects/TipoBloco";
import { BlocoRepository } from "../../../infrastructure/persistence/repositories/BlocoRepository";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { logger } from "../../../shared/utils/logger";

export class BlocosController {
  constructor(
    private readonly createBlocoHandler: CreateBlocoHandler,
    private readonly updateBlocoHandler: UpdateBlocoHandler,
    private readonly deleteBlocoHandler: DeleteBlocoHandler,
    private readonly reorderBlocosHandler: ReorderBlocosHandler,
    private readonly getBlocosByNucleoHandler: GetBlocosByNucleoHandler,
    private readonly getBlocoByIdHandler: GetBlocoByIdHandler,
    private readonly blocoRepository: BlocoRepository,
  ) {}

  async getByNucleo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const nucleoId = req.params.nucleoId as string;
      const parentId = req.query.parentId as string | undefined;

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      if (!nucleoId)
        return res
          .status(400)
          .json({ success: false, message: "ID do núcleo é obrigatório" });

      const query = new GetBlocosByNucleoQuery(
        nucleoId,
        userId,
        parentId || undefined,
      );
      const result = await this.getBlocosByNucleoHandler.execute(query);
      return res.json(result);
    } catch (error: any) {
      logger.error("Erro ao listar blocos:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;
      const nucleoId = req.query.nucleoId as string | undefined;

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "ID do bloco inválido" });

const query = new GetBlocoByIdQuery(id, userId, nucleoId || "");
      const result = await this.getBlocoByIdHandler.execute(query);
      return res.json(result);
    } catch (error: any) {
      logger.error("Erro ao buscar bloco:", error);
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { nucleoId, tipo, titulo, posicao, configuracoes, parentId } =
        req.body as {
          nucleoId: string;
          tipo: string;
          titulo?: string;
          posicao?: number;
          configuracoes?: Record<string, any>;
          parentId?: string | null;
        };

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      if (!nucleoId)
        return res
          .status(400)
          .json({ success: false, message: "ID do núcleo é obrigatório" });
      if (!tipo)
        return res
          .status(400)
          .json({ success: false, message: "Tipo do bloco é obrigatório" });
      if (!isTipoBloco(tipo)) {
        return res.status(400).json({
          success: false,
          message: `Tipo inválido. Válidos: tarefas, habitos, notas, lista, calendario, calculo, colecoes, timer, canvas`,
        });
      }

      const command = new CreateBlocoCommand(
        userId,
        nucleoId,
        tipo as TipoBloco,
        titulo,
        posicao,
        configuracoes,
        parentId || null,
      );
      const result = await this.createBlocoHandler.execute(command);
      return res.status(201).json(result);
    } catch (error: any) {
      logger.error("Erro ao criar bloco:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;
      const { nucleoId, titulo, tipo, posicao, configuracoes, parentId } =
        req.body as {
          nucleoId: string;
          titulo?: string;
          tipo?: string;
          posicao?: number;
          configuracoes?: Record<string, any>;
          parentId?: string | null;
        };

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "ID do bloco inválido" });
      if (!nucleoId)
        return res
          .status(400)
          .json({ success: false, message: "ID do núcleo é obrigatório" });

      const command = new UpdateBlocoCommand(
        id,
        userId,
        nucleoId,
        titulo,
        tipo,
        posicao,
        configuracoes,
        parentId,
      );
      const result = await this.updateBlocoHandler.execute(command);
      return res.json(result);
    } catch (error: any) {
      logger.error("Erro ao atualizar bloco:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "ID do bloco inválido" });

      const command = new DeleteBlocoCommand(id, userId);
      await this.deleteBlocoHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      logger.error("Erro ao deletar bloco:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async reorder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { nucleoId, orders } = req.body as {
        nucleoId: string;
        orders: { id: string; posicao: number }[];
        parentId?: string | null;
      };

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      if (!nucleoId)
        return res
          .status(400)
          .json({ success: false, message: "ID do núcleo é obrigatório" });
      if (!orders || !Array.isArray(orders) || orders.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Ordem inválida" });
      }

      const command = new ReorderBlocosCommand(nucleoId, userId, orders);
      await this.reorderBlocosHandler.execute(command);
      return res.json({
        success: true,
        message: "Blocos reordenados com sucesso",
      });
    } catch (error: any) {
      logger.error("Erro ao reordenar blocos:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async move(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;
      const { newParentId, position } = req.body as {
        newParentId: string | null;
        position: number;
      };

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "ID do bloco inválido" });

      await this.blocoRepository.moveToParent(
        id,
        newParentId ?? null,
        position ?? 0,
      );
      return res.json({ success: true, message: "Bloco movido com sucesso" });
    } catch (error: any) {
      logger.error("Erro ao mover bloco:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getChildren(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const parentId = req.params.parentId as string;
      const nucleoId = req.query.nucleoId as string | undefined;

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      if (!parentId)
        return res
          .status(400)
          .json({ success: false, message: "ID do parent é obrigatório" });
      if (!nucleoId)
        return res
          .status(400)
          .json({ success: false, message: "ID do núcleo é obrigatório" });

      const children = await this.blocoRepository.findByParentId(
        parentId,
        nucleoId,
      );
      return res.json(children.map((b) => b.toJSON()));
    } catch (error: any) {
      logger.error("Erro ao listar filhos:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAncestors(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });

      const ancestors = await this.blocoRepository.findAncestors(id);
      return res.json(ancestors.map((b) => b.toJSON()));
    } catch (error: any) {
      logger.error("Erro ao listar ancestrais:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============ CANVAS ============

  async getCanvasByNucleo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const nucleoId = req.params.nucleoId as string;

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      if (!nucleoId)
        return res
          .status(400)
          .json({ success: false, message: "ID do núcleo é obrigatório" });

      const result = await pool.query(
        `SELECT id, configuracoes FROM blocos 
         WHERE nucleo_id = $1 AND tipo = 'canvas' AND is_canvas = true AND deleted_at IS NULL 
         LIMIT 1`,
        [nucleoId],
      );

      if (result.rows.length === 0) {
        const newCanvas = await pool.query(
          `INSERT INTO blocos (id, nucleo_id, tipo, titulo, posicao, configuracoes, is_canvas, depth)
           VALUES (gen_random_uuid(), $1, 'canvas', 'Canvas', 0, $2, true, 0)
           RETURNING id, configuracoes`,
          [nucleoId, JSON.stringify({ content: "[]" })],
        );

        return res.json({
          id: newCanvas.rows[0].id,
          content: "[]",
        });
      }

      const canvas = result.rows[0];
      const configs =
        typeof canvas.configuracoes === "string"
          ? JSON.parse(canvas.configuracoes)
          : canvas.configuracoes || {};

      return res.json({
        id: canvas.id,
        content: configs.content || "[]",
      });
    } catch (error: any) {
      logger.error("Erro ao buscar canvas:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async saveCanvasContent(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const nucleoId = req.params.nucleoId as string;
      const { content } = req.body as { content: string };

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      if (!nucleoId)
        return res
          .status(400)
          .json({ success: false, message: "ID do núcleo é obrigatório" });
      if (content === undefined)
        return res
          .status(400)
          .json({ success: false, message: "Conteúdo é obrigatório" });

      const existing = await pool.query(
        `SELECT id FROM blocos 
         WHERE nucleo_id = $1 AND tipo = 'canvas' AND is_canvas = true AND deleted_at IS NULL 
         LIMIT 1`,
        [nucleoId],
      );

      if (existing.rows.length > 0) {
        await pool.query(
          `UPDATE blocos 
           SET configuracoes = jsonb_set(COALESCE(configuracoes, '{}'::jsonb), '{content}', $1::jsonb),
               updated_at = NOW()
           WHERE id = $2`,
          [JSON.stringify(content), existing.rows[0].id],
        );
        return res.json({ success: true, id: existing.rows[0].id });
      } else {
        const newCanvas = await pool.query(
          `INSERT INTO blocos (id, nucleo_id, tipo, titulo, posicao, configuracoes, is_canvas, depth)
           VALUES (gen_random_uuid(), $1, 'canvas', 'Canvas', 0, $2, true, 0)
           RETURNING id`,
          [nucleoId, JSON.stringify({ content })],
        );
        return res.json({ success: true, id: newCanvas.rows[0].id });
      }
    } catch (error: any) {
      logger.error("Erro ao salvar canvas:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
