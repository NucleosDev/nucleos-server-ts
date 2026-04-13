import { ICurrentUserService } from "../../application/interfaces/ICurrentUserService";
import { Request } from "express";
import { pool } from "../persistence/db/connection";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  permissions?: string[];
  plan?: {
    id: string;
    name: string;
    maxNucleos: number;
    features: Record<string, any>;
  };
}

export class CurrentUserService implements ICurrentUserService {
  private request: Request | null = null;
  private cachedPlan: any = null;

  setRequest(req: Request): void {
    this.request = req;
    this.cachedPlan = null; // Limpar cache ao mudar request
  }

  getUserId(): string | null {
    return (this.request as any)?.user?.id || null;
  }

  getEmail(): string | null {
    return (this.request as any)?.user?.email || null;
  }

  getRole(): string | null {
    return (this.request as any)?.user?.role || null;
  }

  getFullName(): string | null {
    return (this.request as any)?.user?.fullName || null;
  }

  async getCurrentUserPlan(): Promise<any | null> {
    if (this.cachedPlan) return this.cachedPlan;

    const userId = this.getUserId();
    if (!userId) return null;

    try {
      const result = await pool.query(
        `SELECT p.id, p.name, p.max_nucleos, p.features, s.expires_at, s.is_active
         FROM subscriptions s
         JOIN plans p ON s.plan_id = p.id
         WHERE s.user_id = $1 AND s.is_active = true
         LIMIT 1`,
        [userId],
      );

      if (result.rows.length > 0) {
        this.cachedPlan = result.rows[0];
        return this.cachedPlan;
      }

      // Buscar plano free padrão
      const freePlan = await pool.query(
        `SELECT id, name, max_nucleos, features FROM plans WHERE name = 'free' LIMIT 1`,
      );

      if (freePlan.rows.length > 0) {
        this.cachedPlan = freePlan.rows[0];
        return this.cachedPlan;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar plano do usuário:", error);
      return null;
    }
  }

  async canCreateNucleo(): Promise<boolean> {
    const plan = await this.getCurrentUserPlan();
    if (!plan) return false;

    // Contar núcleos atuais do usuário
    const userId = this.getUserId();
    if (!userId) return false;

    const result = await pool.query(
      `SELECT COUNT(*) as count FROM nucleos WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId],
    );

    const currentNucleos = parseInt(result.rows[0].count);
    const maxNucleos = plan.max_nucleos;

    return maxNucleos === -1 || currentNucleos < maxNucleos;
  }

  getCurrentUser(): CurrentUser | null {
    const user = (this.request as any)?.user;
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions || [],
    };
  }

  async getCurrentUserWithPlan(): Promise<CurrentUser | null> {
    const user = this.getCurrentUser();
    if (!user) return null;

    const plan = await this.getCurrentUserPlan();

    return {
      ...user,
      plan: plan
        ? {
            id: plan.id,
            name: plan.name,
            maxNucleos: plan.max_nucleos,
            features: plan.features,
          }
        : undefined,
    };
  }

  isAuthenticated(): boolean {
    return !!(this.request as any)?.user;
  }

  hasPermission(permission: string): boolean {
    const user = (this.request as any)?.user;
    if (!user) return false;

    if (user.role === "admin") return true;
    if (user.role === permission) return true;
    if (user.permissions?.includes(permission)) return true;

    return false;
  }

  clear(): void {
    if (this.request) {
      (this.request as any).user = null;
    }
    this.cachedPlan = null;
  }
}
