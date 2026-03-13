import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Button, Card, List, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      setErrorText(t("nextPlace.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

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
      setErrorText(t("nextPlace.noCoords"));
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${coords}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      setErrorText(t("nextPlace.openMapError"));
      return;
    }

    await Linking.openURL(url);
  };

  const openNavigator = async () => {
    if (!coords) {
      setErrorText(t("nextPlace.noCoords"));
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords}&travelmode=driving`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      setErrorText(t("nextPlace.openNavigatorError"));
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
      setErrorText(t("nextPlace.setCurrentError"));
    }
  };

  return (
    <AppScreen
      title={t("nextPlace.title")}
      canGoBack
      actions={[{ icon: "refresh", onPress: () => void loadData() }]}
    >
      <View style={styles.content}>
        {isLoading ? (
          <StateBlock title={t("common.loading")} />
        ) : !currentTrip ? (
          <Card style={styles.card}>
            <Card.Title title={t("nextPlace.noCurrentTrip")} />
            <Card.Content style={styles.section}>
              <Text variant="bodyLarge">
                {t("nextPlace.noCurrentTripDescription")}
              </Text>
              {allTrips.length === 0 ? (
                <>
                  <Text variant="bodyMedium">{t("nextPlace.noTrips")}</Text>
                  <Button mode="contained" onPress={() => router.push("/trips")}>
                    {t("nextPlace.goToTrips")}
                  </Button>
                </>
              ) : (
                allTrips.map((trip) => (
                  <List.Item
                    key={trip.id}
                    title={trip.title}
                    description={trip.description || t("common.noDescription")}
                    left={(props) => <List.Icon {...props} icon="map-marker-path" />}
                    right={() => (
                      <Button mode="text" onPress={() => void setTripAsCurrent(trip.id)}>
                        {t("nextPlace.makeCurrent")}
                      </Button>
                    )}
                  />
                ))
              )}
            </Card.Content>
          </Card>
        ) : !nextPlace ? (
          <Card style={styles.card}>
            <Card.Title title={t("nextPlace.routeCompleted")} subtitle={currentTrip.title} />
            <Card.Content style={styles.section}>
              <Text variant="bodyLarge">
                {t("nextPlace.routeCompletedDescription")}
              </Text>
              <Button mode="contained" onPress={() => router.push(`/trip/${currentTrip.id}`)}>
                {t("nextPlace.openTrip")}
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Title title={nextPlace.place.name} subtitle={currentTrip.title} />
            <Card.Content style={styles.section}>
              <Text variant="bodyMedium">
                {nextPlace.place.description || t("nextPlace.noPlaceDescription")}
              </Text>
              <Text variant="bodyMedium">
                {t("nextPlace.routeOrder", { order: nextPlace.tripPlace.orderIndex + 1 })}
              </Text>
              <Text variant="bodyMedium">
                {t("nextPlace.coordinates", { coords: coords ?? t("nextPlace.noCoordinates") })}
              </Text>
              <View style={styles.actions}>
                <Button mode="contained" onPress={openMap} disabled={!coords}>
                  {t("nextPlace.openOnMap")}
                </Button>
                <Button mode="outlined" onPress={openNavigator} disabled={!coords}>
                  {t("nextPlace.openInNavigator")}
                </Button>
                <Button mode="text" onPress={() => router.push(`/trip/${currentTrip.id}`)}>
                  {t("nextPlace.openTrip")}
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
