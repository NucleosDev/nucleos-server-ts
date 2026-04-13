import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { DeleteItemListaCommand } from "./DeleteItemListaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class DeleteItemListaHandler {
  constructor(
    private readonly listaRepository: IListaRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: DeleteItemListaCommand): Promise<void> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const item = await this.listaRepository.findItemById(command.id);
    if (!item) {
      throw new Error("Item não encontrado");
    }

    // Verificar permissão via lista
    const listaCheck = await pool.query(
      `SELECT n.user_id 
       FROM listas l
       JOIN blocos b ON l.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE l.id = $1`,
      [item.listaId],
    );

    if (listaCheck.rows[0]?.user_id !== userId) {
      throw new Error("Acesso negado");
    }

    await this.listaRepository.deleteItem(command.id);
  }
}
