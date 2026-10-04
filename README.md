# Sermon AI

Sermon AI is a Next.js application for generating structured or AI-assisted
sermon notes from YouTube transcripts.

## Requirements

- Node.js 22.18 or newer
- PostgreSQL 15 or newer

## Database setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your
   PostgreSQL connection string. Keep credentials out of source control.
3. Create the database named in `DATABASE_URL` if it does not exist. Prisma
   initializes tables inside a database; it does not create the database
   itself. For the example URL, run `createdb sermonai` or create it in pgAdmin.
4. Emit the Prisma 8 contract:

   ```bash
   npx prisma contract emit
   ```

5. Preview the additive database changes before applying them:

   ```bash
   npx prisma db init --dry-run
   ```

6. When the preview is correct, initialize the database:

   ```bash
   npx prisma db init
   ```

`db init` creates missing structures from the contract and signs the database.
It does not drop or rewrite existing structures; incompatible changes stop with
an error. To check the database later, run `npx prisma db verify`.

The contract is in `src/prisma/contract.prisma`. It defines the YouTube URL and
video ID, sermon metadata, status, and creation/update timestamps. The generated
`contract.json` and `contract.d.ts` are required by the PostgreSQL runtime and
should be committed after each contract change. `src/prisma/db.ts` loads the
Temporal polyfill required by Prisma 8 timestamp fields on Node.js versions
that do not provide `Temporal` globally.

The typed database client is exported from `src/prisma/db.ts`. The current
sermon API routes do not yet read or write sermon records; this setup provides
the PostgreSQL contract and runtime without changing the app's current
behavior.

## Run the app

```bash
npm run dev
```
