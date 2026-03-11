import { getDatabase } from "../client";
import { Place, PlacePhoto } from "../../types/models";

interface PlaceRow {
  id: number;
  name: string;
  description: string | null;
  visit_later: number;
  liked: number;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

interface PlacePhotoRow {
  id: number;
  place_id: number;
  uri: string;
  created_at: string;
}

export interface CreatePlaceInput {
  name: string;
  description?: string | null;
  visitLater?: boolean;
  liked?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdatePlaceInput {
  name?: string;
  description?: string | null;
  visitLater?: boolean;
  liked?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

function mapPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    visitLater: row.visit_later === 1,
    liked: row.liked === 1,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
  };
}

function mapPlacePhoto(row: PlacePhotoRow): PlacePhoto {
  return {
    id: row.id,
    placeId: row.place_id,
    uri: row.uri,
    createdAt: row.created_at,
  };
}

export async function listPlaces(): Promise<Place[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PlaceRow>(
    "SELECT * FROM places ORDER BY created_at DESC;"
  );
  return rows.map(mapPlace);
}

export async function getPlaceById(id: number): Promise<Place | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PlaceRow>(
    "SELECT * FROM places WHERE id = ?;",
    id
  );
  return row ? mapPlace(row) : null;
}

export async function createPlace(input: CreatePlaceInput): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO places (name, description, visit_later, liked, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?);`,
    input.name,
    input.description ?? null,
    input.visitLater ? 1 : 0,
    input.liked ? 1 : 0,
    input.latitude ?? null,
    input.longitude ?? null
  );
  return Number(result.lastInsertRowId);
}

export async function updatePlace(
  id: number,
  input: UpdatePlaceInput
): Promise<boolean> {
  const db = await getDatabase();
  const existing = await getPlaceById(id);
  if (!existing) {
    return false;
  }

  const result = await db.runAsync(
    `UPDATE places
     SET name = ?, description = ?, visit_later = ?, liked = ?, latitude = ?, longitude = ?
     WHERE id = ?;`,
    input.name ?? existing.name,
    input.description ?? existing.description,
    input.visitLater === undefined ? (existing.visitLater ? 1 : 0) : input.visitLater ? 1 : 0,
    input.liked === undefined ? (existing.liked ? 1 : 0) : input.liked ? 1 : 0,
    input.latitude ?? existing.latitude,
    input.longitude ?? existing.longitude,
    id
  );

  return result.changes > 0;
}

export async function deletePlace(id: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync("DELETE FROM places WHERE id = ?;", id);
  return result.changes > 0;
}

export async function addPlacePhoto(placeId: number, uri: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    "INSERT INTO place_photos (place_id, uri) VALUES (?, ?);",
    placeId,
    uri
  );
  return Number(result.lastInsertRowId);
}

export async function listPlacePhotos(placeId: number): Promise<PlacePhoto[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PlacePhotoRow>(
    "SELECT * FROM place_photos WHERE place_id = ? ORDER BY created_at DESC;",
    placeId
  );
  return rows.map(mapPlacePhoto);
}
