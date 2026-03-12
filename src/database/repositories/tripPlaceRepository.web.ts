import { TripPlace, TripPlacePhoto } from "../../types/models";
import { getPlaceById } from "./placeRepository";

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

interface TripPlacesWebState {
  tripPlaces: TripPlace[];
  tripPlacePhotos: TripPlacePhoto[];
  nextTripPlaceId: number;
  nextTripPlacePhotoId: number;
}

const STORAGE_KEY = "gonext_trip_places_web_state_v1";

function getDefaultState(): TripPlacesWebState {
  return {
    tripPlaces: [],
    tripPlacePhotos: [],
    nextTripPlaceId: 1,
    nextTripPlacePhotoId: 1,
  };
}

function loadState(): TripPlacesWebState {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultState();
    }
    const parsed = JSON.parse(raw) as TripPlacesWebState;
    return {
      tripPlaces: parsed.tripPlaces ?? [],
      tripPlacePhotos: parsed.tripPlacePhotos ?? [],
      nextTripPlaceId: parsed.nextTripPlaceId ?? 1,
      nextTripPlacePhotoId: parsed.nextTripPlacePhotoId ?? 1,
    };
  } catch {
    return getDefaultState();
  }
}

function saveState(state: TripPlacesWebState): void {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function listTripPlaces(tripId: number): Promise<TripPlace[]> {
  const state = loadState();
  return state.tripPlaces
    .filter((item) => item.tripId === tripId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function addTripPlace(input: CreateTripPlaceInput): Promise<number> {
  const place = await getPlaceById(input.placeId);
  if (!place) {
    throw new Error("Место не найдено.");
  }

  const state = loadState();
  const id = state.nextTripPlaceId++;
  state.tripPlaces.push({
    id,
    tripId: input.tripId,
    placeId: input.placeId,
    orderIndex: input.orderIndex,
    visited: input.visited ?? false,
    visitDate: input.visitDate ?? null,
    notes: input.notes ?? null,
  });
  saveState(state);
  return id;
}

export async function updateTripPlace(
  id: number,
  input: UpdateTripPlaceInput
): Promise<boolean> {
  const state = loadState();
  const index = state.tripPlaces.findIndex((item) => item.id === id);
  if (index < 0) {
    return false;
  }

  const current = state.tripPlaces[index];
  state.tripPlaces[index] = {
    ...current,
    orderIndex:
      input.orderIndex === undefined ? current.orderIndex : input.orderIndex,
    visited: input.visited === undefined ? current.visited : input.visited,
    visitDate: input.visitDate === undefined ? current.visitDate : input.visitDate,
    notes: input.notes === undefined ? current.notes : input.notes,
  };
  saveState(state);
  return true;
}

export async function deleteTripPlace(id: number): Promise<boolean> {
  const state = loadState();
  const before = state.tripPlaces.length;
  state.tripPlaces = state.tripPlaces.filter((item) => item.id !== id);
  state.tripPlacePhotos = state.tripPlacePhotos.filter(
    (photo) => photo.tripPlaceId !== id
  );
  saveState(state);
  return state.tripPlaces.length !== before;
}

export async function getNextTripPlace(
  tripId: number
): Promise<NextTripPlaceResult | null> {
  const list = await listTripPlaces(tripId);
  const candidate = list.find((item) => !item.visited);
  if (!candidate) {
    return null;
  }

  const place = await getPlaceById(candidate.placeId);
  if (!place) {
    return null;
  }

  return {
    tripPlace: candidate,
    place: {
      id: place.id,
      name: place.name,
      description: place.description,
      latitude: place.latitude,
      longitude: place.longitude,
    },
  };
}

export async function addTripPlacePhoto(
  tripPlaceId: number,
  uri: string
): Promise<number> {
  const state = loadState();
  const exists = state.tripPlaces.some((item) => item.id === tripPlaceId);
  if (!exists) {
    throw new Error("Пункт маршрута не найден.");
  }

  const id = state.nextTripPlacePhotoId++;
  state.tripPlacePhotos.push({
    id,
    tripPlaceId,
    uri,
    createdAt: new Date().toISOString(),
  });
  saveState(state);
  return id;
}

export async function listTripPlacePhotos(
  tripPlaceId: number
): Promise<TripPlacePhoto[]> {
  const state = loadState();
  return state.tripPlacePhotos
    .filter((photo) => photo.tripPlaceId === tripPlaceId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
