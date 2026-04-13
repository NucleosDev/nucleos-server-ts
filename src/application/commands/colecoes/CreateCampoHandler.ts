import { Campo } from "../../../domain/entities/Campo";
import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { CreateCampoCommand } from "./CreateCampoCommand";
import { CampoResponseDto } from "../../dto/colecao.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class CreateCampoHandler {
  constructor(
    private readonly colecaoRepository: IColecaoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: CreateCampoCommand): Promise<CampoResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar permissão via coleção
    const colecaoCheck = await pool.query(
      `SELECT c.id, n.user_id 
       FROM colecoes c
       JOIN blocos b ON c.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE c.id = $1`,
      [command.colecaoId],
    );

    if (colecaoCheck.rows.length === 0) {
      throw new Error("Coleção não encontrada");
    }

    if (colecaoCheck.rows[0].user_id !== userId) {
      throw new Error("Acesso negado");
    }

    const campo = Campo.create({
      colecaoId: command.colecaoId,
      nome: command.nome,
      tipoCampo: command.tipoCampo,
    });

    await this.colecaoRepository.saveCampo(campo);

    return {
      id: campo.id,
      colecaoId: campo.colecaoId,
      nome: campo.nome,
      tipoCampo: campo.tipoCampo,
      createdAt: campo.createdAt.toISOString(),
      updatedAt: campo.updatedAt.toISOString(),
    };
  }
}
