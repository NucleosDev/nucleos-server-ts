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
import { GetListaByIdHandler } from "../../../application/queries/listas/GetListaByIdHandler";
import { GetListaByIdQuery } from "../../../application/queries/listas/GetListaByIdQuery";
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
    private readonly getListaByIdHandler: GetListaByIdHandler,
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

  async getListaById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }

      const query = new GetListaByIdQuery(id, userId);
      const result = await this.getListaByIdHandler.execute(query);
      return res.json(result);
    } catch (error: any) {
      if (error) {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error) {
        return res.status(403).json({ success: false, message: error.message });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  //  LISTA
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

      const query = new GetListasByBlocoQuery(blocoId, userId);
      const result = await this.getListasByBlocoHandler.execute(query);

      // Retorna array diretamente
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createLista(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { blocoId, nome, tipoLista } = req.body;

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

      const command = new CreateListaCommand(userId, blocoId, nome, tipoLista);
      const result = await this.createListaHandler.execute(command);

      // Retorna objeto diretamente
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateLista(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { nome, tipoLista } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }

      const command = new UpdateListaCommand(id, userId, nome, tipoLista);
      const result = await this.updateListaHandler.execute(command);

      // Retorna objeto diretamente
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteLista(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }

      const command = new DeleteListaCommand(id, userId);
      await this.deleteListaHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  //  ITEM
  async getItemsByLista(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { listaId } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!listaId || typeof listaId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID da lista inválido" });
      }

      const query = new GetItemsByListaQuery(listaId, userId);
      const result = await this.getItemsByListaHandler.execute(query);

      // Retorna array diretamente
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { listaId, nome, quantidade, valorUnitario, categoriaId } =
        req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

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
        userId,
        listaId,
        nome,
        quantidade,
        valorUnitario,
        categoriaId,
      );
      const result = await this.createItemHandler.execute(command);

      // Retorna objeto diretamente
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { nome, quantidade, valorUnitario, categoriaId } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }

      const command = new UpdateItemListaCommand(
        id,
        userId,
        nome,
        quantidade,
        valorUnitario,
        categoriaId,
      );
      const result = await this.updateItemHandler.execute(command);

      // Retorna objeto diretamente
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async toggleItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { checked } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }

      const command = new ToggleItemCheckedCommand(id, userId, checked);
      const result = await this.toggleItemHandler.execute(command);

      // Retorna objeto diretamente
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }

      const command = new DeleteItemListaCommand(id, userId);
      await this.deleteItemHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  //  CATEGORIA
  async getCategoriasByLista(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { listaId } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!listaId || typeof listaId !== "string") {
        return res
          .status(400)
          .json({ success: false, message: "ID da lista inválido" });
      }

      const query = new GetCategoriasByListaQuery(listaId, userId);
      const result = await this.getCategoriasByListaHandler.execute(query);

      // Retorna array diretamente
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async createCategoria(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { listaId, nome, cor } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

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

      const command = new CreateCategoriaCommand(userId, listaId, nome, cor);
      const result = await this.createCategoriaHandler.execute(command);

      // Retorna objeto diretamente
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteCategoria(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Não autenticado" });
      }

      if (!id || typeof id !== "string") {
        return res.status(400).json({ success: false, message: "ID inválido" });
      }

      const command = new DeleteCategoriaCommand(id, userId);
      await this.deleteCategoriaHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
