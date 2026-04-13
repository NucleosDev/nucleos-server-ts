
import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { DeleteCategoriaCommand } from "./DeleteCategoriaCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class DeleteCategoriaHandler {
  constructor(
    private readonly listaRepository: IListaRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: DeleteCategoriaCommand): Promise<void> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const categoria = await this.listaRepository.findCategoriaById(command.id);
    if (!categoria) {
      throw new Error("Categoria não encontrada");
    }

    // Verificar permissão via lista
    const listaCheck = await pool.query(
      `SELECT n.user_id 
       FROM listas l
       JOIN blocos b ON l.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE l.id = $1`,
      [categoria.listaId],
    );

    if (listaCheck.rows[0]?.user_id !== userId) {
      throw new Error("Acesso negado");
    }

    await this.listaRepository.deleteCategoria(command.id);
  }
}
