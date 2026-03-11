import { getDatabase } from "../client";
import { Trip } from "../../types/models";

interface TripRow {
  id: number;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  current: number;
  created_at: string;
}

export interface CreateTripInput {
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
}

export interface UpdateTripInput {
  title?: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
}

function mapTrip(row: TripRow): Trip {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    current: row.current === 1,
    createdAt: row.created_at,
  };
}

export async function listTrips(): Promise<Trip[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TripRow>(
    "SELECT * FROM trips ORDER BY created_at DESC;"
  );
  return rows.map(mapTrip);
}

export async function getTripById(id: number): Promise<Trip | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TripRow>(
    "SELECT * FROM trips WHERE id = ?;",
    id
  );
  return row ? mapTrip(row) : null;
}

export async function getCurrentTrip(): Promise<Trip | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TripRow>(
    "SELECT * FROM trips WHERE current = 1 ORDER BY created_at DESC LIMIT 1;"
  );
  return row ? mapTrip(row) : null;
}

export async function createTrip(input: CreateTripInput): Promise<number> {
  const db = await getDatabase();

  if (input.current) {
    await db.runAsync("UPDATE trips SET current = 0 WHERE current = 1;");
  }

  const result = await db.runAsync(
    `INSERT INTO trips (title, description, start_date, end_date, current)
     VALUES (?, ?, ?, ?, ?);`,
    input.title,
    input.description ?? null,
    input.startDate ?? null,
    input.endDate ?? null,
    input.current ? 1 : 0
  );

  return Number(result.lastInsertRowId);
}

export async function updateTrip(
  id: number,
  input: UpdateTripInput
): Promise<boolean> {
  const db = await getDatabase();
  const existing = await getTripById(id);
  if (!existing) {
    return false;
  }

  if (input.current) {
    await db.runAsync("UPDATE trips SET current = 0 WHERE current = 1;");
  }

  const result = await db.runAsync(
    `UPDATE trips
     SET title = ?, description = ?, start_date = ?, end_date = ?, current = ?
     WHERE id = ?;`,
    input.title ?? existing.title,
    input.description ?? existing.description,
    input.startDate ?? existing.startDate,
    input.endDate ?? existing.endDate,
    input.current === undefined ? (existing.current ? 1 : 0) : input.current ? 1 : 0,
    id
  );

  return result.changes > 0;
}

export async function setCurrentTrip(id: number): Promise<boolean> {
  const db = await getDatabase();
  const existing = await getTripById(id);
  if (!existing) {
    return false;
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync("UPDATE trips SET current = 0 WHERE current = 1;");
    await db.runAsync("UPDATE trips SET current = 1 WHERE id = ?;", id);
  });

  return true;
}

export async function deleteTrip(id: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync("DELETE FROM trips WHERE id = ?;", id);
  return result.changes > 0;
}
