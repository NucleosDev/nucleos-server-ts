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

export class BlocosController {
  constructor(
    private readonly createBlocoHandler: CreateBlocoHandler,
    private readonly updateBlocoHandler: UpdateBlocoHandler,
    private readonly deleteBlocoHandler: DeleteBlocoHandler,
    private readonly reorderBlocosHandler: ReorderBlocosHandler,
    private readonly getBlocosByNucleoHandler: GetBlocosByNucleoHandler,
    private readonly getBlocoByIdHandler: GetBlocoByIdHandler,
  ) {}

  async getByNucleo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { nucleoId } = req.params;

      if (!nucleoId || typeof nucleoId !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID do núcleo inválido",
        });
      }

      const query = new GetBlocosByNucleoQuery(nucleoId);
      const result = await this.getBlocosByNucleoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nucleoId } = req.query;

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

      const query = new GetBlocoByIdQuery(id, nucleoId);
      const result = await this.getBlocoByIdHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { nucleoId, tipo, titulo, posicao, configuracoes } = req.body;

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

      // 🔥 CORREÇÃO: Validar se o tipo é válido
      if (!isTipoBloco(tipo)) {
        return res.status(400).json({
          success: false,
          message: `Tipo de bloco inválido. Tipos válidos: tarefas, habitos, notas, lista, calendario, calculo`,
        });
      }

      const command = new CreateBlocoCommand(
        nucleoId,
        tipo as TipoBloco, // ← Cast para TipoBloco após validação
        titulo,
        posicao,
        configuracoes,
      );
      const result = await this.createBlocoHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nucleoId, titulo, tipo, posicao, configuracoes } = req.body;

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
        nucleoId,
        titulo,
        tipo,
        posicao,
        configuracoes,
      );
      const result = await this.updateBlocoHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nucleoId } = req.body;

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

      const command = new DeleteBlocoCommand(id, nucleoId);
      await this.deleteBlocoHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async reorder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { nucleoId, orders } = req.body;

      if (!nucleoId || typeof nucleoId !== "string") {
        return res.status(400).json({
          success: false,
          message: "ID do núcleo é obrigatório",
        });
      }

      if (!orders || !Array.isArray(orders)) {
        return res.status(400).json({
          success: false,
          message: "Ordem inválida",
        });
      }

      const command = new ReorderBlocosCommand(nucleoId, orders);
      await this.reorderBlocosHandler.execute(command);
      return res.json({
        success: true,
        message: "Blocos reordenados com sucesso",
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
