import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export type AppRouter = ReturnType<typeof appRouter>;

// Lazy import to avoid hoisting issues
export const appRouter = () =>
  router({
    comment: commentRouter,
  });

// Import at bottom to avoid circular
import { commentRouter } from './routes/commentRouter';
