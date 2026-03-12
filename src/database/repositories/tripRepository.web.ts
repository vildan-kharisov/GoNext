import { Trip } from "../../types/models";

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

interface TripsWebState {
  trips: Trip[];
  nextTripId: number;
}

const STORAGE_KEY = "gonext_trips_web_state_v1";

function getDefaultState(): TripsWebState {
  return { trips: [], nextTripId: 1 };
}

function loadState(): TripsWebState {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultState();
    }
    const parsed = JSON.parse(raw) as TripsWebState;
    return {
      trips: parsed.trips ?? [],
      nextTripId: parsed.nextTripId ?? 1,
    };
  } catch {
    return getDefaultState();
  }
}

function saveState(state: TripsWebState): void {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function listTrips(): Promise<Trip[]> {
  const state = loadState();
  return [...state.trips].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTripById(id: number): Promise<Trip | null> {
  const state = loadState();
  return state.trips.find((trip) => trip.id === id) ?? null;
}

export async function getCurrentTrip(): Promise<Trip | null> {
  const state = loadState();
  return state.trips.find((trip) => trip.current) ?? null;
}

export async function createTrip(input: CreateTripInput): Promise<number> {
  const state = loadState();
  const id = state.nextTripId++;

  if (input.current) {
    state.trips = state.trips.map((trip) => ({ ...trip, current: false }));
  }

  state.trips.push({
    id,
    title: input.title,
    description: input.description ?? null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    current: input.current ?? false,
    createdAt: new Date().toISOString(),
  });

  saveState(state);
  return id;
}

export async function updateTrip(id: number, input: UpdateTripInput): Promise<boolean> {
  const state = loadState();
  const index = state.trips.findIndex((trip) => trip.id === id);
  if (index < 0) {
    return false;
  }

  if (input.current) {
    state.trips = state.trips.map((trip) => ({ ...trip, current: false }));
  }

  const current = state.trips[index];
  state.trips[index] = {
    ...current,
    title: input.title ?? current.title,
    description:
      input.description === undefined ? current.description : input.description,
    startDate: input.startDate === undefined ? current.startDate : input.startDate,
    endDate: input.endDate === undefined ? current.endDate : input.endDate,
    current: input.current === undefined ? current.current : input.current,
  };

  saveState(state);
  return true;
}

export async function setCurrentTrip(id: number): Promise<boolean> {
  const state = loadState();
  const exists = state.trips.some((trip) => trip.id === id);
  if (!exists) {
    return false;
  }

  state.trips = state.trips.map((trip) => ({
    ...trip,
    current: trip.id === id,
  }));
  saveState(state);
  return true;
}

export async function deleteTrip(id: number): Promise<boolean> {
  const state = loadState();
  const before = state.trips.length;
  state.trips = state.trips.filter((trip) => trip.id !== id);
  saveState(state);
  return state.trips.length !== before;
}
