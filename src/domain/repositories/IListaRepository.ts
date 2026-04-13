// domain/repositories/IListaRepository.ts
import { Lista } from "../entities/Lista";
import { ItemLista } from "../entities/ItemLista";
import { Categoria } from "../entities/Categoria";

export interface IListaRepository {
  //  LISTA
  saveLista(lista: Lista): Promise<void>;
  findListaById(id: string): Promise<Lista | null>;
  findListasByBlocoId(blocoId: string): Promise<Lista[]>;
  updateLista(lista: Lista): Promise<void>;
  deleteLista(id: string): Promise<void>;

  //  ITEM
  saveItem(item: ItemLista): Promise<void>;
  findItemById(id: string): Promise<ItemLista | null>;
  findItemsByListaId(listaId: string): Promise<ItemLista[]>;
  updateItem(item: ItemLista): Promise<void>;
  deleteItem(id: string): Promise<void>;
  bulkUpdateItems(items: ItemLista[]): Promise<void>;

  //  CATEGORIA
  saveCategoria(categoria: Categoria): Promise<void>;
  findCategoriaById(id: string): Promise<Categoria | null>;
  findCategoriasByListaId(listaId: string): Promise<Categoria[]>;
  updateCategoria(categoria: Categoria): Promise<void>;
  deleteCategoria(id: string): Promise<void>;
}
