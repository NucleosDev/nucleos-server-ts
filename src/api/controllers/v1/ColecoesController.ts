import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { CreateColecaoHandler } from "../../../application/commands/colecoes/CreateColecaoHandler";
import { CreateColecaoCommand } from "../../../application/commands/colecoes/CreateColecaoCommand";
import { UpdateColecaoHandler } from "../../../application/commands/colecoes/UpdateColecaoHandler";
import { UpdateColecaoCommand } from "../../../application/commands/colecoes/UpdateColecaoCommand";
import { DeleteColecaoHandler } from "../../../application/commands/colecoes/DeleteColecaoHandler";
import { DeleteColecaoCommand } from "../../../application/commands/colecoes/DeleteColecaoCommand";
import { GetColecoesByBlocoHandler } from "../../../application/queries/colecoes/GetColecoesByBlocoHandler";
import { GetColecoesByBlocoQuery } from "../../../application/queries/colecoes/GetColecoesByBlocoQuery";
import { CreateCampoHandler } from "../../../application/commands/colecoes/CreateCampoHandler";
import { CreateCampoCommand } from "../../../application/commands/colecoes/CreateCampoCommand";
import { UpdateCampoHandler } from "../../../application/commands/colecoes/UpdateCampoHandler";
import { UpdateCampoCommand } from "../../../application/commands/colecoes/UpdateCampoCommand";
import { DeleteCampoHandler } from "../../../application/commands/colecoes/DeleteCampoHandler";
import { DeleteCampoCommand } from "../../../application/commands/colecoes/DeleteCampoCommand";
import { GetCamposByColecaoHandler } from "../../../application/queries/colecoes/GetCamposByColecaoHandler";
import { GetCamposByColecaoQuery } from "../../../application/queries/colecoes/GetCamposByColecaoQuery";
import { CreateItemHandler } from "../../../application/commands/colecoes/CreateItemHandler";
import { CreateItemCommand } from "../../../application/commands/colecoes/CreateItemCommand";
import { UpdateItemHandler } from "../../../application/commands/colecoes/UpdateItemHandler";
import { UpdateItemCommand } from "../../../application/commands/colecoes/UpdateItemCommand";
import { DeleteItemHandler } from "../../../application/commands/colecoes/DeleteItemHandler";
import { DeleteItemCommand } from "../../../application/commands/colecoes/DeleteItemCommand";
import { GetItemsByColecaoHandler } from "../../../application/queries/colecoes/GetItemsByColecaoHandler";
import { GetItemsByColecaoQuery } from "../../../application/queries/colecoes/GetItemsByColecaoQuery";

export class ColecoesController {
  constructor(
    // Coleção
    private readonly createColecaoHandler: CreateColecaoHandler,
    private readonly updateColecaoHandler: UpdateColecaoHandler,
    private readonly deleteColecaoHandler: DeleteColecaoHandler,
    private readonly getColecoesByBlocoHandler: GetColecoesByBlocoHandler,
    // Campo
    private readonly createCampoHandler: CreateCampoHandler,
    private readonly updateCampoHandler: UpdateCampoHandler,
    private readonly deleteCampoHandler: DeleteCampoHandler,
    private readonly getCamposByColecaoHandler: GetCamposByColecaoHandler,
    // Item
    private readonly createItemHandler: CreateItemHandler,
    private readonly updateItemHandler: UpdateItemHandler,
    private readonly deleteItemHandler: DeleteItemHandler,
    private readonly getItemsByColecaoHandler: GetItemsByColecaoHandler,
  ) {}

  // ========== COLEÇÃO ==========
  async listByBloco(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { blocoId } = req.params;
      if (!blocoId || typeof blocoId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID do bloco inválido" });
      }
      const query = new GetColecoesByBlocoQuery(blocoId);
      const result = await this.getColecoesByBlocoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { blocoId, nome } = req.body;
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
      const command = new CreateColecaoCommand(blocoId, nome);
      const result = await this.createColecaoHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nome } = req.body;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      const command = new UpdateColecaoCommand(id, nome);
      const result = await this.updateColecaoHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      const command = new DeleteColecaoCommand(id);
      await this.deleteColecaoHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ========== CAMPO ==========
  async getCamposByColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { colecaoId } = req.params;
      if (!colecaoId || typeof colecaoId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID da coleção inválido" });
      }
      const query = new GetCamposByColecaoQuery(colecaoId);
      const result = await this.getCamposByColecaoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createCampo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { colecaoId, nome, tipoCampo } = req.body;
      if (!colecaoId || typeof colecaoId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ColecaoId inválido" });
      }
      if (!nome || typeof nome !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "Nome é obrigatório" });
      }
      if (!tipoCampo || typeof tipoCampo !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "Tipo do campo é obrigatório" });
      }
      const command = new CreateCampoCommand(colecaoId, nome, tipoCampo as any);
      const result = await this.createCampoHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateCampo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nome, tipoCampo } = req.body;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      const command = new UpdateCampoCommand(id, nome, tipoCampo as any);
      const result = await this.updateCampoHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteCampo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      const command = new DeleteCampoCommand(id);
      await this.deleteCampoHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ========== ITEM ==========
  async getItemsByColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { colecaoId } = req.params;
      if (!colecaoId || typeof colecaoId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID da coleção inválido" });
      }
      const query = new GetItemsByColecaoQuery(colecaoId);
      const result = await this.getItemsByColecaoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { colecaoId, valores } = req.body;
      if (!colecaoId || typeof colecaoId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ColecaoId inválido" });
      }
      if (!valores || typeof valores !== "object") {
        return res
          .status(400)
          .json({ success: false, message: "Valores são obrigatórios" });
      }
      const command = new CreateItemCommand(colecaoId, valores);
      const result = await this.createItemHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { valores } = req.body;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      if (!valores || typeof valores !== "object") {
        return res
          .status(400)
          .json({ success: false, message: "Valores são obrigatórios" });
      }
      const command = new UpdateItemCommand(id, valores);
      const result = await this.updateItemHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      const command = new DeleteItemCommand(id);
      await this.deleteItemHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
