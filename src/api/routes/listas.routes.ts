// src/api/routes/listas.routes.ts
import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { ListasController } from "../controllers/v1/ListasController";
import { CreateListaHandler } from "../../application/commands/listas/CreateListaHandler";
import { UpdateListaHandler } from "../../application/commands/listas/UpdateListaHandler";
import { DeleteListaHandler } from "../../application/commands/listas/DeleteListaHandler";
import { GetListasByBlocoHandler } from "../../application/queries/listas/GetListasByBlocoHandler";
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

// Lista - Handlers SEM CurrentUserService
const createListaHandler = new CreateListaHandler(listaRepository);
const updateListaHandler = new UpdateListaHandler(listaRepository);
const deleteListaHandler = new DeleteListaHandler(listaRepository);
const getListasByBlocoHandler = new GetListasByBlocoHandler(listaRepository);

// Item - Handlers SEM CurrentUserService
const createItemHandler = new CreateItemListaHandler(listaRepository);
const updateItemHandler = new UpdateItemListaHandler(listaRepository);
const toggleItemHandler = new ToggleItemCheckedHandler(listaRepository);
const deleteItemHandler = new DeleteItemListaHandler(listaRepository);
const getItemsByListaHandler = new GetItemsByListaHandler(listaRepository);

// Categoria - Handlers SEM CurrentUserService
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

//  LISTA
listasRoutes.get("/bloco/:blocoId", authenticate, (req, res, next) => {
  listasController.listByBloco(req as AuthRequest, res).catch(next);
});

listasRoutes.post("/", authenticate, (req, res, next) => {
  listasController.createLista(req as AuthRequest, res).catch(next);
});

listasRoutes.put("/:id", authenticate, (req, res, next) => {
  listasController.updateLista(req as AuthRequest, res).catch(next);
});

listasRoutes.delete("/:id", authenticate, (req, res, next) => {
  listasController.deleteLista(req as AuthRequest, res).catch(next);
});

//  ITEM
listasRoutes.get("/:listaId/items", authenticate, (req, res, next) => {
  listasController.getItemsByLista(req as AuthRequest, res).catch(next);
});

listasRoutes.post("/items", authenticate, (req, res, next) => {
  listasController.createItem(req as AuthRequest, res).catch(next);
});

listasRoutes.put("/items/:id", authenticate, (req, res, next) => {
  listasController.updateItem(req as AuthRequest, res).catch(next);
});

listasRoutes.patch("/items/:id/toggle", authenticate, (req, res, next) => {
  listasController.toggleItem(req as AuthRequest, res).catch(next);
});

listasRoutes.delete("/items/:id", authenticate, (req, res, next) => {
  listasController.deleteItem(req as AuthRequest, res).catch(next);
});

//  CATEGORIA
listasRoutes.get("/:listaId/categorias", authenticate, (req, res, next) => {
  listasController.getCategoriasByLista(req as AuthRequest, res).catch(next);
});

listasRoutes.post("/categorias", authenticate, (req, res, next) => {
  listasController.createCategoria(req as AuthRequest, res).catch(next);
});

listasRoutes.delete("/categorias/:id", authenticate, (req, res, next) => {
  listasController.deleteCategoria(req as AuthRequest, res).catch(next);
});
