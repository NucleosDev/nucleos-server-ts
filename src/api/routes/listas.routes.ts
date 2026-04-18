// src/api/routes/listas.routes.ts
import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { ListasController } from "../controllers/v1/ListasController";
import { CreateListaHandler } from "../../application/commands/listas/CreateListaHandler";
import { UpdateListaHandler } from "../../application/commands/listas/UpdateListaHandler";
import { DeleteListaHandler } from "../../application/commands/listas/DeleteListaHandler";
import { GetListasByBlocoHandler } from "../../application/queries/listas/GetListasByBlocoHandler";
import { GetListaByIdHandler } from "../../application/queries/listas/GetListaByIdHandler";
import { CreateItemListaHandler } from "../../application/commands/listas/CreateItemListaHandler";
import { UpdateItemListaHandler } from "../../application/commands/listas/UpdateItemListaHandler";
import { ToggleItemCheckedHandler } from "../../application/commands/listas/ToggleItemCheckedHandler";
import { DeleteItemListaHandler } from "../../application/commands/listas/DeleteItemListaHandler";
import { GetItemsByListaHandler } from "../../application/queries/listas/GetItemsByListaHandler";
import { CreateCategoriaHandler } from "../../application/commands/listas/CreateCategoriaHandler";
import { DeleteCategoriaHandler } from "../../application/commands/listas/DeleteCategoriaHandler";
import { GetCategoriasByListaHandler } from "../../application/queries/listas/GetCategoriasByListaHandler";
import { ListaRepository } from "../../infrastructure/persistence/repositories/ListaRepository";

const listaRepository = new ListaRepository();

// Handlers
const createListaHandler = new CreateListaHandler(listaRepository);
const updateListaHandler = new UpdateListaHandler(listaRepository);
const deleteListaHandler = new DeleteListaHandler(listaRepository);
const getListasByBlocoHandler = new GetListasByBlocoHandler(listaRepository);
const getListaByIdHandler = new GetListaByIdHandler(); // ou com repositório se necessário

const createItemHandler = new CreateItemListaHandler(listaRepository);
const updateItemHandler = new UpdateItemListaHandler(listaRepository);
const toggleItemHandler = new ToggleItemCheckedHandler(listaRepository);
const deleteItemHandler = new DeleteItemListaHandler(listaRepository);
const getItemsByListaHandler = new GetItemsByListaHandler(listaRepository);

const createCategoriaHandler = new CreateCategoriaHandler(listaRepository);
const deleteCategoriaHandler = new DeleteCategoriaHandler(listaRepository);
const getCategoriasByListaHandler = new GetCategoriasByListaHandler(
  listaRepository,
);

const listasController = new ListasController(
  createListaHandler,
  updateListaHandler,
  deleteListaHandler,
  getListasByBlocoHandler,
  getListaByIdHandler, // 👈 quinto parâmetro
  createItemHandler,
  updateItemHandler,
  toggleItemHandler,
  deleteItemHandler,
  getItemsByListaHandler,
  createCategoriaHandler,
  deleteCategoriaHandler,
  getCategoriasByListaHandler,
);

export const listasRoutes = Router();

// Middleware de autenticação
listasRoutes.use(authenticate);

// Rotas fixas (sem parâmetros de segmento variável)
listasRoutes.post("/", (req, res, next) => {
  listasController.createLista(req as AuthRequest, res).catch(next);
});

listasRoutes.post("/items", (req, res, next) => {
  listasController.createItem(req as AuthRequest, res).catch(next);
});

listasRoutes.post("/categorias", (req, res, next) => {
  listasController.createCategoria(req as AuthRequest, res).catch(next);
});

// Rotas com parâmetros múltiplos
listasRoutes.get("/bloco/:blocoId", (req, res, next) => {
  listasController.listByBloco(req as AuthRequest, res).catch(next);
});

listasRoutes.get("/:listaId/items", (req, res, next) => {
  listasController.getItemsByLista(req as AuthRequest, res).catch(next);
});

listasRoutes.get("/:listaId/categorias", (req, res, next) => {
  listasController.getCategoriasByLista(req as AuthRequest, res).catch(next);
});

// Rotas específicas de item/categoria
listasRoutes.put("/items/:id", (req, res, next) => {
  listasController.updateItem(req as AuthRequest, res).catch(next);
});

listasRoutes.patch("/items/:id/toggle", (req, res, next) => {
  listasController.toggleItem(req as AuthRequest, res).catch(next);
});

listasRoutes.delete("/items/:id", (req, res, next) => {
  listasController.deleteItem(req as AuthRequest, res).catch(next);
});

listasRoutes.delete("/categorias/:id", (req, res, next) => {
  listasController.deleteCategoria(req as AuthRequest, res).catch(next);
});

// Rotas com parâmetro único (devem vir por último)
listasRoutes.get("/:id", (req, res, next) => {
  listasController.getListaById(req as AuthRequest, res).catch(next);
});

listasRoutes.put("/:id", (req, res, next) => {
  listasController.updateLista(req as AuthRequest, res).catch(next);
});

listasRoutes.delete("/:id", (req, res, next) => {
  listasController.deleteLista(req as AuthRequest, res).catch(next);
});
