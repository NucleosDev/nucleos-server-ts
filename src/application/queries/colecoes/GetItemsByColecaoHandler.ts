import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { ItemResponseDto } from "../../dto/colecao.dto";
import { GetItemsByColecaoQuery } from "./GetItemsByColecaoQuery";

export class GetItemsByColecaoHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(query: GetItemsByColecaoQuery): Promise<ItemResponseDto[]> {
    const items = await this.colecaoRepository.findAllItemsByColecaoId(
      query.colecaoId,
    );
    const result: ItemResponseDto[] = [];

    for (const item of items) {
      const valores = await this.colecaoRepository.findAllItemValoresByItemId(
        item.id,
      );
      const valoresMap: Record<string, any> = {};

      for (const valor of valores) {
        if (valor.valorTexto !== null)
          valoresMap[valor.campoId] = valor.valorTexto;
        else if (valor.valorNumerico !== null)
          valoresMap[valor.campoId] = valor.valorNumerico;
        else if (valor.valorData !== null)
          valoresMap[valor.campoId] = valor.valorData.toISOString();
        else if (valor.valorBooleano !== null)
          valoresMap[valor.campoId] = valor.valorBooleano;
      }

      result.push({
        id: item.id,
        colecaoId: item.colecaoId,
        valores: valoresMap,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      });
    }

    return result;
  }
}
