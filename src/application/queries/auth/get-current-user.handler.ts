// application/queries/auth/get-current-user.handler.ts
import { IRequestHandler } from '../../common/mediator/mediator';
import { GetCurrentUserQuery } from './get-current-user.query';
import { UserDto } from '../../dto/user-dto';
import { pool } from '../../../infrastructure/persistence/db/connection';
import { NotFoundException } from '../../common/exceptions/not-found.exception';

export class GetCurrentUserQueryHandler implements IRequestHandler<GetCurrentUserQuery, UserDto> {
  async handle(request: GetCurrentUserQuery): Promise<UserDto> {
    const result = await pool.query(
      `SELECT 
        u.id, u.email, u.email_verified, u.active, u.created_at,
        up.full_name, up.nickname, up.avatar_url,
        ul.level, ul.current_xp, ul.next_level_xp, ul.total_xp_earned,
        ur.role,
        p.name as plan_name
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN user_levels ul ON ul.user_id = u.id
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN subscriptions s ON s.user_id = u.id
       LEFT JOIN plans p ON p.id = s.plan_id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [request.userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('User', request.userId);
    }

    const row = result.rows[0];

    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name || '',
      nickname: row.nickname,
      avatarUrl: row.avatar_url,
      cpf: row.cpf,
      phone: row.phone,
      emailVerified: row.email_verified,
      active: row.active,
      role: row.role || 'user',
      level: row.level || 1,
      currentXp: row.current_xp || 0,
      nextLevelXp: row.next_level_xp || 100,
      totalXpEarned: row.total_xp_earned || 0,
      plan: row.plan_name || 'Gratuito',
      createdAt: row.created_at
    };
  }
}