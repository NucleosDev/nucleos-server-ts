import { Tarefa } from "../entities/Tarefa";

export interface ITarefaRepository {
  save(tarefa: Tarefa): Promise<void>;
  findById(id: string): Promise<Tarefa | null>;
  findByBlocoId(blocoId: string): Promise<Tarefa[]>;
  update(tarefa: Tarefa): Promise<void>;
  delete(id: string): Promise<void>;
  getNextPosition(blocoId: string): Promise<number>;
}
