import { Conquista } from "../entities/Conquista.js";

export interface IConquistaRepository {
  findAll(): Promise<Conquista[]>;
  findById(id: string): Promise<Conquista | null>;
  findByUserId(userId: string): Promise<Conquista[]>;
  save(conquista: Conquista): Promise<void>;
}
