import { getDatabase } from "../client";

export async function resetAllData(): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await db.execAsync("DELETE FROM trip_place_photos;");
    await db.execAsync("DELETE FROM trip_places;");
    await db.execAsync("DELETE FROM trips;");
    await db.execAsync("DELETE FROM place_photos;");
    await db.execAsync("DELETE FROM places;");
  });
}
