import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { ItemListaResponseDto } from "../../dto/lista.dto";
import { GetItemsByListaQuery } from "./GetItemsByListaQuery";

export class GetItemsByListaHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(query: GetItemsByListaQuery): Promise<ItemListaResponseDto[]> {
    const items = await this.listaRepository.findAllItemsByListaId(
      query.listaId,
    );

    return items.map((item) => ({
      id: item.id,
      listaId: item.listaId,
      categoriaId: item.categoriaId,
      nome: item.nome,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
      checked: item.checked,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }
}
