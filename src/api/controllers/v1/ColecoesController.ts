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
import { GetColecaoByIdHandler } from "../../../application/queries/colecoes/GetColecaoByIdHandler";
import { GetColecaoByIdQuery } from "../../../application/queries/colecoes/GetColecaoByIdQuery";

export class ColecoesController {
  constructor(
    // Coleção
    private readonly createColecaoHandler: CreateColecaoHandler,
    private readonly updateColecaoHandler: UpdateColecaoHandler,
    private readonly deleteColecaoHandler: DeleteColecaoHandler,
    private readonly getColecoesByBlocoHandler: GetColecoesByBlocoHandler,
    private readonly getColecaoByIdHandler: GetColecaoByIdHandler,
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

  // COLEÇÃO

  async listByBloco(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const blocoIdParam = req.params.blocoId;
      const blocoId =
        typeof blocoIdParam === "string" ? blocoIdParam : undefined;
      console.log("🧪 userId:", userId, "blocoId:", blocoId); // <-- aqui
      console.log(
        "typeof userId:",
        typeof userId,
        "typeof blocoId:",
        typeof blocoId,
      );
      if (!userId || !blocoId) {
        console.log("Validação falhou!"); // Adicionar
        return res.status(400).json({
          success: false,
          message: "userId e blocoId são obrigatórios",
        });
      }

      const query = new GetColecoesByBlocoQuery(userId, blocoId);
      const result = await this.getColecoesByBlocoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { blocoId, nome } = req.body;
      const userId = req.user?.id;
      if (!userId || typeof userId !== "string") {
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
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
      const command = new CreateColecaoCommand(userId, blocoId, nome);
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
      const userId = req.user?.id;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      if (!userId || typeof userId !== "string") {
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      }
      const command = new DeleteColecaoCommand(id, userId);
      await this.deleteColecaoHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async getColecaoById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      if (!userId || typeof userId !== "string") {
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      }

      const query = new GetColecaoByIdQuery(id, userId);
      const result = await this.getColecaoByIdHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // CAMPO

  async getCamposByColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { colecaoId } = req.params;
      const userId = req.user?.id;
      if (!colecaoId || typeof colecaoId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID da coleção inválido" });
      }
      if (!userId || typeof userId !== "string") {
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      }
      const query = new GetCamposByColecaoQuery(colecaoId, userId);
      const result = await this.getCamposByColecaoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createCampo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { colecaoId, nome, tipoCampo } = req.body;
      const userId = req.user?.id;
      if (!userId || typeof userId !== "string") {
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      }
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
      const command = new CreateCampoCommand(
        userId,
        colecaoId,
        nome,
        tipoCampo as any,
      );
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
      const userId = req.user?.id;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      if (!userId || typeof userId !== "string") {
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      }
      const command = new DeleteCampoCommand(id, userId);
      await this.deleteCampoHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ITEM

  async getItemsByColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { colecaoId } = req.params;
      const userId = req.user?.id;
      if (!colecaoId || typeof colecaoId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID da coleção inválido" });
      }
      if (!userId || typeof userId !== "string") {
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      }
      const query = new GetItemsByColecaoQuery(colecaoId, userId);
      const result = await this.getItemsByColecaoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { colecaoId, valores } = req.body;
      const userId = req.user?.id;
      if (!userId || typeof userId !== "string") {
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      }
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
      const command = new CreateItemCommand(userId, colecaoId, valores);
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
      const userId = req.user?.id;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      if (!userId || typeof userId !== "string") {
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      }
      if (!valores || typeof valores !== "object") {
        return res
          .status(400)
          .json({ success: false, message: "Valores são obrigatórios" });
      }
      const command = new UpdateItemCommand(id, userId, valores);
      const result = await this.updateItemHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      if (!userId || typeof userId !== "string") {
        return res
          .status(401)
          .json({ success: false, message: "Usuário não autenticado" });
      }
      const command = new DeleteItemCommand(id, userId);
      await this.deleteItemHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
