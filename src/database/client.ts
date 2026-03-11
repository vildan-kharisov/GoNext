import * as SQLite from "expo-sqlite";
import { DatabaseClient } from "./client.types";

const DATABASE_NAME = "gonext.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<DatabaseClient> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return dbPromise;
}
