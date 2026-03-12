const STORAGE_KEYS = [
  "gonext_places_web_state_v1",
  "gonext_trips_web_state_v1",
  "gonext_trip_places_web_state_v1",
];

export async function resetAllData(): Promise<void> {
  for (const key of STORAGE_KEYS) {
    globalThis.localStorage?.removeItem(key);
  }
}
