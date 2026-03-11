import { DatabaseClient } from "./client.types";

export async function getDatabase(): Promise<DatabaseClient> {
  throw new Error("SQLite недоступен в Web-режиме для текущей конфигурации MVP.");
}
