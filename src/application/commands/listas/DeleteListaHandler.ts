import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { DeleteListaCommand } from "./DeleteListaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class DeleteListaHandler {
  constructor(
    private readonly listaRepository: IListaRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: DeleteListaCommand): Promise<void> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const lista = await this.listaRepository.findListaById(command.id);
    if (!lista) {
      throw new Error("Lista não encontrada");
    }

    // Verificar permissão
    const blocoCheck = await pool.query(
      `SELECT n.user_id 
       FROM listas l
       JOIN blocos b ON l.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE l.id = $1`,
      [command.id],
    );

    if (blocoCheck.rows[0]?.user_id !== userId) {
      throw new Error("Acesso negado");
    }

    await this.listaRepository.deleteLista(command.id);
  }
}
