import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { UpdateCampoCommand } from "./UpdateCampoCommand";
import { CampoResponseDto } from "../../dto/colecao.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class UpdateCampoHandler {
  constructor(
    private readonly colecaoRepository: IColecaoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: UpdateCampoCommand): Promise<CampoResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const campo = await this.colecaoRepository.findCampoById(command.id);
    if (!campo) {
      throw new Error("Campo não encontrado");
    }

    // Verificar permissão via coleção
    const colecaoCheck = await pool.query(
      `SELECT n.user_id 
       FROM campos c
       JOIN colecoes co ON c.colecao_id = co.id
       JOIN blocos b ON co.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE c.id = $1`,
      [command.id],
    );

    if (colecaoCheck.rows[0]?.user_id !== userId) {
      throw new Error("Acesso negado");
    }

    if (command.nome !== undefined) campo.updateNome(command.nome);
    if (command.tipoCampo !== undefined)
      campo.updateTipoCampo(command.tipoCampo);

    await this.colecaoRepository.updateCampo(campo);

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
