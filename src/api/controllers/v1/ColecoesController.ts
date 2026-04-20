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

// Funções auxiliares de validação
const requireAuth = (userId: any): string => {
  if (!userId || typeof userId !== "string") {
    throw new Error("UNAUTHORIZED: Usuário não autenticado");
  }
  return userId;
};

const requireString = (value: any, fieldName: string): string => {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw new Error(
      `VALIDATION: ${fieldName} é obrigatório e deve ser uma string não vazia`,
    );
  }
  return value.trim();
};

const requireParam = (param: any, paramName: string): string => {
  if (!param || typeof param !== "string") {
    throw new Error(`VALIDATION: Parâmetro ${paramName} inválido`);
  }
  return param;
};

export class ColecoesController {
  constructor(
    private readonly createColecaoHandler: CreateColecaoHandler,
    private readonly updateColecaoHandler: UpdateColecaoHandler,
    private readonly deleteColecaoHandler: DeleteColecaoHandler,
    private readonly getColecoesByBlocoHandler: GetColecoesByBlocoHandler,
    private readonly getColecaoByIdHandler: GetColecaoByIdHandler,
    private readonly createCampoHandler: CreateCampoHandler,
    private readonly updateCampoHandler: UpdateCampoHandler,
    private readonly deleteCampoHandler: DeleteCampoHandler,
    private readonly getCamposByColecaoHandler: GetCamposByColecaoHandler,
    private readonly createItemHandler: CreateItemHandler,
    private readonly updateItemHandler: UpdateItemHandler,
    private readonly deleteItemHandler: DeleteItemHandler,
    private readonly getItemsByColecaoHandler: GetItemsByColecaoHandler,
  ) {}

  // -------------------------------------------------------------------------
  // COLEÇÃO
  // -------------------------------------------------------------------------

