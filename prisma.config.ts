import dotenv from "dotenv";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as defineOrmConfig } from "@prisma/orm-postgres/config";

dotenv.config({ path: [".env.local", ".env"] });

export default definePrismaConfig({
  orm: defineOrmConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: process.env.DATABASE_URL!,
    },
  }),
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});
