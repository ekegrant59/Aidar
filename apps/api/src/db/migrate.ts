import path from "path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

/**
 * Runtime migrator. Applies the committed SQL migrations in apps/api/drizzle
 * using drizzle-orm's built-in migrator (a production dependency), so it runs
 * inside the slim runtime image where drizzle-kit (dev) is not present.
 *
 *   node apps/api/dist/db/migrate.js
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required to run migrations");

  const migrationsFolder = path.resolve(__dirname, "../../drizzle");
  // eslint-disable-next-line no-console
  console.log(`[migrate] applying migrations from ${migrationsFolder}`);

  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder });
  await sql.end();

  // eslint-disable-next-line no-console
  console.log("[migrate] done");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[migrate] failed", err);
  process.exit(1);
});
