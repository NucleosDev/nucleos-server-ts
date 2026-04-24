import { IListaRepository } from "../../../domain/repositories/IListaRepository";
import { ToggleItemCheckedCommand } from "./ToggleItemCheckedCommand";
import { pool } from "../../../infrastructure/persistence/db/connection";
import { NotFoundException } from "../../common/exceptions/not-found.exception";
import { ForbiddenException } from "../../common/exceptions/forbidden.exception";
import { NotificationsController } from "../../../api/controllers/v1/NotificationsController";
import { ItemLista } from "../../../domain/entities/ItemLista";
export class ToggleItemCheckedHandler {
  constructor(private readonly listaRepository: IListaRepository) {}

  async execute(command: ToggleItemCheckedCommand): Promise<any> {
    const { id, userId, checked } = command;

    // Verificar permissão
    const check = await pool.query(
      `SELECT n.user_id FROM itens_lista i
       JOIN listas l ON l.id = i.lista_id
       JOIN blocos b ON b.id = l.bloco_id
       JOIN nucleos n ON n.id = b.nucleo_id
       WHERE i.id = $1 AND i.deleted_at IS NULL`,
      [id],
    );

    if (check.rows.length === 0) {
      throw new NotFoundException("Item", id);
    }

    if (check.rows[0].user_id !== userId) {
      throw new ForbiddenException("Sem permissão para alterar este item");
    }

    const novoChecked = checked !== undefined ? checked : true;

    await pool.query(
      `UPDATE itens_lista SET checked = $1, updated_at = NOW() WHERE id = $2`,
      [novoChecked, id],
    );

    const result = await pool.query(`SELECT * FROM itens_lista WHERE id = $1`, [
      id,
    ]);

    if (command.checked) {
      await NotificationsController.createNotification(
        command.userId,
        "Item Concluído!",
        `Você completou "${ItemLista.name}" e ganhou 10 XP!`,
      );
    }

    return {
      id: result.rows[0].id,
      listaId: result.rows[0].lista_id,
      categoriaId: result.rows[0].categoria_id,
      nome: result.rows[0].nome,
      quantidade: result.rows[0].quantidade,
      valorUnitario: result.rows[0].valor_unitario,
      valorTotal: result.rows[0].valor_total,
      checked: result.rows[0].checked,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
    };
  }
}
