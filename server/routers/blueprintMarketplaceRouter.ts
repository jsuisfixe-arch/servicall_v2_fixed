/**
 * blueprintMarketplaceRouter - Stub router (TODO: implement)
 */
import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

export const blueprintMarketplaceRouter = router({
  ping: protectedProcedure
    .input(z.object({}).optional())
    .query(async () => ({ status: 'ok' })),
});
