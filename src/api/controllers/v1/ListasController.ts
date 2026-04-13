import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { CreateListaHandler } from "../../../application/commands/listas/CreateListaHandler";
import { CreateListaCommand } from "../../../application/commands/listas/CreateListaCommand";
import { UpdateListaHandler } from "../../../application/commands/listas/UpdateListaHandler";
import { UpdateListaCommand } from "../../../application/commands/listas/UpdateListaCommand";
import { DeleteListaHandler } from "../../../application/commands/listas/DeleteListaHandler";
import { DeleteListaCommand } from "../../../application/commands/listas/DeleteListaCommand";
import { GetListasByBlocoHandler } from "../../../application/queries/listas/GetListasByBlocoHandler";
import { GetListasByBlocoQuery } from "../../../application/queries/listas/GetListasByBlocoQuery";
import { CreateItemListaHandler } from "../../../application/commands/listas/CreateItemListaHandler";
import { CreateItemListaCommand } from "../../../application/commands/listas/CreateItemListaCommand";
import { UpdateItemListaHandler } from "../../../application/commands/listas/UpdateItemListaHandler";
import { UpdateItemListaCommand } from "../../../application/commands/listas/UpdateItemListaCommand";
import { ToggleItemCheckedHandler } from "../../../application/commands/listas/ToggleItemCheckedHandler";
import { ToggleItemCheckedCommand } from "../../../application/commands/listas/ToggleItemCheckedCommand";
import { DeleteItemListaHandler } from "../../../application/commands/listas/DeleteItemListaHandler";
import { DeleteItemListaCommand } from "../../../application/commands/listas/DeleteItemListaCommand";
import { GetItemsByListaHandler } from "../../../application/queries/listas/GetItemsByListaHandler";
import { GetItemsByListaQuery } from "../../../application/queries/listas/GetItemsByListaQuery";
import { CreateCategoriaHandler } from "../../../application/commands/listas/CreateCategoriaHandler";
import { CreateCategoriaCommand } from "../../../application/commands/listas/CreateCategoriaCommand";
import { DeleteCategoriaHandler } from "../../../application/commands/listas/DeleteCategoriaHandler";
import { DeleteCategoriaCommand } from "../../../application/commands/listas/DeleteCategoriaCommand";
import { GetCategoriasByListaHandler } from "../../../application/queries/listas/GetCategoriasByListaHandler";
import { GetCategoriasByListaQuery } from "../../../application/queries/listas/GetCategoriasByListaQuery";

export class ListasController {
  constructor(
    // Lista
    private readonly createListaHandler: CreateListaHandler,
    private readonly updateListaHandler: UpdateListaHandler,
    private readonly deleteListaHandler: DeleteListaHandler,
    private readonly getListasByBlocoHandler: GetListasByBlocoHandler,
    // Item
    private readonly createItemHandler: CreateItemListaHandler,
    private readonly updateItemHandler: UpdateItemListaHandler,
    private readonly toggleItemHandler: ToggleItemCheckedHandler,
    private readonly deleteItemHandler: DeleteItemListaHandler,
    private readonly getItemsByListaHandler: GetItemsByListaHandler,
    // Categoria
    private readonly createCategoriaHandler: CreateCategoriaHandler,
    private readonly deleteCategoriaHandler: DeleteCategoriaHandler,
    private readonly getCategoriasByListaHandler: GetCategoriasByListaHandler,
  ) {}

  // ========== LISTA ==========
  async listByBloco(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { blocoId } = req.params;
      if (!blocoId || typeof blocoId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID do bloco inválido" });
      }
      const query = new GetListasByBlocoQuery(blocoId);
      const result = await this.getListasByBlocoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createLista(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { blocoId, nome, tipoLista } = req.body;
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
      const command = new CreateListaCommand(blocoId, nome, tipoLista);
      const result = await this.createListaHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateLista(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nome, tipoLista } = req.body;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      const command = new UpdateListaCommand(id, nome, tipoLista);
      const result = await this.updateListaHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteLista(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      const command = new DeleteListaCommand(id);
      await this.deleteListaHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ========== ITEM ==========
  async getItemsByLista(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { listaId } = req.params;
      if (!listaId || typeof listaId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID da lista inválido" });
      }
      const query = new GetItemsByListaQuery(listaId);
      const result = await this.getItemsByListaHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { listaId, nome, quantidade, valorUnitario, categoriaId } =
        req.body;
      if (!listaId || typeof listaId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ListaId inválido" });
      }
      if (!nome || typeof nome !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "Nome é obrigatório" });
      }
      const command = new CreateItemListaCommand(
        listaId,
        nome,
        quantidade,
        valorUnitario,
        categoriaId,
      );
      const result = await this.createItemHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nome, quantidade, valorUnitario, categoriaId } = req.body;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      const command = new UpdateItemListaCommand(
        id,
        nome,
        quantidade,
        valorUnitario,
        categoriaId,
      );
      const result = await this.updateItemHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async toggleItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { checked } = req.body;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      const command = new ToggleItemCheckedCommand(id, checked);
      const result = await this.toggleItemHandler.execute(command);
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
      const command = new DeleteItemListaCommand(id);
      await this.deleteItemHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // ========== CATEGORIA ==========
  async getCategoriasByLista(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      const { listaId } = req.params;
      if (!listaId || typeof listaId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID da lista inválido" });
      }
      const query = new GetCategoriasByListaQuery(listaId);
      const result = await this.getCategoriasByListaHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createCategoria(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { listaId, nome, cor } = req.body;
      if (!listaId || typeof listaId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ListaId inválido" });
      }
      if (!nome || typeof nome !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "Nome é obrigatório" });
      }
      const command = new CreateCategoriaCommand(listaId, nome, cor);
      const result = await this.createCategoriaHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteCategoria(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }
      const command = new DeleteCategoriaCommand(id);
      await this.deleteCategoriaHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
