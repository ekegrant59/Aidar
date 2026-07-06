import { Global, Module, Logger } from "@nestjs/common";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./schema";

export const DB = Symbol("AIDAR_DB");
export type Database = PostgresJsDatabase<typeof schema>;

/**
 * Global DB provider. When DATABASE_URL is absent (e.g. early local dev) the
 * provider resolves to `null` so the waitlist can still accept submissions
 * (logged) without a database. Services must handle the null case.
 */
@Global()
@Module({
  providers: [
    {
      provide: DB,
      useFactory: (): Database | null => {
        const url = process.env.DATABASE_URL;
        if (!url) {
          Logger.warn(
            "DATABASE_URL not set; waitlist persistence disabled (submissions will be logged only).",
            "DbModule",
          );
          return null;
        }
        const client = postgres(url, { max: 10, idle_timeout: 20, prepare: false });
        Logger.log("Connected to Postgres", "DbModule");
        return drizzle(client, { schema });
      },
    },
  ],
  exports: [DB],
})
export class DbModule {}
