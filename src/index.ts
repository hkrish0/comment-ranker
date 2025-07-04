import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc';
import { initDB } from './db/client';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  await initDB();
  const app = express();

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter(),
      createContext: () => ({}),
    }),
  );

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 tRPC server listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
