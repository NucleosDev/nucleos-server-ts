// // infrastructure/persistence/repositories/timer.repository.ts
// import { BaseRepository } from './base.repository';
// import { Timer } from '../../../domain/entities/Timer';
// import { pool } from '../db/connection';

// export class TimerRepository extends BaseRepository<Timer> {
//   protected tableName = 'timers';

//   async create(timer: Timer): Promise<Timer> {
//     const result = await this.query(
//       `INSERT INTO timers (
//         id, nucleo_id, titulo, inicio, fim, duracao_segundos,
//         created_at, updated_at
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//       RETURNING *`,
//       [
//         timer.id, timer.nucleoId, timer.titulo, timer.inicio,
//         timer.fim, timer.duracaoSegundos,
//         timer.createdAt, timer.updatedAt
//       ]
//     );
//     return this.mapToEntity(result.rows[0]);
//   }

//   async findByNucleoId(nucleoId: string): Promise<Timer[]> {
//     const result = await this.query(
//       `SELECT * FROM timers WHERE nucleo_id = $1 ORDER BY created_at DESC`,
//       [nucleoId]
//     );
//     return result.rows.map(row => this.mapToEntity(row));
//   }

//   async findActiveByNucleoId(nucleoId: string): Promise<Timer | null> {
//     const result = await this.query(
//       `SELECT * FROM timers 
//        WHERE nucleo_id = $1 AND fim IS NULL 
//        ORDER BY created_at DESC LIMIT 1`,
//       [nucleoId]
//     );
//     return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
//   }

//   async update(timer: Timer): Promise<Timer> {
//     const result = await this.query(
//       `UPDATE timers 
//        SET titulo = $1, inicio = $2, fim = $3, duracao_segundos = $4, updated_at = $5
//        WHERE id = $6 RETURNING *`,
//       [timer.titulo, timer.inicio, timer.fim, timer.duracaoSegundos, new Date(), timer.id]
//     );
//     return this.mapToEntity(result.rows[0]);
//   }

//   private mapToEntity(row: any): Timer {
//     const timer = new Timer(
//       row.nucleo_id,
//       row.titulo,
//       row.inicio,
//       row.fim,
//       row.duracao_segundos
//     );
//     timer.id = row.id;
//     timer.createdAt = row.created_at;
//     timer.updatedAt = row.updated_at;
//     timer.deletedAt = row.deleted_at;
//     return timer;
//   }
// }