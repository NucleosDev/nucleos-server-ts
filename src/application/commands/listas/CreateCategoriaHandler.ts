
import { Categoria } from "../../../domain/entities/Categoria";
import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { CreateCategoriaCommand } from "./CreateCategoriaCommand";
import { CategoriaResponseDto } from "../../dto/lista.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class CreateCategoriaHandler {
  constructor(
    private readonly listaRepository: IListaRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(
    command: CreateCategoriaCommand,
  ): Promise<CategoriaResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se a lista pertence ao usuário
    const listaCheck = await pool.query(
      `SELECT l.id, n.user_id 
       FROM listas l
       JOIN blocos b ON l.bloco_id = b.id
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE l.id = $1 AND l.deleted_at IS NULL`,
      [command.listaId],
    );

    if (listaCheck.rows.length === 0) {
      throw new Error("Lista não encontrada");
    }

    if (listaCheck.rows[0].user_id !== userId) {
      throw new Error("Acesso negado");
    }

    const categoria = Categoria.create({
      listaId: command.listaId,
      nome: command.nome,
      cor: command.cor,
    });

    await this.listaRepository.saveCategoria(categoria);

    return {
      id: categoria.id,
      listaId: categoria.listaId,
      nome: categoria.nome,
      cor: categoria.cor,
      createdAt: categoria.createdAt.toISOString(),
    };
  }
}
