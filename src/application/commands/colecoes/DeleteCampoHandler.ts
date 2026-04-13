import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { DeleteCampoCommand } from "./DeleteCampoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class DeleteCampoHandler {
  constructor(
    private readonly colecaoRepository: IColecaoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: DeleteCampoCommand): Promise<void> {
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

    await this.colecaoRepository.deleteCampo(command.id);
  }
}