  async listByBloco(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = requireAuth(req.user?.id);
      const blocoId = requireParam(req.params.blocoId, "blocoId");
      console.log(`📋 [listByBloco] userId=${userId} blocoId=${blocoId}`);

      const query = new GetColecoesByBlocoQuery(userId, blocoId);
      const result = await this.getColecoesByBlocoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return this.handleError(res, error, "listByBloco");
    }
  }

  async createColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = requireAuth(req.user?.id);
      const blocoId = requireString(req.body.blocoId, "blocoId");
      const nome = requireString(req.body.nome, "nome");
      console.log(
        `📦 [createColecao] userId=${userId} blocoId=${blocoId} nome="${nome}"`,
      );

      const command = new CreateColecaoCommand(userId, blocoId, nome);
      const result = await this.createColecaoHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return this.handleError(res, error, "createColecao");
    }
  }

  async updateColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = requireParam(req.params.id, "id");
      const nome = requireString(req.body.nome, "nome");
      console.log(`✏️ [updateColecao] id=${id} nome="${nome}"`);

      const command = new UpdateColecaoCommand(id, nome);
      const result = await this.updateColecaoHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return this.handleError(res, error, "updateColecao");
    }
  }

  async deleteColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = requireAuth(req.user?.id);
      const id = requireParam(req.params.id, "id");
      console.log(`🗑️ [deleteColecao] userId=${userId} id=${id}`);

      const command = new DeleteColecaoCommand(id, userId);
      await this.deleteColecaoHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return this.handleError(res, error, "deleteColecao");
    }
  }

  async getColecaoById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = requireAuth(req.user?.id);
      const id = requireParam(req.params.id, "id");
      console.log(`🔍 [getColecaoById] userId=${userId} id=${id}`);

      // CORRIGIDO: userId primeiro, depois id da coleção
      const query = new GetColecaoByIdQuery(userId, id);
      const result = await this.getColecaoByIdHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return this.handleError(res, error, "getColecaoById");
    }
  }

  // -------------------------------------------------------------------------
  // CAMPO
  // -------------------------------------------------------------------------

  async getCamposByColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = requireAuth(req.user?.id);
      const colecaoId = requireParam(req.params.colecaoId, "colecaoId");
      console.log(
        `📋 [getCamposByColecao] userId=${userId} colecaoId=${colecaoId}`,
      );

      // CORRIGIDO: userId primeiro, depois colecaoId
      const query = new GetCamposByColecaoQuery(userId, colecaoId);
      const result = await this.getCamposByColecaoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return this.handleError(res, error, "getCamposByColecao");
    }
  }

  async createCampo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = requireAuth(req.user?.id);
      const colecaoId = requireString(req.body.colecaoId, "colecaoId");
      const nome = requireString(req.body.nome, "nome");
      const tipoCampo = requireString(req.body.tipoCampo, "tipoCampo");
      console.log(
        `📦 [createCampo] userId=${userId} colecaoId=${colecaoId} nome="${nome}" tipo="${tipoCampo}"`,
      );

      const command = new CreateCampoCommand(
        userId,
        colecaoId,
        nome,
        tipoCampo as any,
      );
      const result = await this.createCampoHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return this.handleError(res, error, "createCampo");
    }
  }

  async updateCampo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const id = requireParam(req.params.id, "id");
      const nome = req.body.nome
        ? requireString(req.body.nome, "nome")
        : undefined;
      const tipoCampo = req.body.tipoCampo
        ? requireString(req.body.tipoCampo, "tipoCampo")
        : undefined;
      console.log(
        `✏️ [updateCampo] id=${id} nome="${nome}" tipo="${tipoCampo}"`,
      );

      const command = new UpdateCampoCommand(
        id,
        nome as string,
        tipoCampo as string,
      );
      const result = await this.updateCampoHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return this.handleError(res, error, "updateCampo");
    }
  }

  async deleteCampo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = requireAuth(req.user?.id);
      const id = requireParam(req.params.id, "id");
      console.log(`🗑️ [deleteCampo] userId=${userId} id=${id}`);

      const command = new DeleteCampoCommand(id, userId);
      await this.deleteCampoHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return this.handleError(res, error, "deleteCampo");
    }
  }

  // -------------------------------------------------------------------------
  // ITEM
  // -------------------------------------------------------------------------

  async getItemsByColecao(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = requireAuth(req.user?.id);
      const colecaoId = requireParam(req.params.colecaoId, "colecaoId");
      console.log(
        `📋 [getItemsByColecao] userId=${userId} colecaoId=${colecaoId}`,
      );

      // CORRIGIDO: userId primeiro, depois colecaoId
      const query = new GetItemsByColecaoQuery(userId, colecaoId);
      const result = await this.getItemsByColecaoHandler.execute(query);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return this.handleError(res, error, "getItemsByColecao");
    }
  }

  async createItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = requireAuth(req.user?.id);
      const colecaoId = requireString(req.body.colecaoId, "colecaoId");
      const valores = req.body.valores;

      if (!valores || typeof valores !== "object") {
        throw new Error("VALIDATION: valores devem ser um objeto");
      }
      console.log(`📦 [createItem] userId=${userId} colecaoId=${colecaoId}`);

      const command = new CreateItemCommand(userId, colecaoId, valores);
      const result = await this.createItemHandler.execute(command);
      return res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      return this.handleError(res, error, "createItem");
    }
  }

  async updateItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = requireAuth(req.user?.id);
      const id = requireParam(req.params.id, "id");
      const valores = req.body.valores;

      if (!valores || typeof valores !== "object") {
        throw new Error("VALIDATION: valores devem ser um objeto");
      }
      console.log(`✏️ [updateItem] userId=${userId} id=${id}`);

      const command = new UpdateItemCommand(id, userId, valores);
      const result = await this.updateItemHandler.execute(command);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return this.handleError(res, error, "updateItem");
    }
  }

  async deleteItem(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = requireAuth(req.user?.id);
      const id = requireParam(req.params.id, "id");
      console.log(`🗑️ [deleteItem] userId=${userId} id=${id}`);

      const command = new DeleteItemCommand(id, userId);
      await this.deleteItemHandler.execute(command);
      return res.status(204).send();
    } catch (error: any) {
      return this.handleError(res, error, "deleteItem");
    }
  }

  // -------------------------------------------------------------------------
  // Manipulador de erro centralizado
  // -------------------------------------------------------------------------
  private handleError(res: Response, error: any, method: string): Response {
    const errorMessage = error?.message || "Erro interno do servidor";
    console.error(`❌ [${method}] Erro:`, errorMessage);

    let status = 500;
    const msg = errorMessage.toLowerCase();

    if (msg.includes("não encontrado") || msg.includes("not found")) {
      status = 404;
    } else if (
      msg.includes("permissão") ||
      msg.includes("forbidden") ||
      msg.includes("não tem acesso")
    ) {
      status = 403;
    } else if (
      msg.includes("não autenticado") ||
      msg.includes("unauthorized") ||
      msg.includes("token")
    ) {
      status = 401;
    } else if (
      msg.includes("validação") ||
      msg.includes("validation") ||
      msg.includes("inválido") ||
      msg.includes("obrigatório")
    ) {
      status = 400;
    }

    if (errorMessage.startsWith("VALIDATION:")) status = 400;
    if (errorMessage.startsWith("UNAUTHORIZED:")) status = 401;
    if (errorMessage.startsWith("FORBIDDEN:")) status = 403;
    if (errorMessage.startsWith("NOTFOUND:")) status = 404;

    return res.status(status).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === "development" && { stack: error?.stack }),
    });
  }
}
