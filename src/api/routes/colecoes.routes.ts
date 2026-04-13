import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ColecoesController } from "../controllers/v1/ColecoesController";
import { CreateColecaoHandler } from "../../application/commands/colecoes/CreateColecaoHandler";
import { UpdateColecaoHandler } from "../../application/commands/colecoes/UpdateColecaoHandler";
import { DeleteColecaoHandler } from "../../application/commands/colecoes/DeleteColecaoHandler";
import { GetColecoesByBlocoHandler } from "../../application/queries/colecoes/GetColecoesByBlocoHandler";
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
const createColecaoHandler = new CreateColecaoHandler(
  colecaoRepository,
  currentUserService,
);
const updateColecaoHandler = new UpdateColecaoHandler(
  colecaoRepository,
  currentUserService,
);
const deleteColecaoHandler = new DeleteColecaoHandler(
  colecaoRepository,
  currentUserService,
);
const getColecoesByBlocoHandler = new GetColecoesByBlocoHandler(
  colecaoRepository,
);

// Campo
const createCampoHandler = new CreateCampoHandler(
  colecaoRepository,
  currentUserService,
);
const updateCampoHandler = new UpdateCampoHandler(
  colecaoRepository,
  currentUserService,
);
const deleteCampoHandler = new DeleteCampoHandler(
  colecaoRepository,
  currentUserService,
);
const getCamposByColecaoHandler = new GetCamposByColecaoHandler(
  colecaoRepository,
);

// Item
const createItemHandler = new CreateItemHandler(
  colecaoRepository,
  currentUserService,
);
const updateItemHandler = new UpdateItemHandler(
  colecaoRepository,
  currentUserService,
);
const deleteItemHandler = new DeleteItemHandler(
  colecaoRepository,
  currentUserService,
);
const getItemsByColecaoHandler = new GetItemsByColecaoHandler(
  colecaoRepository,
);

const colecoesController = new ColecoesController(
  createColecaoHandler,
  updateColecaoHandler,
  deleteColecaoHandler,
  getColecoesByBlocoHandler,
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

// ========== COLEÇÃO ==========
colecoesRoutes.get("/bloco/:blocoId", authenticate, (req, res, next) => {
  colecoesController.listByBloco(req as AuthRequest, res).catch(next);
});

colecoesRoutes.post("/", authenticate, (req, res, next) => {
  colecoesController.createColecao(req as AuthRequest, res).catch(next);
});

colecoesRoutes.put("/:id", authenticate, (req, res, next) => {
  colecoesController.updateColecao(req as AuthRequest, res).catch(next);
});

colecoesRoutes.delete("/:id", authenticate, (req, res, next) => {
  colecoesController.deleteColecao(req as AuthRequest, res).catch(next);
});

// ========== CAMPO ==========
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

// ========== ITEM ==========
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
