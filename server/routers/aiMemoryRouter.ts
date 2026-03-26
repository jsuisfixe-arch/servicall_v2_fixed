/**
 * aiMemoryRouter - Stub router (TODO: implement)
 * ✅ BLOC 1: ping utilise publicProcedure (pas de données tenant-spécifiques)
 */
import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';

export const aiMemoryRouter = router({
  ping: publicProcedure
    .input(z.object({}).optional())
    .query(async () => ({ status: 'ok' })),
});
