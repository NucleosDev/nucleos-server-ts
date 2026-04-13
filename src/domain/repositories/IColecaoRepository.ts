import { Colecao } from "../entities/Colecao";
import { Campo } from "../entities/Campo";
import { Item } from "../entities/Item";
import { ItemValor } from "../entities/ItemValor";

export interface IColecaoRepository {
  // Coleção CRUD
  saveColecao(colecao: Colecao): Promise<void>;
  findColecaoById(id: string): Promise<Colecao | null>;
  findAllColecoesByBlocoId(blocoId: string): Promise<Colecao[]>;
  updateColecao(colecao: Colecao): Promise<void>;
  deleteColecao(id: string): Promise<void>;

  // Campo CRUD
  saveCampo(campo: Campo): Promise<void>;
  findCampoById(id: string): Promise<Campo | null>;
  findAllCamposByColecaoId(colecaoId: string): Promise<Campo[]>;
  updateCampo(campo: Campo): Promise<void>;
  deleteCampo(id: string): Promise<void>;

  // Item CRUD
  saveItem(item: Item): Promise<void>;
  findItemById(id: string): Promise<Item | null>;
  findAllItemsByColecaoId(colecaoId: string): Promise<Item[]>;
  updateItem(item: Item): Promise<void>;
  deleteItem(id: string): Promise<void>;

  // ItemValor CRUD
  saveItemValor(itemValor: ItemValor): Promise<void>;
  findItemValorByItemAndCampo(
    itemId: string,
    campoId: string,
  ): Promise<ItemValor | null>;
  findAllItemValoresByItemId(itemId: string): Promise<ItemValor[]>;
  updateItemValor(itemValor: ItemValor): Promise<void>;
  deleteItemValor(id: string): Promise<void>;
  deleteItemValoresByItemId(itemId: string): Promise<void>;
}
