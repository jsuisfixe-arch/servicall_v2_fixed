import * as db from "../db";
import { logger } from "../infrastructure/logger";
import { User } from "../../drizzle/schema";
import type { Request } from "express";
import { COOKIE_NAME } from "@shared/const";
import { sdk } from "../_core/sdk";

export interface AuthenticatedUser extends Omit<User, 'role'> {
  tenantId: number;
  role: 'admin' | 'manager' | 'agent' | 'viewer' | 'superadmin' | 'owner';
}

export const AuthService = {
  async verifyUserSession(userId: number, tenantId: number): Promise<AuthenticatedUser | null> {
    try {
      const user = await db.getUserById(userId);
      if (!user) {
        return null;
      }

      const database = db.getDbInstance();
      const tenantUser = await database.query.tenantUsers.findFirst({
        where: (tu: Record<string, unknown>, { eq, and }: { eq: any; and: any }) => and(
          eq(tu.userId, userId),
          eq(tu.tenantId, tenantId)
        ),
      });

      if (!tenantUser || !tenantUser.isActive) {
        return null;
      }

      return {
        ...user,
        tenantId: tenantUser.tenantId,
        role: (tenantUser.role === 'owner' ? 'admin' : tenantUser.role) as 'admin' | 'manager' | 'agent' | 'viewer' | 'superadmin',
      };
    } catch (error: any) {
      logger.error("[AuthService] Error verifying user session", { userId, tenantId, error });
      return null;
    }
  },

  /**
   * Authentifie une requête HTTP à partir du cookie de session JWT.
   *
   * SÉCURITÉ CRITIQUE : Le tenantId et le userId sont EXCLUSIVEMENT résolus depuis
   * le JWT signé et la base de données. Les headers HTTP `x-user-id` et `x-tenant-id`
   * sont ignorés pour prévenir toute usurpation d'identité ou élévation de privilèges.
   */
  async authenticateRequest(req: Request): Promise<{ user: AuthenticatedUser; tenantId: number } | null> {
    const sessionCookie = req.cookies?.[COOKIE_NAME] || req.signedCookies?.[COOKIE_NAME];
    const session = await sdk.verifySession(sessionCookie);

    if (!session) {
      return null;
    }

    // ✅ BLOC 1: Mode démo supprimé — authentification toujours via la vraie DB

    // Résolution de l'utilisateur depuis le JWT (openId) via la DB uniquement
    const user = await db.getUserByOpenId(session.openId);
    if (!user) {
      return null;
    }

    // Superadmin global : accès cross-tenant, pas de tenantId spécifique
    if (user.role === 'superadmin') {
      const superAdminUser: AuthenticatedUser = {
        ...user,
        tenantId: -1,
        role: 'superadmin',
      };
      return { user: superAdminUser, tenantId: -1 };
    }

    // Utilisateur standard : récupérer son premier tenant actif depuis la DB
    // Le tenantId est résolu depuis la DB, jamais depuis un header HTTP client
    const userTenants = await db.getUserTenants(user.id);
    const activeTenant = userTenants.find(t => t.isActive);

    if (!activeTenant) {
      logger.warn("[AuthService] User has no active tenant", { userId: user.id, openId: session.openId });
      return null;
    }

    const authenticatedUser = await AuthService.verifyUserSession(user.id, activeTenant.id);
    if (!authenticatedUser) {
      return null;
    }

    return { user: authenticatedUser, tenantId: authenticatedUser.tenantId };
  },
};
