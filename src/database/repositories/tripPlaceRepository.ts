import { getDatabase } from "../client";
import { TripPlace, TripPlacePhoto } from "../../types/models";

interface TripPlaceRow {
  id: number;
  trip_id: number;
  place_id: number;
  order_index: number;
  visited: number;
  visit_date: string | null;
  notes: string | null;
}

interface NextTripPlaceRow extends TripPlaceRow {
  place_name: string;
  place_description: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface TripPlacePhotoRow {
  id: number;
  trip_place_id: number;
  uri: string;
  created_at: string;
}

export interface CreateTripPlaceInput {
  tripId: number;
  placeId: number;
  orderIndex: number;
  visited?: boolean;
  visitDate?: string | null;
  notes?: string | null;
}

export interface UpdateTripPlaceInput {
  orderIndex?: number;
  visited?: boolean;
  visitDate?: string | null;
  notes?: string | null;
}

export interface NextTripPlaceResult {
  tripPlace: TripPlace;
  place: {
    id: number;
    name: string;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
  };
}

function mapTripPlacePhoto(row: TripPlacePhotoRow): TripPlacePhoto {
  return {
    id: row.id,
    tripPlaceId: row.trip_place_id,
    uri: row.uri,
    createdAt: row.created_at,
  };
}

function mapTripPlace(row: TripPlaceRow): TripPlace {
  return {
    id: row.id,
    tripId: row.trip_id,
    placeId: row.place_id,
    orderIndex: row.order_index,
    visited: row.visited === 1,
    visitDate: row.visit_date,
    notes: row.notes,
  };
}

export async function listTripPlaces(tripId: number): Promise<TripPlace[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TripPlaceRow>(
    "SELECT * FROM trip_places WHERE trip_id = ? ORDER BY order_index ASC;",
    tripId
  );
  return rows.map(mapTripPlace);
}

export async function addTripPlace(input: CreateTripPlaceInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO trip_places (trip_id, place_id, order_index, visited, visit_date, notes)
     VALUES (?, ?, ?, ?, ?, ?);`,
    input.tripId,
    input.placeId,
    input.orderIndex,
    input.visited ? 1 : 0,
    input.visitDate ?? null,
    input.notes ?? null
  );
  return Number(result.lastInsertRowId);
}

export async function updateTripPlace(
  id: number,
  input: UpdateTripPlaceInput
): Promise<boolean> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<TripPlaceRow>(
    "SELECT * FROM trip_places WHERE id = ?;",
    id
  );

  if (!existing) {
    return false;
  }

  const result = await db.runAsync(
    `UPDATE trip_places
     SET order_index = ?, visited = ?, visit_date = ?, notes = ?
     WHERE id = ?;`,
    input.orderIndex ?? existing.order_index,
    input.visited === undefined ? existing.visited : input.visited ? 1 : 0,
    input.visitDate ?? existing.visit_date,
    input.notes ?? existing.notes,
    id
  );

  return result.changes > 0;
}

export async function deleteTripPlace(id: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync("DELETE FROM trip_places WHERE id = ?;", id);
  return result.changes > 0;
}

export async function getNextTripPlace(
  tripId: number
): Promise<NextTripPlaceResult | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<NextTripPlaceRow>(
    `SELECT
      tp.*,
      p.name as place_name,
      p.description as place_description,
      p.latitude,
      p.longitude
     FROM trip_places tp
     JOIN places p ON p.id = tp.place_id
     WHERE tp.trip_id = ? AND tp.visited = 0
     ORDER BY tp.order_index ASC
     LIMIT 1;`,
    tripId
  );

  if (!row) {
    return null;
  }

  return {
    tripPlace: mapTripPlace(row),
    place: {
      id: row.place_id,
      name: row.place_name,
      description: row.place_description,
      latitude: row.latitude,
      longitude: row.longitude,
    },
  };
}

export async function addTripPlacePhoto(
  tripPlaceId: number,
  uri: string
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    "INSERT INTO trip_place_photos (trip_place_id, uri) VALUES (?, ?);",
    tripPlaceId,
    uri
  );
  return Number(result.lastInsertRowId);
}

export async function listTripPlacePhotos(
  tripPlaceId: number
): Promise<TripPlacePhoto[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TripPlacePhotoRow>(
    "SELECT * FROM trip_place_photos WHERE trip_place_id = ? ORDER BY created_at DESC;",
    tripPlaceId
  );
  return rows.map(mapTripPlacePhoto);
}
