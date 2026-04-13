import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { ColecaoResponseDto } from "../../dto/colecao.dto";
import { GetColecoesByBlocoQuery } from "./GetColecoesByBlocoQuery";

export class GetColecoesByBlocoHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(query: GetColecoesByBlocoQuery): Promise<ColecaoResponseDto[]> {
    const colecoes = await this.colecaoRepository.findAllColecoesByBlocoId(
      query.blocoId,
    );

    return colecoes.map((colecao) => ({
      id: colecao.id,
      blocoId: colecao.blocoId,
      nome: colecao.nome,
      createdAt: colecao.createdAt.toISOString(),
      updatedAt: colecao.updatedAt.toISOString(),
    }));
  }
}
