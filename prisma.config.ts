import { definePrismaConfig } from "@prisma/cli-engine";
import { defineConfig } from "@prisma/orm-postgres/config";

// The prisma.config.ts is used by Prisma CLI for project configuration.
// In Prisma 8, use these commands instead of legacy Prisma 7:
//   prisma contract emit    — generate contract.d.ts + contract.json (replaces `prisma generate`)
//   prisma contract format  — format the PSL source (replaces `prisma format`)
//   prisma db update        — push schema to database
//   prisma migration plan   — create a new migration
//   prisma migration track  — apply planned migrations

export default definePrismaConfig({
  orm: defineConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: process.env.DATABASE_URL!,
    },
  }),
});
