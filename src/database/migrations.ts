export interface Migration {
  version: number;
  statements: string[];
}

export const migrations: Migration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS places (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        visit_later INTEGER NOT NULL DEFAULT 1 CHECK (visit_later IN (0, 1)),
        liked INTEGER NOT NULL DEFAULT 0 CHECK (liked IN (0, 1)),
        latitude REAL,
        longitude REAL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`,
      "CREATE INDEX IF NOT EXISTS idx_places_name ON places(name);",

      `CREATE TABLE IF NOT EXISTS place_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        place_id INTEGER NOT NULL,
        uri TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY(place_id) REFERENCES places(id) ON DELETE CASCADE
      );`,
      "CREATE INDEX IF NOT EXISTS idx_place_photos_place_id ON place_photos(place_id);",

      `CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        start_date TEXT,
        end_date TEXT,
        current INTEGER NOT NULL DEFAULT 0 CHECK (current IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );`,
      "CREATE INDEX IF NOT EXISTS idx_trips_current ON trips(current);",

      `CREATE TABLE IF NOT EXISTS trip_places (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        place_id INTEGER NOT NULL,
        order_index INTEGER NOT NULL CHECK (order_index >= 0),
        visited INTEGER NOT NULL DEFAULT 0 CHECK (visited IN (0, 1)),
        visit_date TEXT,
        notes TEXT,
        FOREIGN KEY(trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY(place_id) REFERENCES places(id) ON DELETE RESTRICT,
        UNIQUE(trip_id, order_index)
      );`,
      "CREATE INDEX IF NOT EXISTS idx_trip_places_trip_id ON trip_places(trip_id);",
      "CREATE INDEX IF NOT EXISTS idx_trip_places_trip_visited ON trip_places(trip_id, visited, order_index);",

      `CREATE TABLE IF NOT EXISTS trip_place_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_place_id INTEGER NOT NULL,
        uri TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY(trip_place_id) REFERENCES trip_places(id) ON DELETE CASCADE
      );`,
      "CREATE INDEX IF NOT EXISTS idx_trip_place_photos_trip_place_id ON trip_place_photos(trip_place_id);",
    ],
  },
];
