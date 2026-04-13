import { IColecaoRepository } from "../../../domain/repositories/IColecaoRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { DeleteItemCommand } from "./DeleteItemCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class DeleteItemHandler {
  constructor(
    private readonly colecaoRepository: IColecaoRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: DeleteItemCommand): Promise<void> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const item = await this.colecaoRepository.findItemById(command.id);
    if (!item) {
      throw new Error("Item não encontrado");
    }

    // Verificar permissão via coleção
    const colecaoCheck = await pool.query(
      `SELECT n.user_id 
       FROM itens i
       JOIN colecoes c ON i.colecao_id = c.id
       JOIN blocos b ON c.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE i.id = $1`,
      [command.id],
    );

    if (colecaoCheck.rows[0]?.user_id !== userId) {
      throw new Error("Acesso negado");
    }

    await this.colecaoRepository.deleteItem(command.id);
  }
}
