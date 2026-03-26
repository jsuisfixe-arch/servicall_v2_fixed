/**
 * whatsappRouter - Stub router (TODO: implement)
 */
import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';

export const whatsappRouter = router({
  ping: publicProcedure
    .input(z.object({}).optional())
    .query(async () => ({ status: 'ok' })),
});
