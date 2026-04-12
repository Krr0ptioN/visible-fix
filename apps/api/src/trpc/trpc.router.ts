import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// tRPC is currently kept as a minimal experimental surface.
// MVP client integrations use REST endpoints under /api/v1.
export const appRouter = router({
  health: publicProcedure.query(() => ({ status: 'ok' as const })),
});

export type AppRouter = typeof appRouter;
