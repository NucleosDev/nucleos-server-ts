import { ItemLista } from "../../../domain/entities/ItemLista";
import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { ICurrentUserService } from "../../interfaces/ICurrentUserService";
import { CreateItemListaCommand } from "./CreateItemListaCommand";
import { ItemListaResponseDto } from "../../dto/lista.dto";
import { pool } from "../../../infrastructure/persistence/db/connection";

export class CreateItemListaHandler {
  constructor(
    private readonly listaRepository: IListaRepository,
    private readonly currentUserService: ICurrentUserService,
  ) {}

  async execute(
    command: CreateItemListaCommand,
  ): Promise<ItemListaResponseDto> {
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

    const item = ItemLista.create({
      listaId: command.listaId,
      nome: command.nome,
      quantidade: command.quantidade,
      valorUnitario: command.valorUnitario,
      categoriaId: command.categoriaId,
    });

    await this.listaRepository.saveItem(item);

    return {
      id: item.id,
      listaId: item.listaId,
      categoriaId: item.categoriaId,
      nome: item.nome,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
      checked: item.checked,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
