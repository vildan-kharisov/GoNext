import { Place, PlacePhoto } from "../../types/models";

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

interface PlacesWebState {
  places: Place[];
  photos: PlacePhoto[];
  nextPlaceId: number;
  nextPhotoId: number;
}

const STORAGE_KEY = "gonext_places_web_state_v1";

function getDefaultState(): PlacesWebState {
  return {
    places: [],
    photos: [],
    nextPlaceId: 1,
    nextPhotoId: 1,
  };
}

function loadState(): PlacesWebState {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultState();
    }

    const parsed = JSON.parse(raw) as PlacesWebState;
    return {
      places: parsed.places ?? [],
      photos: parsed.photos ?? [],
      nextPlaceId: parsed.nextPlaceId ?? 1,
      nextPhotoId: parsed.nextPhotoId ?? 1,
    };
  } catch {
    return getDefaultState();
  }
}

function saveState(state: PlacesWebState): void {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function listPlaces(): Promise<Place[]> {
  const state = loadState();
  return [...state.places].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPlaceById(id: number): Promise<Place | null> {
  const state = loadState();
  return state.places.find((place) => place.id === id) ?? null;
}

export async function createPlace(input: CreatePlaceInput): Promise<number> {
  const state = loadState();
  const id = state.nextPlaceId++;

  const place: Place = {
    id,
    name: input.name,
    description: input.description ?? null,
    visitLater: input.visitLater ?? false,
    liked: input.liked ?? false,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    createdAt: new Date().toISOString(),
  };

  state.places.push(place);
  saveState(state);
  return id;
}

export async function updatePlace(
  id: number,
  input: UpdatePlaceInput
): Promise<boolean> {
  const state = loadState();
  const index = state.places.findIndex((place) => place.id === id);
  if (index < 0) {
    return false;
  }

  const current = state.places[index];
  state.places[index] = {
    ...current,
    name: input.name ?? current.name,
    description:
      input.description === undefined ? current.description : input.description,
    visitLater: input.visitLater ?? current.visitLater,
    liked: input.liked ?? current.liked,
    latitude: input.latitude === undefined ? current.latitude : input.latitude,
    longitude:
      input.longitude === undefined ? current.longitude : input.longitude,
  };

  saveState(state);
  return true;
}

export async function deletePlace(id: number): Promise<boolean> {
  const state = loadState();
  const before = state.places.length;
  state.places = state.places.filter((place) => place.id !== id);
  state.photos = state.photos.filter((photo) => photo.placeId !== id);
  saveState(state);
  return state.places.length !== before;
}

export async function addPlacePhoto(placeId: number, uri: string): Promise<number> {
  const state = loadState();
  const exists = state.places.some((place) => place.id === placeId);
  if (!exists) {
    throw new Error("Место не найдено.");
  }

  const id = state.nextPhotoId++;
  state.photos.push({
    id,
    placeId,
    uri,
    createdAt: new Date().toISOString(),
  });
  saveState(state);
  return id;
}

export async function listPlacePhotos(placeId: number): Promise<PlacePhoto[]> {
  const state = loadState();
  return state.photos
    .filter((photo) => photo.placeId === placeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
