import { Platform } from "react-native";
import { getDatabase } from "./client";
import { migrations } from "./migrations";

let initializationPromise: Promise<void> | null = null;

export function initializeDatabase(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = runInitialization();
  }

  return initializationPromise;
}

async function runInitialization(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  const db = await getDatabase();
  await db.execAsync("PRAGMA foreign_keys = ON;");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const appliedRows = await db.getAllAsync<{ version: number }>(
    "SELECT version FROM schema_migrations;"
  );
  const applied = new Set(appliedRows.map((row) => row.version));

  for (const migration of migrations) {
    if (applied.has(migration.version)) {
      continue;
    }

    await db.withTransactionAsync(async () => {
      for (const statement of migration.statements) {
        await db.execAsync(statement);
      }

      await db.runAsync(
        "INSERT INTO schema_migrations (version) VALUES (?);",
        migration.version
      );
    });
  }
}
