import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { CampoResponseDto } from "../../dto/colecao.dto";
import { GetCamposByColecaoQuery } from "./GetCamposByColecaoQuery";

export class GetCamposByColecaoHandler {
  constructor(private readonly colecaoRepository: IColecaoRepository) {}

  async execute(query: GetCamposByColecaoQuery): Promise<CampoResponseDto[]> {
    const campos = await this.colecaoRepository.findAllCamposByColecaoId(
      query.colecaoId,
    );

    return campos.map((campo) => ({
      id: campo.id,
      colecaoId: campo.colecaoId,
      nome: campo.nome,
      tipoCampo: campo.tipoCampo,
      createdAt: campo.createdAt.toISOString(),
      updatedAt: campo.updatedAt.toISOString(),
    }));
  }
}
