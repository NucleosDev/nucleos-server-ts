import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { CategoriaResponseDto } from "../../dto/lista.dto";
import { GetCategoriasByListaQuery } from "./GetCategoriasByListaQuery";

export class GetCategoriasByListaHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(
    query: GetCategoriasByListaQuery,
  ): Promise<CategoriaResponseDto[]> {
    const categorias = await this.listaRepository.findAllCategoriasByListaId(
      query.listaId,
    );

    return categorias.map((categoria) => ({
      id: categoria.id,
      listaId: categoria.listaId,
      nome: categoria.nome,
      cor: categoria.cor,
      createdAt: categoria.createdAt.toISOString(),
    }));
  }
}
