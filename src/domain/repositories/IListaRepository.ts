import { Lista } from "../entities/Lista";
import { ItemLista } from "../entities/ItemLista";
import { Categoria } from "../entities/Categoria";

export interface IListaRepository {
  // Lista CRUD
  saveLista(lista: Lista): Promise<void>;
  findListaById(id: string): Promise<Lista | null>;
  findAllListasByBlocoId(blocoId: string): Promise<Lista[]>;
  updateLista(lista: Lista): Promise<void>;
  deleteLista(id: string): Promise<void>;

  // Item CRUD
  saveItem(item: ItemLista): Promise<void>;
  findItemById(id: string): Promise<ItemLista | null>;
  findAllItemsByListaId(listaId: string): Promise<ItemLista[]>;
  updateItem(item: ItemLista): Promise<void>;
  deleteItem(id: string): Promise<void>;
  bulkUpdateItems(items: ItemLista[]): Promise<void>;

  // Categoria CRUD
  saveCategoria(categoria: Categoria): Promise<void>;
  findCategoriaById(id: string): Promise<Categoria | null>;
  findAllCategoriasByListaId(listaId: string): Promise<Categoria[]>;
  updateCategoria(categoria: Categoria): Promise<void>;
  deleteCategoria(id: string): Promise<void>;
}
