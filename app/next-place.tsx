import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Button, Card, List, Text } from "react-native-paper";
import { AppScreen } from "../src/components/AppScreen";
import { StateBlock } from "../src/components/StateBlock";
import {
  getCurrentTrip,
  getNextTripPlace,
  listTrips,
  setCurrentTrip,
  type NextTripPlaceResult,
} from "../src/database";
import { Trip } from "../src/types/models";

export default function NextPlaceScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [currentTrip, setCurrentTripState] = useState<Trip | null>(null);
  const [nextPlace, setNextPlace] = useState<NextTripPlaceResult | null>(null);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);

  const loadData = useCallback(async () => {
    try {
      setErrorText(null);
      const activeTrip = await getCurrentTrip();
      setCurrentTripState(activeTrip);

      if (!activeTrip) {
        setNextPlace(null);
        setAllTrips(await listTrips());
        return;
      }

      const next = await getNextTripPlace(activeTrip.id);
      setNextPlace(next);
      setAllTrips([]);
    } catch (error) {
      console.error("Failed to load next place", error);
      setErrorText("Не удалось загрузить следующее место.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      void loadData();
    }, [loadData])
  );

  const coords = useMemo(() => {
    if (!nextPlace?.place) {
      return null;
    }
    const { latitude, longitude } = nextPlace.place;
    if (latitude == null || longitude == null) {
      return null;
    }
    return `${latitude}, ${longitude}`;
  }, [nextPlace]);

  const openMap = async () => {
    if (!coords) {
      setErrorText("У следующего места не заполнены координаты.");
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${coords}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      setErrorText("Не удалось открыть карту.");
      return;
    }

    await Linking.openURL(url);
  };

  const openNavigator = async () => {
    if (!coords) {
      setErrorText("У следующего места не заполнены координаты.");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords}&travelmode=driving`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      setErrorText("Не удалось открыть навигатор.");
      return;
    }

    await Linking.openURL(url);
  };

  const setTripAsCurrent = async (tripId: number) => {
    try {
      await setCurrentTrip(tripId);
      setIsLoading(true);
      await loadData();
    } catch (error) {
      console.error("Failed to set current trip", error);
      setErrorText("Не удалось выбрать текущую поездку.");
    }
  };

  return (
    <AppScreen
      title="Следующее место"
      canGoBack
      actions={[{ icon: "refresh", onPress: () => void loadData() }]}
    >
      <View style={styles.content}>
        {isLoading ? (
          <StateBlock title="Загрузка..." />
        ) : !currentTrip ? (
          <Card style={styles.card}>
            <Card.Title title="Нет текущей поездки" />
            <Card.Content style={styles.section}>
              <Text variant="bodyLarge">
                Выберите поездку как текущую, чтобы определить следующее место.
              </Text>
              {allTrips.length === 0 ? (
                <>
                  <Text variant="bodyMedium">Сначала создайте поездку.</Text>
                  <Button mode="contained" onPress={() => router.push("/trips")}>
                    Перейти в поездки
                  </Button>
                </>
              ) : (
                allTrips.map((trip) => (
                  <List.Item
                    key={trip.id}
                    title={trip.title}
                    description={trip.description || "Без описания"}
                    left={(props) => <List.Icon {...props} icon="map-marker-path" />}
                    right={() => (
                      <Button mode="text" onPress={() => void setTripAsCurrent(trip.id)}>
                        Сделать текущей
                      </Button>
                    )}
                  />
                ))
              )}
            </Card.Content>
          </Card>
        ) : !nextPlace ? (
          <Card style={styles.card}>
            <Card.Title title="Маршрут завершён" subtitle={currentTrip.title} />
            <Card.Content style={styles.section}>
              <Text variant="bodyLarge">
                В текущей поездке все места уже отмечены как посещённые.
              </Text>
              <Button mode="contained" onPress={() => router.push(`/trip/${currentTrip.id}`)}>
                Открыть поездку
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Title title={nextPlace.place.name} subtitle={currentTrip.title} />
            <Card.Content style={styles.section}>
              <Text variant="bodyMedium">
                {nextPlace.place.description || "Описание отсутствует."}
              </Text>
              <Text variant="bodyMedium">
                Порядок в маршруте: {nextPlace.tripPlace.orderIndex + 1}
              </Text>
              <Text variant="bodyMedium">
                Координаты: {coords ?? "не указаны"}
              </Text>
              <View style={styles.actions}>
                <Button mode="contained" onPress={openMap} disabled={!coords}>
                  Открыть на карте
                </Button>
                <Button mode="outlined" onPress={openNavigator} disabled={!coords}>
                  Открыть в навигаторе
                </Button>
                <Button mode="text" onPress={() => router.push(`/trip/${currentTrip.id}`)}>
                  Открыть поездку
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    gap: 12,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  section: {
    gap: 10,
  },
  actions: {
    gap: 8,
  },
  errorText: {
    marginTop: 10,
    color: "#B00020",
  },
});
