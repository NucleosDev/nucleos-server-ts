import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { DeleteColecaoCommand } from "./DeleteColecaoCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class DeleteColecaoHandler {
  constructor(
    private readonly colecaoRepository: IColecaoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: DeleteColecaoCommand): Promise<void> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const colecao = await this.colecaoRepository.findColecaoById(command.id);
    if (!colecao) {
      throw new Error("Coleção não encontrada");
    }

    // Verificar permissão via bloco
    const blocoCheck = await pool.query(
      `SELECT n.user_id 
       FROM colecoes c
       JOIN blocos b ON c.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE c.id = $1`,
      [command.id],
    );

    if (blocoCheck.rows[0]?.user_id !== userId) {
      throw new Error("Acesso negado");
    }

    await this.colecaoRepository.deleteColecao(command.id);
  }
}
