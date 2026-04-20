import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ColecoesController } from "../controllers/v1/ColecoesController";
import { CreateColecaoHandler } from "../../application/commands/colecoes/CreateColecaoHandler";
import { UpdateColecaoHandler } from "../../application/commands/colecoes/UpdateColecaoHandler";
import { DeleteColecaoHandler } from "../../application/commands/colecoes/DeleteColecaoHandler";
import { GetColecoesByBlocoHandler } from "../../application/queries/colecoes/GetColecoesByBlocoHandler";
import { GetColecaoByIdHandler } from "../../application/queries/colecoes/GetColecaoByIdHandler";
import { CreateCampoHandler } from "../../application/commands/colecoes/CreateCampoHandler";
import { UpdateCampoHandler } from "../../application/commands/colecoes/UpdateCampoHandler";
import { DeleteCampoHandler } from "../../application/commands/colecoes/DeleteCampoHandler";
import { GetCamposByColecaoHandler } from "../../application/queries/colecoes/GetCamposByColecaoHandler";
import { CreateItemHandler } from "../../application/commands/colecoes/CreateItemHandler";
import { UpdateItemHandler } from "../../application/commands/colecoes/UpdateItemHandler";
import { DeleteItemHandler } from "../../application/commands/colecoes/DeleteItemHandler";
import { GetItemsByColecaoHandler } from "../../application/queries/colecoes/GetItemsByColecaoHandler";
import { ColecaoRepository } from "../../infrastructure/persistence/repositories/ColecaoRepository";
import { CurrentUserService } from "../../infrastructure/services/current-user.service";

const colecaoRepository = new ColecaoRepository();
const currentUserService = new CurrentUserService();

// Coleção
const createColecaoHandler = new CreateColecaoHandler(colecaoRepository);
const updateColecaoHandler = new UpdateColecaoHandler(colecaoRepository);
const deleteColecaoHandler = new DeleteColecaoHandler(colecaoRepository);
const getColecoesByBlocoHandler = new GetColecoesByBlocoHandler(
  colecaoRepository,
);
const getColecaoByIdHandler = new GetColecaoByIdHandler(); // ⬅️ NOVO

// Campo
const createCampoHandler = new CreateCampoHandler(colecaoRepository);
const updateCampoHandler = new UpdateCampoHandler(colecaoRepository);
const deleteCampoHandler = new DeleteCampoHandler(colecaoRepository);
const getCamposByColecaoHandler = new GetCamposByColecaoHandler(
  colecaoRepository,
);

// Item
const createItemHandler = new CreateItemHandler(colecaoRepository);
const updateItemHandler = new UpdateItemHandler(colecaoRepository);
const deleteItemHandler = new DeleteItemHandler(colecaoRepository);
const getItemsByColecaoHandler = new GetItemsByColecaoHandler(
  colecaoRepository,
);

// ⚠️ Atenção: agora são 13 parâmetros, na ordem correta!
const colecoesController = new ColecoesController(
  createColecaoHandler,
  updateColecaoHandler,
  deleteColecaoHandler,
  getColecoesByBlocoHandler,
  getColecaoByIdHandler, // ⬅️ NOVO
  createCampoHandler,
  updateCampoHandler,
  deleteCampoHandler,
  getCamposByColecaoHandler,
  createItemHandler,
  updateItemHandler,
  deleteItemHandler,
  getItemsByColecaoHandler,
);

export const colecoesRoutes = Router();

// ==================== COLEÇÕES ====================
// Rota de listagem por bloco (específica)
colecoesRoutes.get("/bloco/:blocoId", authenticate, (req, res, next) => {
  colecoesController.listByBloco(req as AuthRequest, res).catch(next);
});

// Criação de coleção
colecoesRoutes.post("/", authenticate, (req, res, next) => {
  colecoesController.createColecao(req as AuthRequest, res).catch(next);
});

// ==================== CAMPOS (ANTES DO :id) ====================
colecoesRoutes.get("/:colecaoId/campos", authenticate, (req, res, next) => {
  colecoesController.getCamposByColecao(req as AuthRequest, res).catch(next);
});

colecoesRoutes.post("/campos", authenticate, (req, res, next) => {
  colecoesController.createCampo(req as AuthRequest, res).catch(next);
});

colecoesRoutes.put("/campos/:id", authenticate, (req, res, next) => {
  colecoesController.updateCampo(req as AuthRequest, res).catch(next);
});

colecoesRoutes.delete("/campos/:id", authenticate, (req, res, next) => {
  colecoesController.deleteCampo(req as AuthRequest, res).catch(next);
});

// ==================== ITENS (ANTES DO :id) ====================
colecoesRoutes.get("/:colecaoId/items", authenticate, (req, res, next) => {
  colecoesController.getItemsByColecao(req as AuthRequest, res).catch(next);
});

colecoesRoutes.post("/items", authenticate, (req, res, next) => {
  colecoesController.createItem(req as AuthRequest, res).catch(next);
});

colecoesRoutes.put("/items/:id", authenticate, (req, res, next) => {
  colecoesController.updateItem(req as AuthRequest, res).catch(next);
});

colecoesRoutes.delete("/items/:id", authenticate, (req, res, next) => {
  colecoesController.deleteItem(req as AuthRequest, res).catch(next);
});

// ==================== ROTAS COM :id (POR ÚLTIMO) ====================
colecoesRoutes.get("/:id", authenticate, (req, res, next) => {
  colecoesController.getColecaoById(req as AuthRequest, res).catch(next);
});

colecoesRoutes.put("/:id", authenticate, (req, res, next) => {
  colecoesController.updateColecao(req as AuthRequest, res).catch(next);
});

colecoesRoutes.delete("/:id", authenticate, (req, res, next) => {
  colecoesController.deleteColecao(req as AuthRequest, res).catch(next);
});
