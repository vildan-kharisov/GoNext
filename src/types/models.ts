export interface Place {
  id: number;
  name: string;
  description: string | null;
  visitLater: boolean;
  liked: boolean;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export interface PlacePhoto {
  id: number;
  placeId: number;
  uri: string;
  createdAt: string;
}

export interface Trip {
  id: number;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  createdAt: string;
}

export interface TripPlace {
  id: number;
  tripId: number;
  placeId: number;
  orderIndex: number;
  visited: boolean;
  visitDate: string | null;
  notes: string | null;
}

export interface TripPlacePhoto {
  id: number;
  tripPlaceId: number;
  uri: string;
  createdAt: string;
}
