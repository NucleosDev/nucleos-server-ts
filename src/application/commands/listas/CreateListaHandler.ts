import { Lista } from "../../../domain/entities/Lista";
import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { CreateListaCommand } from "./CreateListaCommand";
import { ListaResponseDto } from "../../dto/lista.dto";

export class CreateListaHandler {
  constructor(
    private readonly listaRepository: IListaRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(command: CreateListaCommand): Promise<ListaResponseDto> {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar se o bloco pertence ao usuário
    const blocoCheck = await pool.query(
      `SELECT b.id, n.user_id 
       FROM blocos b
       JOIN nucleos n ON b.nucleo_id = n.id
       WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [command.blocoId],
    );

    if (blocoCheck.rows.length === 0) {
      throw new Error("Bloco não encontrado");
    }

    if (blocoCheck.rows[0].user_id !== userId) {
      throw new Error("Acesso negado");
    }

    const lista = Lista.create({
      blocoId: command.blocoId,
      nome: command.nome,
      tipoLista: command.tipoLista,
    });

    await this.listaRepository.saveLista(lista);

    return {
      id: lista.id,
      blocoId: lista.blocoId,
      nome: lista.nome,
      tipoLista: lista.tipoLista,
      createdAt: lista.createdAt.toISOString(),
      updatedAt: lista.updatedAt.toISOString(),
    };
  }
}
