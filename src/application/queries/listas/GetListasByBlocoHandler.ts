import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { ListaResponseDto } from "../../dto/lista.dto";
import { GetListasByBlocoQuery } from "./GetListasByBlocoQuery";

export class GetListasByBlocoHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(query: GetListasByBlocoQuery): Promise<ListaResponseDto[]> {
    const listas = await this.listaRepository.findAllListasByBlocoId(
      query.blocoId,
    );

    return listas.map((lista) => ({
      id: lista.id,
      blocoId: lista.blocoId,
      nome: lista.nome,
      tipoLista: lista.tipoLista,
      createdAt: lista.createdAt.toISOString(),
      updatedAt: lista.updatedAt.toISOString(),
    }));
  }
}
