import { z } from "zod";
import { router, publicProcedure } from "../procedures";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, SESSION_DURATION_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import { getUserByEmail } from "../db";
import { verifyPassword } from "../services/passwordService";
import { logger } from "../infrastructure/logger";

export const authRouter = router({
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    return ctx.user;
  }),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      try {
        const user = await getUserByEmail(email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Identifiants invalides" });
        }
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Identifiants invalides" });
        }
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name ?? "",
          expiresInMs: SESSION_DURATION_MS,
        });
        if (ctx.res && ctx.req) {
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SESSION_DURATION_MS });
        }
        return { user, token: sessionToken };
      } catch (error: any) {
        logger.error("[Auth] Login error", { error: error.message });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la connexion: " + error.message });
      }
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    if (ctx.res && ctx.req) {
      // ✅ CORRECTION: Révocation du JWT dans Redis avant suppression du cookie
      const sessionCookie = ctx.req.cookies?.[COOKIE_NAME] || ctx.req.signedCookies?.[COOKIE_NAME];
      if (sessionCookie) {
        await sdk.revokeToken(sessionCookie);
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
    }
    return { success: true };
  }),
});
